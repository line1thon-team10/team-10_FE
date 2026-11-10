import { useEffect, useState, type ComponentType, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown, Clock, MapPin, Menu, Phone, Quote, ShieldCheck, Star, X } from "lucide-react";
import { usePage, type SectionProps } from "./context";
import { stylePack, langCode } from "./theme";
import { A, Band, Btn, Card, Container, Head, Honeypot, Slot, arr, cn, hasImg, isBot, postForm, rv, safeHref, str, strs, tel } from "./ui";
import { EXTRA_ALTERNATING, EXTRA_RENDERERS } from "./extra";
import { mapPin } from "./facts";

/* 各区块的渲染。页面只有一个 h1(首屏)，各区块用 h2，条目用 h3；图片都带 alt；内容一开始就可见（动效只是锦上添花，见 flash.css）。
   颜色/字体/圆角全部来自主题变量（主题色 × 风格包，见 theme.ts），换主题色或风格整页跟着变。 */

/* ───────────────────────── 导航 ───────────────────────── */

function Navbar({ brand, links, cta }: SectionProps) {
  const { ctaHref, phone, ui, style } = usePage();
  const variant = stylePack(style).nav;
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const name = str(brand);
  const items = arr(links).slice(0, 5);
  const call = tel(phone);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const link = (l: Record<string, any>, i: number) => (
    <A key={i} to={l.href} className="rounded-btn px-3.5 py-2 text-[15px] font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
      {str(l.label)}
    </A>
  );
  const logo = (
    <A to="/home" className="flex items-center gap-3 text-xl font-bold tracking-tight">
      <span className="font-display grid size-9 place-items-center rounded-btn bg-primary text-base text-primary-foreground" aria-hidden>
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="font-display">{name}</span>
    </A>
  );
  const half = Math.ceil(items.length / 2);
  const row = (
    <>
      {variant === "center" ? <nav className="hidden items-center gap-1 md:flex">{items.slice(0, half).map(link)}</nav> : null}
      {logo}
      {variant !== "center" ? <nav className="hidden items-center gap-1 md:flex">{items.map(link)}</nav> : null}
      <div className={cn("flex items-center gap-3", variant === "center" && "md:justify-end")}>
        {variant === "center" ? <nav className="hidden items-center gap-1 md:flex">{items.slice(half).map((l, i) => link(l, i + half))}</nav> : null}
        {call ? (
          <a href={call} className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-foreground hover:text-primary lg:inline-flex">
            <Phone className="size-4 text-primary" />
            {str(phone)}
          </a>
        ) : null}
        {cta ? <Btn to={ctaHref} label={str(cta)} size="md" className="hidden whitespace-nowrap sm:inline-flex" /> : null}
        <button type="button" className="grid size-11 place-items-center rounded-btn hover:bg-muted md:hidden" aria-expanded={open} aria-label={str(ui.menu) || name} onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </>
  );
  const rowCls = cn("flex items-center justify-between gap-4", variant === "center" ? "h-[68px] md:grid md:h-20 md:grid-cols-[1fr_auto_1fr]" : "h-[68px]");
  return (
    <header className={cn("flash-header", variant === "float" && "flash-header-float", stuck && "is-stuck")}>
      {variant === "float" ? (
        <div className="mx-auto w-full max-w-5xl flash-nav-pill">
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">{row}</div>
        </div>
      ) : (
        <Container className={rowCls}>{row}</Container>
      )}
      {open ? (
        <nav className="absolute inset-x-0 top-full z-40 flex flex-col border-b border-border bg-background px-5 pb-4 shadow-lift md:hidden">
          {items.map((l, i) => (
            <A key={i} to={l.href} className="rounded-btn px-3 py-3.5 text-lg font-medium hover:bg-muted" onClick={() => setOpen(false)}>
              {str(l.label)}
            </A>
          ))}
          {call ? (
            <a href={call} className="mt-1 flex items-center gap-2 rounded-btn px-3 py-3.5 text-lg font-semibold text-primary">
              <Phone className="size-5" />
              {str(phone)}
            </a>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

/* ───────────────────────── 首屏 ───────────────────────── */

type HeroProps = SectionProps;

function HeroActions({ primaryCta, secondaryCta, onDark, className }: { primaryCta?: unknown; secondaryCta?: unknown; onDark: boolean; className?: string }) {
  const { ctaHref } = usePage();
  return (
    <div className={cn("mt-2 flex flex-wrap gap-3", className)}>
      {primaryCta ? <Btn to={ctaHref} label={str(primaryCta)} variant={onDark ? "onDeep" : "primary"} /> : null}
      {secondaryCta ? <Btn to={ctaHref} label={str(secondaryCta)} variant={onDark ? "onDeepOutline" : "outline"} /> : null}
    </div>
  );
}

/** 内页(关于/服务/联系)没有首屏大图：用紧凑的页头——面包屑 + 标题 + 一句话 + 按钮，不渲染空盒子。 */
function PageHeader({ title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  const { style, ui, navLabel } = usePage();
  const onDark = stylePack(style).heroTone === "deep";
  return (
    <section className={cn(onDark ? "flash-deep" : "flash-tint", "relative overflow-hidden py-14 md:py-20")}>
      <Container>
        <div className="max-w-3xl">
          <nav aria-label="breadcrumb" className={cn("mb-4 flex items-center gap-2 text-sm", onDark ? "text-white/75" : "text-muted-foreground")}>
            <A to="/home" className="hover:underline">
              {str(ui.home) || "Home"}
            </A>
            <span aria-hidden>/</span>
            <span className="truncate">{navLabel || str(title)}</span>
          </nav>
          <h1 className="text-4xl leading-[1.08] md:text-6xl">{str(title)}</h1>
          <p className={cn("mt-5 max-w-2xl text-lg md:text-xl", onDark ? "text-white/85" : "text-muted-foreground")}>{str(subtitle)}</p>
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} onDark={onDark} className="mt-7" />
        </div>
      </Container>
    </section>
  );
}

const heroCls = (showImg: boolean) => cn("text-5xl leading-[1.05] md:text-6xl", showImg ? "lg:text-[4.1rem]" : "lg:text-7xl");

/** 首页 hero：版式由风格包决定(见 theme.ts 的 hero)；没有 hero 图时每种版式都退成纯文字版，不留空盒子。 */
function Hero(props: HeroProps) {
  const { eyebrow, title, subtitle, primaryCta, secondaryCta } = props;
  const { images, kind, style } = usePage();
  const pack = stylePack(style);
  const showImg = hasImg(images.hero);
  if (kind !== "home" && !showImg) return <PageHeader {...props} />;
  const actions = (onDark: boolean, className?: string) => <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} onDark={onDark} className={className} />;
  const heroImg = <Slot img={images.hero} priority sizes="(min-width:1024px) 50vw, 100vw" />;

  // 整幅照片：照片做背景，遮罩让文字可读，底部留出空间给浮起来的信任条。
  // 文字位置(左/居中/左下)、遮罩、标签样式由风格包和 flash.css 决定。
  if (pack.hero === "fullbleed" && showImg) {
    const center = pack.heroAlign === "center";
    const end = pack.heroAlign === "end";
    return (
      <section className={cn("relative isolate overflow-hidden text-white", style === "rugged" && "flash-hero-cut", style === "organic" && "flash-hero-curve")}>
        <div className="flash-hero-photo absolute inset-0 -z-20">
          <Slot img={images.hero} priority sizes="100vw" />
        </div>
        <div className={cn(center ? "flash-hero-center-overlay" : "flash-hero-overlay", end && "flash-hero-overlay-end", "absolute inset-0 -z-10")} aria-hidden />
        <Container className={cn("flex min-h-[580px] flex-col py-20 pb-28 md:min-h-[680px] md:py-28 md:pb-36", end ? "justify-end" : "justify-center", center && "items-center text-center")}>
          <div className={cn("flex flex-col gap-6", center ? "max-w-4xl items-center" : end ? "max-w-5xl items-start" : "max-w-3xl items-start")}>
            {eyebrow ? <span className="flash-hero-eyebrow rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">{str(eyebrow)}</span> : null}
            <h1 className={end ? "text-6xl leading-[.92] md:text-[7.5rem]" : "text-5xl leading-[1.04] md:text-7xl"}>{str(title)}</h1>
            <p className={cn("max-w-xl text-lg text-white/90 md:text-xl", center && "max-w-2xl")}>{str(subtitle)}</p>
            {actions(true, center ? "justify-center" : undefined)}
          </div>
        </Container>
      </section>
    );
  }

  // 左深色面板 + 右整幅图（企业）
  if (pack.hero === "panel") {
    return (
      <section className="relative isolate overflow-hidden">
        <div className={cn("grid", showImg && "lg:grid-cols-2")}>
          <div className="flash-deep flex items-center">
            <div className={cn("flex w-full flex-col items-start gap-6 px-5 py-16 md:px-10 md:py-24 lg:px-16", showImg ? "lg:max-w-[40rem] lg:ms-auto" : "mx-auto max-w-4xl")}>
              {eyebrow ? <span className="border-s-4 border-white/70 ps-3 text-sm font-semibold uppercase tracking-[.14em] text-white/85">{str(eyebrow)}</span> : null}
              <h1 className="text-4xl leading-[1.08] md:text-5xl lg:text-6xl">{str(title)}</h1>
              <p className="max-w-xl text-lg text-white/85 md:text-xl">{str(subtitle)}</p>
              {actions(true)}
            </div>
          </div>
          {showImg ? <div className="relative min-h-[320px] lg:min-h-[600px]">{heroImg}</div> : null}
        </div>
      </section>
    );
  }

  // 照片 + 内框 + 居中大字（奢华 / 复古）
  if (pack.hero === "framed") {
    return (
      <section className={cn("relative isolate overflow-hidden text-white", !showImg && "flash-deep")}>
        {showImg ? (
          <>
            <div className="absolute inset-0 -z-20">
              <Slot img={images.hero} priority sizes="100vw" />
            </div>
            <div className="flash-hero-center-overlay absolute inset-0 -z-10" aria-hidden />
          </>
        ) : null}
        <div className="flash-frame" aria-hidden />
        <Container className="flex min-h-[600px] flex-col items-center justify-center gap-6 py-28 text-center md:min-h-[740px]">
          {eyebrow ? <span className="text-xs font-semibold uppercase tracking-[.3em] text-white/80 md:text-sm">{str(eyebrow)}</span> : null}
          <h1 className="max-w-4xl text-5xl leading-[1.05] md:text-7xl">{str(title)}</h1>
          <p className="max-w-2xl text-lg text-white/85 md:text-xl">{str(subtitle)}</p>
          {actions(true, "justify-center")}
        </Container>
      </section>
    );
  }

  // 拱形照片（温暖 / 自然）
  if (pack.hero === "arch") {
    return (
      <section className="flash-tint relative isolate overflow-hidden">
        <div className="absolute -start-24 -top-24 -z-10 size-[420px] rounded-full bg-primary/10" aria-hidden />
        <div className="absolute -bottom-32 -end-20 -z-10 size-[360px] rounded-full bg-primary/10" aria-hidden />
        <Container className={cn("grid items-center gap-12 py-16 md:py-24", showImg && "lg:grid-cols-[1.1fr_.9fr] lg:gap-20")}>
          <div className={cn("flex flex-col items-start gap-6", !showImg && "max-w-3xl")}>
            {eyebrow ? <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">{str(eyebrow)}</span> : null}
            <h1 className={heroCls(showImg)}>{str(title)}</h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">{str(subtitle)}</p>
            {actions(false)}
          </div>
          {showImg ? (
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -bottom-4 -end-4 size-full rounded-t-[999px] rounded-b-card border-2 border-primary/30" aria-hidden />
              <div className={cn("flash-arch flash-img relative overflow-hidden rounded-t-[999px] rounded-b-card shadow-lift", pack.heroAspect)}>{heroImg}</div>
            </div>
          ) : null}
        </Container>
      </section>
    );
  }

  // 杂志：顶部细线 + 超大标题，下面左文右图（创意 / 摄影 / 媒体 / 个人品牌）
  if (pack.hero === "editorial") {
    return (
      <section className="relative border-b border-foreground">
        <Container className="py-10 md:py-16">
          <div className="flex items-center gap-4 border-t-2 border-foreground pt-3 text-xs font-semibold uppercase tracking-[.2em] md:text-sm">{eyebrow ? <span>{str(eyebrow)}</span> : null}</div>
          <h1 className="mt-6 text-[clamp(3.1rem,10.5vw,9rem)] leading-[.92]">{str(title)}</h1>
          <div className={cn("mt-10 grid gap-10 md:mt-14", showImg && "md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-14")}>
            <div className="flex flex-col items-start gap-6">
              <p className="max-w-md text-lg leading-relaxed md:text-xl">{str(subtitle)}</p>
              {actions(false)}
            </div>
            {showImg ? <div className={cn("flash-img relative overflow-hidden", pack.heroAspect)}>{heroImg}</div> : null}
          </div>
        </Container>
      </section>
    );
  }

  // 深色光晕 + 网格 + 应用窗口图（科技）
  if (pack.hero === "window") {
    return (
      <section className="flash-deep relative isolate overflow-hidden">
        <Container className="flex flex-col items-center gap-6 pb-16 pt-20 text-center md:pb-24 md:pt-28">
          {eyebrow ? <span className="flash-mono rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary md:text-sm">{str(eyebrow)}</span> : null}
          <h1 className="flash-gradient-text max-w-4xl text-5xl leading-[1.04] md:text-7xl">{str(title)}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">{str(subtitle)}</p>
          {actions(false, "justify-center")}
          {showImg ? (
            <div className="relative mt-10 w-full max-w-5xl">
              <div className="absolute inset-x-12 -bottom-8 -z-10 h-24 rounded-full bg-primary/30 blur-3xl" aria-hidden />
              <div className="flash-img overflow-hidden rounded-card border border-white/10 bg-card/70 backdrop-blur">
                <div className="flex gap-1.5 border-b border-white/10 px-4 py-3" aria-hidden>
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                </div>
                <div className={cn("relative", pack.heroAspect)}>{heroImg}</div>
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    );
  }

  // 居中大字 + 贴纸徽章 + 斜框图（俏皮）
  if (pack.hero === "centered") {
    return (
      <section className="flash-tint relative isolate overflow-hidden">
        <div className="absolute -start-20 top-10 -z-10 size-72 rounded-full bg-primary/15" aria-hidden />
        <div className="absolute -end-16 bottom-6 -z-10 size-80 rounded-full bg-primary/10" aria-hidden />
        <Container className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
          {eyebrow ? <span className="-rotate-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold shadow-card">{str(eyebrow)}</span> : null}
          <h1 className="max-w-4xl text-5xl leading-[1.05] md:text-7xl">{str(title)}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">{str(subtitle)}</p>
          {actions(false, "justify-center")}
          {showImg ? <div className={cn("flash-img relative mt-8 w-full max-w-4xl overflow-hidden rounded-card", pack.heroAspect)}>{heroImg}</div> : null}
        </Container>
      </section>
    );
  }

  // 左文右图：深色(品牌渐变)或浅色(品牌淡染)，由风格包决定；没有图时退成单栏文字
  const onDark = pack.heroTone === "deep";
  return (
    <section className={cn(onDark ? "flash-deep" : "flash-tint", "relative isolate overflow-hidden")}>
      {onDark ? (
        <>
          <div className="absolute -right-40 -top-40 -z-10 size-[560px] rounded-full bg-white/[.06]" aria-hidden />
          <div className="absolute -bottom-48 -left-32 -z-10 size-[460px] rounded-full bg-white/[.04]" aria-hidden />
        </>
      ) : null}
      <Container className={cn("grid items-center gap-12 py-16 pb-28 md:py-24 md:pb-32", showImg && "lg:grid-cols-[1.05fr_.95fr] lg:gap-16")}>
        <div className={cn("flex flex-col items-start gap-6", !showImg && "max-w-3xl")}>
          {eyebrow ? (
            <span className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", onDark ? "border border-white/25 bg-white/10" : "bg-primary/10 text-primary")}>{str(eyebrow)}</span>
          ) : null}
          <h1 className={heroCls(showImg)}>{str(title)}</h1>
          <p className={cn("max-w-xl text-lg md:text-xl", onDark ? "text-white/85" : "text-muted-foreground")}>{str(subtitle)}</p>
          {actions(onDark)}
        </div>
        {showImg ? (
          <div className="relative">
            {!onDark ? <div className="absolute -bottom-5 -start-5 size-full rounded-card bg-primary/15" aria-hidden /> : null}
            <div className={cn("flash-img relative overflow-hidden rounded-card shadow-lift", pack.heroAspect, onDark && "ring-1 ring-white/25")}>{heroImg}</div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/** 信任条：左文右图/整幅照片的版式下浮在首屏底部成一张卡；其它版式 hero 不留重叠，就是一条细带。 */
function Trust({ items }: SectionProps) {
  const { style } = usePage();
  const hero = stylePack(style).hero;
  const pull = hero === "fullbleed" || hero === "split";
  const list = strs(items).slice(0, 5).map((t) => {
    const star = t.startsWith("★");
    return (
      <li key={t} className="flex items-center gap-2.5 text-[15px] font-semibold md:text-base">
        {star ? <Star className="size-5 fill-amber-400 text-amber-400" /> : <ShieldCheck className="size-5 text-primary" />}
        {star ? t.replace(/^★\s*/, "") : t}
      </li>
    );
  });
  if (!pull) {
    return (
      <div className="border-b border-border bg-muted/50">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 md:justify-between">{list}</ul>
        </Container>
      </div>
    );
  }
  return (
    <div className="relative z-10 -mt-12 pb-12 md:-mt-14 md:pb-16">
      <Container>
        <ul className="grid grid-cols-1 gap-3 rounded-card border border-border bg-card px-6 py-5 shadow-lift sm:grid-cols-2 md:flex md:flex-wrap md:items-center md:justify-between md:gap-x-10 md:px-10 md:py-6">{list}</ul>
      </Container>
    </div>
  );
}

/** 数据条：只有真是数字的才用大字号展示；「Same-day / Walk-in」这类文字不是数据，退成对勾列表，避免大字换行难看 */
function Stats({ items, tone }: SectionProps) {
  const list = arr(items).slice(0, 4);
  const numeric = list.filter((s) => /\d/.test(str(s.value)) && str(s.value).length <= 10);
  if (numeric.length < 2) {
    return (
      <Band tone={tone} className="py-12 md:py-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s, i) => (
            <li key={i} {...rv(i)} className="flex items-start gap-3 rounded-card border border-border bg-card p-5 shadow-card">
              <span className="mt-0.5 grid size-7 flex-none place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span>
                <b className="font-display block text-lg leading-tight">{str(s.value)}</b>
                <span className="text-sm text-muted-foreground">{str(s.label)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Band>
    );
  }
  return (
    <Band tone={tone} className="py-14 md:py-20">
      <dl className="grid grid-cols-2 gap-y-10 text-center md:grid-flow-col md:auto-cols-fr md:divide-x md:divide-border">
        {numeric.map((s, i) => (
          <div key={i} {...rv(i)} className="px-4">
            <dd className="font-display whitespace-nowrap text-4xl text-primary tabular-nums md:text-6xl">{str(s.value)}</dd>
            <dt className="mt-2 text-base font-medium text-muted-foreground">{str(s.label)}</dt>
          </div>
        ))}
      </dl>
    </Band>
  );
}

/* ───────────────────────── 内容区块 ───────────────────────── */

// 便当式网格：按条目数排固定的跨列方案(6 列网格)，每一行都铺满，不会出现空洞；第一项用主色底做主打卖点
const BENTO_SPANS: Record<number, number[]> = { 4: [4, 2, 2, 4], 5: [3, 3, 2, 2, 2], 6: [4, 2, 2, 4, 3, 3] };
const SPAN_CLS: Record<number, string> = { 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" };

function Features({ title, subtitle, items, tone, layout }: SectionProps) {
  const list = arr(items).slice(0, 6);
  const mode = str(layout);
  const spans = mode === "bento" ? BENTO_SPANS[list.length] : undefined;
  return (
    <Band id="features" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      {mode === "rows" ? (
        // 行式列表：适合「服务的行业 / 能力清单」这类条目多、说明短的内容
        <ul className="divide-y divide-border border-y border-border">
          {list.map((f, i) => (
            <li key={i} {...rv(i)} className="grid items-center gap-3 py-6 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-8">
              <span className="grid size-12 place-items-center rounded-btn bg-primary/10 text-2xl leading-none" aria-hidden>
                {str(f.icon)}
              </span>
              <h3 className="text-xl md:text-2xl">{str(f.title)}</h3>
              <p className="leading-relaxed text-muted-foreground">{str(f.description)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn("grid gap-5 lg:gap-6", spans ? "sm:grid-cols-2 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {list.map((f, i) => {
            const hero = spans && i === 0;
            return (
              <Card key={i} className={cn("flash-lift flex flex-col gap-4", spans && SPAN_CLS[spans[i]], hero && "flash-card-hi border-transparent bg-primary text-primary-foreground")} {...rv(i)}>
                <span className={cn("grid size-14 place-items-center rounded-btn text-3xl leading-none", hero ? "bg-white/15" : "bg-primary/10")} aria-hidden>
                  {str(f.icon)}
                </span>
                <h3 className={cn("text-xl", hero && "md:text-3xl")}>{str(f.title)}</h3>
                <p className={cn("leading-relaxed", hero ? "text-primary-foreground/85 md:text-lg" : "text-muted-foreground")}>{str(f.description)}</p>
              </Card>
            );
          })}
        </div>
      )}
    </Band>
  );
}

/** 服务列表:由组装代码根据实际生成的服务页拼出(不是模型写的)，每项链接到对应的服务页。 */
function ServiceLinks({ title, more, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 6);
  return (
    <Band id="our-services" tone={tone}>
      <Head title={title} />
      <ul className={cn("grid gap-5 sm:grid-cols-2 lg:gap-6", list.length === 3 && "lg:grid-cols-3")}>
        {list.map((s, i) => (
          <li key={i} {...rv(i)}>
            <A to={s.href} className="group block h-full">
              <Card className="flash-lift flex h-full flex-col gap-3 group-hover:border-primary/50">
                <h3 className="text-xl">{str(s.name)}</h3>
                {s.summary ? <p className="leading-relaxed text-muted-foreground">{str(s.summary)}</p> : null}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-semibold text-primary">
                  {str(more)}
                  <ArrowRight className="size-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </Card>
            </A>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** 特点展示：左右交替的大图文行。每行有图用图，没图用图标面板。 */
function Showcase({ title, subtitle, items, tone }: SectionProps) {
  const { images } = usePage();
  const list = arr(items).slice(0, 4);
  const slots = ["showcase", "showcase2", "showcase3", "showcase4"];
  return (
    <Band id="showcase" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div className="flex flex-col gap-16 md:gap-28">
        {list.map((it, i) => {
          const img = images[slots[i]];
          return (
            <div key={i} className={cn("grid items-center gap-8 md:grid-cols-2 md:gap-16", i % 2 === 1 && "md:[&>*:first-child]:order-2")}>
              <div {...rv()}>
                {hasImg(img) ? (
                  <div className="flash-img relative aspect-[5/4] overflow-hidden rounded-card shadow-lift ring-1 ring-border">
                    <Slot img={img} sizes="(min-width:768px) 45vw, 100vw" />
                  </div>
                ) : (
                  <div className="flash-deep relative grid aspect-[5/4] place-items-center overflow-hidden rounded-card shadow-lift" aria-hidden>
                    <span className="font-display absolute start-7 top-5 text-6xl text-white/15 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-8xl leading-none">{str(it.icon)}</span>
                  </div>
                )}
              </div>
              <div {...rv(1)} className="flex flex-col gap-4">
                <span className="flash-bar" aria-hidden />
                <h3 className="text-2xl md:text-4xl">{str(it.title)}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{str(it.description)}</p>
                {strs(it.points).length > 0 && (
                  <ul className="mt-2 flex flex-col gap-3">
                    {strs(it.points).slice(0, 3).map((p) => (
                      <li key={p} className="flex items-start gap-3 font-medium">
                        <span className="mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Band>
  );
}

function Steps({ title, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 5);
  return (
    <Band tone={tone}>
      <Head title={title} />
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr">
        {list.map((s, i) => (
          <li key={i} {...rv(i)} className="border-t-2 border-primary pt-5">
            <span className="font-display text-5xl text-primary/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-xl">{str(s.title)}</h3>
            <p className="mt-2 text-muted-foreground">{str(s.description)}</p>
          </li>
        ))}
      </ol>
    </Band>
  );
}

/** 文字块：有图就左图右文，没图就居中单栏（不再留空盒子） */
function TextBlock({ title, body, tone }: SectionProps) {
  const { images } = usePage();
  const withImg = hasImg(images.textblock);
  return (
    <Band tone={tone}>
      <div className={cn("grid items-center gap-10 md:gap-16", withImg ? "md:grid-cols-2" : "mx-auto max-w-3xl")}>
        {withImg ? (
          <div {...rv()} className="flash-img relative aspect-[4/3] overflow-hidden rounded-card shadow-lift ring-1 ring-border">
            <Slot img={images.textblock} sizes="(min-width:768px) 45vw, 100vw" />
          </div>
        ) : null}
        <div {...rv(1)} className="flex flex-col gap-5">
          <span className="flash-bar" aria-hidden />
          <h2 className="text-3xl leading-tight md:text-[2.6rem]">{str(title)}</h2>
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{str(body)}</p>
        </div>
      </div>
    </Band>
  );
}

function Pricing({ title, subtitle, plans, tone }: SectionProps) {
  const { ctaHref } = usePage();
  const list = arr(plans).slice(0, 3);
  return (
    <Band id="pricing" tone={tone}>
      <Head title={title} subtitle={subtitle} center />
      <div className={cn("mx-auto grid items-stretch gap-6", list.length === 2 ? "max-w-3xl md:grid-cols-2" : "md:grid-cols-3")}>
        {list.map((p, i) => {
          const hi = Boolean(p.highlighted);
          return (
            <Card key={i} {...rv(i)} className={cn("flex flex-col gap-6", hi && "flash-card-hi border-transparent bg-primary text-primary-foreground shadow-lift md:-translate-y-3")}>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl">{str(p.name)}</h3>
                <div className="flex items-baseline gap-2">
                  <span className={cn("font-display tabular-nums", str(p.price).length > 8 ? "text-3xl md:text-4xl" : "text-5xl")}>{str(p.price)}</span>
                  {p.period ? <small className={cn("text-sm", hi ? "text-primary-foreground/75" : "text-muted-foreground")}>{str(p.period)}</small> : null}
                </div>
              </div>
              <ul className="flex flex-1 flex-col gap-3">
                {strs(p.features).slice(0, 8).map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className={cn("mt-1 size-4 flex-none", hi ? "text-primary-foreground" : "text-primary")} strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
              <Btn to={ctaHref} label={str(p.cta)} variant={hi ? "inverse" : "outline"} className="w-full" />
            </Card>
          );
        })}
      </div>
    </Band>
  );
}

const initials = (n: string) => n.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase() || "•";

function Testimonials({ title, score, summary, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 6);
  const hasScore = Boolean(str(score)) && Number.isFinite(Number(str(score)));
  return (
    <Band id="reviews" tone={tone}>
      <Head title={title} />
      <div className={cn("grid gap-6", hasScore && "lg:grid-cols-[260px_1fr]")}>
        {hasScore ? (
          <div {...rv()} className="flex flex-col justify-center gap-3 rounded-card bg-primary p-8 text-primary-foreground shadow-lift">
            <span className="font-display text-7xl leading-none tabular-nums">{str(score)}</span>
            <span className="flex gap-1 text-amber-300" role="img" aria-label={`${str(score)} / 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </span>
            {summary ? <span className="text-primary-foreground/80">{str(summary)}</span> : null}
          </div>
        ) : null}
        <div className={cn("grid gap-6", list.length > 1 && (hasScore ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"))}>
          {list.map((t, i) => (
            <Card key={i} {...rv(i)}>
              <figure className="flex h-full flex-col gap-5">
                <Quote className="size-8 text-primary/40" aria-hidden />
                <blockquote className="flex-1 text-lg leading-relaxed">{str(t.quote)}</blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground" aria-hidden>
                    {initials(str(t.name))}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <cite className="font-semibold not-italic">{str(t.name)}</cite>
                    {t.role ? <small className="text-muted-foreground">{str(t.role)}</small> : null}
                  </span>
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
      </div>
    </Band>
  );
}

function Guarantee({ title, text, perks }: SectionProps) {
  return (
    <section className="flash-tint border-y border-border py-14 md:py-20">
      <Container {...rv()} className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
        <span className="grid size-20 flex-none place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden>
          <ShieldCheck className="size-10" />
        </span>
        <div>
          <h2 className="text-3xl md:text-4xl">{str(title)}</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{str(text)}</p>
          {strs(perks).length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {strs(perks).slice(0, 3).map((p) => (
                <li key={p} className="flex items-center gap-2 font-medium">
                  <Check className="size-4 text-primary" strokeWidth={3} />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}

function Faq({ title, items, tone }: SectionProps) {
  return (
    <Band tone={tone}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <Head title={title} />
        {/* 原生 details/summary：不需要 JS，答案始终在 HTML 里 */}
        <div className="divide-y divide-border border-y border-border">
          {arr(items).slice(0, 8).map((q, i) => (
            <details key={i} className="group py-5" {...rv(i)}>
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold">
                {str(q.question)}
                <ChevronDown className="size-5 flex-none text-muted-foreground transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{str(q.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </Band>
  );
}

/* ───────────────────────── 位置 / 联系 / 收尾 ───────────────────────── */

// 直接用地址查询，不需要地理编码，也不需要 key；hl 跟站点语言走(否则按访客浏览器语言，会冒出别的语言的地名)
const mapEmbed = (q: string, zoom: number, hl: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=${hl}&output=embed`;
const mapLink = (q: string, hl: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&hl=${hl}`;

/** 位置与营业时间。地址含门牌号就放大到街道级，只有城市/区域就用城市级。 */
function MapSection({ title, subtitle, address, hours, note, tone }: SectionProps) {
  const { lang, address: siteAddress, generated } = usePage();
  const hl = langCode(lang);
  const where = str(address).slice(0, 200);
  // 地图和"查看地图"只按真实位置钉点：地址文字还是模型编的，就退回站点级地址(用户给的城市或地址)，没有就不钉
  const pin = mapPin(where, siteAddress, generated);
  const rows = arr(hours).slice(0, 7);
  return (
    <Band id="location" tone={tone}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Head title={title} subtitle={subtitle} />
          {where ? (
            <address {...rv()} className="not-italic">
              {pin ? (
                <a href={mapLink(pin, hl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-btn border border-border bg-card px-5 py-3 text-base font-semibold shadow-card hover:border-primary/50">
                  <MapPin className="size-5 flex-none text-primary" />
                  {where}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-btn border border-border bg-card px-5 py-3 text-base font-semibold shadow-card">
                  <MapPin className="size-5 flex-none text-primary" />
                  {where}
                </span>
              )}
            </address>
          ) : null}
          {rows.length > 0 && (
            <dl {...rv(1)} className="mt-6 divide-y divide-border overflow-hidden rounded-card border border-border bg-card shadow-card">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="flex items-center gap-2.5 font-semibold">
                    <Clock className="size-4 text-primary" />
                    {str(r.day)}
                  </dt>
                  <dd className="text-muted-foreground tabular-nums">{str(r.time)}</dd>
                </div>
              ))}
            </dl>
          )}
          {note ? <p className="mt-4 text-sm text-muted-foreground">{str(note)}</p> : null}
        </div>
        <div {...rv(1)} className="relative min-h-80 overflow-hidden rounded-card border border-border bg-muted shadow-lift lg:min-h-[440px]">
          {pin ? (
            <iframe title={pin} src={mapEmbed(pin, /\d/.test(pin) ? 15 : 12, hl)} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <MapPin className="size-12" />
            </div>
          )}
        </div>
      </div>
    </Band>
  );
}

const FIELD =
  "h-12 w-full rounded-field border border-border bg-background px-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

// 字段类型：预约、预订这类需要日期/时间/下拉选择的站，由模型在 fields 里写 type；不认识的一律按文本框
const FIELD_TYPES = new Set(["text", "email", "tel", "date", "time", "number"]);

function Contact({ title, subtitle, fields, submit, phone, note }: SectionProps) {
  const { formUrl, ui, style } = usePage();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const list = arr(fields).slice(0, 5);
  const call = tel(phone);
  const dark = stylePack(style).contactTone === "deep";

  // 表单提交到 Readdy 表单接口：字段名就用字段的 label，后台收到的就是可读的「标签 → 内容」；
  // 邮箱字段固定用 "email" 当键（后台靠它识别提交人邮箱）。蜜罐被填就假装成功、不发请求。
  // 没有 formUrl（预览/本地）时只走前端成功提示，不发请求；上线的站点由生成流程保证有 formUrl。
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    if (isBot(form) || !formUrl) {
      setState("done");
      return;
    }
    setState("sending");
    try {
      const data = new FormData(form);
      const body = new URLSearchParams();
      list.forEach((f, i) => {
        const key = str(f.type).toLowerCase() === "email" ? "email" : str(f.label) || `field${i + 1}`;
        body.set(key, str(data.get(`f${i}`)));
      });
      const err = await postForm(formUrl, body);
      if (err !== null) {
        setErrMsg(err);
        setState("error");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setErrMsg("");
      setState("error");
    }
  };

  return (
    <Band id="contact" tone={dark ? "deep" : "tint"}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Head title={title} subtitle={subtitle} invert={dark} />
          {call ? (
            <a
              href={call}
              className={cn("flash-btn inline-flex h-14 items-center gap-3 rounded-btn px-7 text-xl font-bold shadow-card", dark ? "bg-white text-brand-deep hover:bg-white/90" : "bg-primary text-primary-foreground hover:brightness-110")}
            >
              <Phone className="size-5" />
              {str(phone)}
            </a>
          ) : null}
          {note ? <p className={cn("mt-5 text-sm", dark ? "text-white/75" : "text-muted-foreground")}>{str(note)}</p> : null}
        </div>
        <Card className="flash-card-solid text-foreground shadow-lift" {...rv(1)}>
          <form id="contact-form" onSubmit={onSubmit} data-readdy-form className="grid gap-5">
            {list.map((f, i) => {
              const kind = str(f.type).toLowerCase();
              const options = strs(f.options).slice(0, 12);
              const common = { id: `c-${i}`, name: `f${i}` };
              return (
                <div key={i} className="grid gap-2">
                  <label htmlFor={`c-${i}`} className="text-sm font-semibold leading-none">
                    {str(f.label)}
                  </label>
                  {kind === "select" && options.length > 0 ? (
                    <select {...common} required defaultValue="" className={FIELD}>
                      <option value="" disabled>
                        {str(f.placeholder)}
                      </option>
                      {options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : kind === "textarea" ? (
                    <textarea {...common} rows={3} maxLength={500} placeholder={str(f.placeholder)} className={cn(FIELD, "h-auto min-h-24 py-3")} />
                  ) : (
                    <input {...common} type={FIELD_TYPES.has(kind) ? kind : "text"} placeholder={str(f.placeholder)} required className={FIELD} />
                  )}
                </div>
              );
            })}
            <Honeypot />
            <button type="submit" disabled={state === "sending"} className="flash-btn inline-flex h-12 w-full items-center justify-center rounded-btn bg-primary text-base font-semibold text-primary-foreground shadow-card transition hover:brightness-110 disabled:opacity-60">
              {str(submit)}
            </button>
            <p role="status" className={cn("text-sm", state === "error" ? "text-red-600" : "text-primary", state === "idle" || state === "sending" ? "hidden" : "")}>
              {state === "done" ? ui.form_success : state === "error" ? errMsg || ui.form_error : ""}
            </p>
          </form>
        </Card>
      </div>
    </Band>
  );
}

function Cta({ title, subtitle, button }: SectionProps) {
  const { ctaHref, images } = usePage();
  const hasBg = hasImg(images.cta);
  return (
    <section className="flash-deep relative isolate overflow-hidden py-20 text-center md:py-28">
      {hasBg ? (
        <>
          <Slot img={images.cta} className="-z-20" />
          <div className="absolute inset-0 -z-10 bg-brand-deep/85" />
        </>
      ) : (
        <div className="absolute -bottom-40 -end-24 -z-10 size-[420px] rounded-full bg-white/[.05]" aria-hidden />
      )}
      <Container {...rv()} className="flex flex-col items-center gap-6">
        <h2 className="max-w-3xl text-4xl leading-[1.08] md:text-6xl">{str(title)}</h2>
        {subtitle ? <p className="max-w-2xl text-lg text-white/85 md:text-xl">{str(subtitle)}</p> : null}
        {button ? <Btn to={ctaHref} label={str(button)} variant="onDeep" className="mt-2 h-14 px-8" /> : null}
      </Container>
    </section>
  );
}

function Footer({ brand, tagline, links, areas }: SectionProps) {
  const { phone, address, hours } = usePage();
  const call = tel(phone);
  const places = strs(areas).slice(0, 8);
  const year = new Date().getFullYear();
  const showHours = hours.slice(0, 7);
  return (
    <footer className="flash-footer">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:py-16">
        <div>
          <strong className="font-display ft-strong text-2xl">{str(brand)}</strong>
          {tagline ? <p className="ft-muted mt-3 max-w-sm">{str(tagline)}</p> : null}
          {call || address ? (
            <ul className="mt-5 flex flex-col gap-2">
              {call ? (
                <li className="flex items-center gap-2.5">
                  <Phone className="ft-muted size-4" />
                  <a href={call} className="ft-link">
                    {str(phone)}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="flex items-center gap-2.5">
                  <MapPin className="ft-muted size-4" />
                  {str(address)}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <nav className="flex flex-col gap-2.5">
          {arr(links).slice(0, 10).map((l, i) => (
            <A key={i} to={safeHref(l.href)} className="ft-link w-fit">
              {str(l.label)}
            </A>
          ))}
        </nav>
        {showHours.length > 0 ? (
          <dl className="flex flex-col gap-2 text-sm">
            {showHours.map((r, i) => (
              <div key={i} className="ft-line flex justify-between gap-4 border-b pb-2">
                <dt className="ft-muted">{str(r.day)}</dt>
                <dd className="tabular-nums">{str(r.time)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
      {places.length > 0 && (
        <Container>
          <ul className="ft-line flex flex-wrap items-center gap-2 border-t py-6">
            <MapPin className="ft-muted size-4" aria-hidden />
            {places.map((a) => (
              <li key={a} className="ft-line rounded-full border px-3 py-1 text-sm">
                {a}
              </li>
            ))}
          </ul>
        </Container>
      )}
      <div className="ft-line ft-muted border-t py-5 text-center text-sm">
        © {year} {str(brand)}
      </div>
    </footer>
  );
}

/** 手机端底部固定栏：只在手机显示，电话和主按钮随时可点。 */
function StickyBar({ button, phone }: SectionProps) {
  const { ctaHref } = usePage();
  const call = tel(phone);
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-border bg-background/95 p-3 shadow-lift backdrop-blur md:hidden">
      {call ? (
        <a href={call} aria-label={str(phone)} className="grid size-12 flex-none place-items-center rounded-btn border border-border hover:bg-muted">
          <Phone className="size-5" />
        </a>
      ) : null}
      <Btn to={ctaHref} label={str(button)} className="flex-1" />
    </div>
  );
}

export const RENDERERS: Record<string, ComponentType<SectionProps>> = {
  navbar: Navbar,
  hero: Hero,
  trust: Trust,
  stats: Stats,
  features: Features,
  showcase: Showcase,
  steps: Steps,
  textblock: TextBlock,
  pricing: Pricing,
  testimonials: Testimonials,
  guarantee: Guarantee,
  faq: Faq,
  map: MapSection,
  contact: Contact,
  cta: Cta,
  footer: Footer,
  stickybar: StickyBar,
  servicelinks: ServiceLinks,
  ...EXTRA_RENDERERS,
};

// 这些区块的底色在 默认 / 浅灰 之间交替，避免相邻区块糊在一起
export const ALTERNATING = new Set(["stats", "servicelinks", "features", "showcase", "steps", "textblock", "pricing", "testimonials", "faq", "map", ...EXTRA_ALTERNATING]);
