import { useState, type ComponentType, type FormEvent } from "react";
import { ArrowRight, Check, Clock, Mail, MapPin, X } from "lucide-react";
import { usePage, type SectionProps } from "./context";
import { langCode } from "./theme";
import { A, Band, Card, Container, Head, Honeypot, Slot, arr, cn, hasImg, isBot, postForm, rv, str, strs } from "./ui";

/* 商业站常见的其余区块：公告条、品牌墙、案例、团队、图库、对比表、商品卡、菜单/价目表、时间表、时间线、服务区域、邮件订阅。
   和 sections.tsx 一样：纯文本渲染、对 props 防御、颜色/字体/圆角全部来自主题变量。
   这些区块里凡是「事实」(人名、客户、奖项、价格、年份)都由内容(site.json)提供，这里不编造也不写死面向访客的文字。 */

/* ───────────────────────── 公告条 ───────────────────────── */

function Announcement({ text, link }: SectionProps) {
  const { ctaHref } = usePage();
  return (
    <div className="flash-announce bg-primary text-primary-foreground">
      <Container className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2.5 text-center text-sm font-medium">
        <span>{str(text)}</span>
        {link ? (
          <A to={ctaHref} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
            {str(link)}
            <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
          </A>
        ) : null}
      </Container>
    </div>
  );
}

/* ───────────────────────── 合作品牌 / 媒体墙 ───────────────────────── */

/** 纯文字的品牌墙(不用外部 logo 图)：每个名字当作一个字标。 */
function Logos({ title, items }: SectionProps) {
  const list = strs(items).slice(0, 8);
  return (
    <section className="border-b border-border py-10 md:py-14">
      <Container>
        {title ? (
          <p {...rv()} className="mb-7 text-center text-sm font-semibold uppercase tracking-[.16em] text-muted-foreground">
            {str(title)}
          </p>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
          {list.map((n, i) => (
            <li key={i} {...rv(i)} className="font-display text-xl tracking-tight text-foreground/55 transition hover:text-foreground md:text-2xl">
              {n}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ───────────────────────── 案例 ───────────────────────── */

function Cases({ title, subtitle, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 3);
  return (
    <Band id="cases" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div className={cn("grid gap-6", list.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {list.map((c, i) => (
          <Card key={i} {...rv(i)} className="flash-lift flex flex-col gap-4">
            {c.tag ? <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">{str(c.tag)}</span> : null}
            {c.metric ? (
              <div className="flex flex-col">
                <span className="font-display text-5xl leading-none text-primary tabular-nums">{str(c.metric)}</span>
                {c.metricLabel ? <span className="mt-2 text-sm font-medium text-muted-foreground">{str(c.metricLabel)}</span> : null}
              </div>
            ) : null}
            <h3 className="text-xl">{str(c.title)}</h3>
            <p className="leading-relaxed text-muted-foreground">{str(c.summary)}</p>
          </Card>
        ))}
      </div>
    </Band>
  );
}

/* ───────────────────────── 团队 ───────────────────────── */

const initialsOf = (n: string) => n.split(/\s+/).filter((x) => /^\p{L}/u.test(x)).map((x) => x[0]).join("").slice(0, 2).toUpperCase() || "•";

/** 团队：不放照片(不编造人脸)，用首字母头像；没有人名时标题就是职位。 */
function Team({ title, subtitle, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 4);
  return (
    <Band id="team" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <ul className={cn("grid gap-6 sm:grid-cols-2", list.length >= 3 && "lg:grid-cols-3", list.length === 4 && "lg:grid-cols-4")}>
        {list.map((m, i) => {
          const name = str(m.name);
          return (
            <li key={i} {...rv(i)}>
              <Card className="flash-lift flex h-full flex-col items-start gap-4">
                <span className="font-display grid size-20 place-items-center rounded-full bg-primary text-2xl text-primary-foreground" aria-hidden>
                  {initialsOf(name || str(m.role))}
                </span>
                <div>
                  <h3 className="text-xl">{name || str(m.role)}</h3>
                  {name ? <p className="mt-1 text-sm font-semibold text-primary">{str(m.role)}</p> : null}
                </div>
                {m.bio ? <p className="leading-relaxed text-muted-foreground">{str(m.bio)}</p> : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/* ───────────────────────── 图库 / 作品集 ───────────────────────── */

/** 图库：一大两小的拼贴(3 张图)，每张下面压一行说明；图还没出来就用品牌色底 + 说明文字。 */
function Gallery({ title, subtitle, items, tone }: SectionProps) {
  const { images } = usePage();
  const list = arr(items).slice(0, 3);
  const slots = ["gallery", "gallery2", "gallery3"];
  return (
    <Band id="gallery" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-5">
        {list.map((g, i) => {
          const img = images[slots[i]];
          const big = i === 0;
          return (
            <figure key={i} {...rv(i)} className={cn("flash-img group relative isolate overflow-hidden rounded-card shadow-card", big ? "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[460px]" : "aspect-[4/3]")}>
              {hasImg(img) ? (
                <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.04]">
                  <Slot img={img} sizes={big ? "(min-width:768px) 66vw, 100vw" : "(min-width:768px) 33vw, 100vw"} />
                </div>
              ) : (
                <div className="flash-deep absolute inset-0" aria-hidden />
              )}
              <div className="absolute inset-x-0 bottom-0 -z-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-base font-semibold text-white md:p-6 md:text-lg">{str(g.caption)}</figcaption>
            </figure>
          );
        })}
      </div>
    </Band>
  );
}

/* ───────────────────────── 对比表 ───────────────────────── */

function Cell({ v, us }: { v: unknown; us?: boolean }) {
  const { ui } = usePage();
  // 图标旁的读屏文字用站点语言的「是 / 否」(brief.ui)，没有就只当装饰
  if (v === true)
    return (
      <span className={cn("mx-auto grid size-7 place-items-center rounded-full", us ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
        <Check className="size-4" strokeWidth={3} aria-hidden />
        <span className="sr-only">{str(ui.yes)}</span>
      </span>
    );
  if (v === false)
    return (
      <span className="mx-auto grid size-7 place-items-center rounded-full bg-muted text-muted-foreground">
        <X className="size-4" strokeWidth={3} aria-hidden />
        <span className="sr-only">{str(ui.no)}</span>
      </span>
    );
  return <span className={cn("text-sm md:text-base", us && "font-semibold")}>{str(v)}</span>;
}

/** 对比表：第一列特性，第二列我们(主色高亮)，第三列别的方案；手机上整张表可横向滑动。 */
function Comparison({ title, subtitle, us, them, rows, tone }: SectionProps) {
  const list = arr(rows).slice(0, 8);
  return (
    <Band id="comparison" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div {...rv()} className="flash-table-box overflow-x-auto rounded-card border border-border bg-card shadow-card">
        <table className="flash-table w-full min-w-[34rem] border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="w-1/2 text-start font-normal">
                <span className="sr-only">{str(title)}</span>
              </th>
              <th scope="col" className="bg-primary text-center font-display text-lg text-primary-foreground">
                {str(us)}
              </th>
              <th scope="col" className="text-center font-display text-lg text-muted-foreground">
                {str(them)}
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <th scope="row" className="text-start font-medium">
                  {str(r.feature)}
                </th>
                <td className="bg-primary/5 text-center">
                  <Cell v={r.us} us />
                </td>
                <td className="text-center text-muted-foreground">
                  <Cell v={r.them} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Band>
  );
}

/* ───────────────────────── 商品 / 服务卡片 ───────────────────────── */

/** 商品或服务卡片：不带购物车，顶部是品牌色底的大图标，下面名称、说明、价格(给了才显示)和入口。 */
function Products({ title, subtitle, items, tone }: SectionProps) {
  const { ctaHref } = usePage();
  const list = arr(items).slice(0, 6);
  return (
    <Band id="products" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {list.map((p, i) => (
          <li key={i} {...rv(i)}>
            <Card className="flash-lift flex h-full flex-col gap-4 overflow-hidden !p-0">
              <div className="flash-deep relative grid aspect-[4/3] place-items-center" aria-hidden>
                <span className="text-7xl leading-none">{str(p.icon)}</span>
                {p.tag ? <span className="absolute start-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-deep">{str(p.tag)}</span> : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 px-6 pb-6">
                <h3 className="text-xl">{str(p.name)}</h3>
                <p className="flex-1 leading-relaxed text-muted-foreground">{str(p.description)}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  {p.price ? <span className="font-display text-2xl tabular-nums">{str(p.price)}</span> : <span />}
                  {p.cta ? (
                    <A to={ctaHref} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                      {str(p.cta)}
                      <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                    </A>
                  ) : null}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ───────────────────────── 菜单 / 价目表 ───────────────────────── */

/** 菜单或价目表：分类分栏，每项「名称 ········ 价格」加一行说明；价格没给就不显示。 */
function Menu({ title, subtitle, categories, tone }: SectionProps) {
  const cats = arr(categories).slice(0, 3);
  return (
    <Band id="menu" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div className={cn("grid gap-x-16 gap-y-12", cats.length > 1 && "lg:grid-cols-2")}>
        {cats.map((c, ci) => (
          <section key={ci} {...rv(ci)} className={cn(cats.length === 3 && ci === 2 && "lg:col-span-2")}>
            <h3 className="mb-6 border-b-2 border-primary pb-3 text-2xl">{str(c.name)}</h3>
            <ul className="flex flex-col gap-5">
              {arr(c.items).slice(0, 8).map((it, i) => (
                <li key={i}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-semibold">{str(it.name)}</span>
                    {it.price ? (
                      <>
                        <span className="min-w-6 flex-1 translate-y-[-4px] border-b border-dotted border-muted-foreground/50" aria-hidden />
                        <span className="font-display text-lg text-primary tabular-nums">{str(it.price)}</span>
                      </>
                    ) : null}
                  </div>
                  {it.description ? <p className="mt-1 text-muted-foreground">{str(it.description)}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Band>
  );
}

/* ───────────────────────── 时间表 ───────────────────────── */

/** 课程 / 活动时间表：同一天的连续几行只显示一次星期；手机上每行折成两行。 */
function Schedule({ title, subtitle, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 10);
  return (
    <Band id="schedule" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <div {...rv()} className="flash-table-box overflow-hidden rounded-card border border-border bg-card shadow-card">
        <ul className="divide-y divide-border">
          {list.map((r, i) => {
            const day = str(r.day);
            const first = i === 0 || str(list[i - 1].day) !== day;
            return (
              <li key={i} className="grid items-center gap-x-6 gap-y-1 px-5 py-4 md:grid-cols-[9rem_11rem_1fr] md:px-7">
                <span className={cn("font-display text-lg", first ? "text-primary" : "max-md:hidden md:invisible")}>{day}</span>
                <span className="flex items-center gap-2 whitespace-nowrap text-muted-foreground tabular-nums">
                  <Clock className="size-4 flex-none text-primary" aria-hidden />
                  {str(r.time)}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold">{str(r.name)}</span>
                  {r.note ? <span className="text-sm text-muted-foreground">{str(r.note)}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Band>
  );
}

/* ───────────────────────── 时间线 ───────────────────────── */

function Timeline({ title, subtitle, items, tone }: SectionProps) {
  const list = arr(items).slice(0, 6);
  return (
    <Band id="timeline" tone={tone}>
      <Head title={title} subtitle={subtitle} />
      <ol className="relative mx-auto max-w-3xl border-s-2 border-border ps-8 md:ps-12">
        {list.map((t, i) => (
          <li key={i} {...rv(i)} className="relative pb-12 last:pb-0">
            <span className="absolute -start-[2.65rem] top-1.5 size-4 rounded-full border-4 border-background bg-primary ring-2 ring-primary/30 md:-start-[3.65rem]" aria-hidden />
            <span className="font-display text-lg text-primary">{str(t.label)}</span>
            <h3 className="mt-1 text-xl md:text-2xl">{str(t.title)}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{str(t.description)}</p>
          </li>
        ))}
      </ol>
    </Band>
  );
}

/* ───────────────────────── 服务区域 ───────────────────────── */

const mapLink = (q: string, hl: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&hl=${hl}`;

/** 服务区域：本地商家列出覆盖的城市/街区，每个都是地图链接，方便访客确认自己在不在范围内。 */
function Areas({ title, subtitle, items, note, tone }: SectionProps) {
  const { lang } = usePage();
  const hl = langCode(lang);
  const list = strs(items).slice(0, 12);
  return (
    <Band id="areas" tone={tone}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <Head title={title} subtitle={subtitle} />
        <div>
          <ul className="flex flex-wrap gap-3">
            {list.map((a, i) => (
              <li key={a} {...rv(i)}>
                <a href={mapLink(a, hl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 font-medium shadow-card hover:border-primary/60">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {a}
                </a>
              </li>
            ))}
          </ul>
          {note ? <p className="mt-6 text-muted-foreground">{str(note)}</p> : null}
        </div>
      </div>
    </Band>
  );
}

/* ───────────────────────── 邮件订阅 ───────────────────────── */

function Newsletter({ title, subtitle, placeholder, button, note }: SectionProps) {
  const { formUrl, ui } = usePage();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const label = str(placeholder);
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
      const body = new URLSearchParams();
      body.set("email", str(new FormData(form).get("email")));
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
    <section className="flash-tint border-y border-border py-14 md:py-20">
      <Container {...rv()} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex items-start gap-5">
          <span className="hidden size-14 flex-none place-items-center rounded-full bg-primary text-primary-foreground sm:grid" aria-hidden>
            <Mail className="size-6" />
          </span>
          <div>
            <h2 className="text-3xl md:text-4xl">{str(title)}</h2>
            {subtitle ? <p className="mt-3 max-w-xl text-lg text-muted-foreground">{str(subtitle)}</p> : null}
          </div>
        </div>
        <div>
          <form id="newsletter-form" onSubmit={onSubmit} data-readdy-form className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">
              {label}
            </label>
            <input id="nl-email" name="email" type="email" required placeholder={label} className="h-12 min-w-0 flex-1 rounded-btn border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <Honeypot />
            <button type="submit" disabled={state === "sending"} className="flash-btn inline-flex h-12 flex-none items-center justify-center rounded-btn bg-primary px-7 text-base font-semibold text-primary-foreground shadow-card transition hover:brightness-110 disabled:opacity-60">
              {str(button)}
            </button>
          </form>
          {note ? <p className="mt-3 text-sm text-muted-foreground">{str(note)}</p> : null}
          <p role="status" className={cn("mt-2 text-sm", state === "error" ? "text-red-600" : "text-primary", state === "idle" || state === "sending" ? "hidden" : "")}>
            {state === "done" ? ui.form_success : state === "error" ? errMsg || ui.form_error : ""}
          </p>
        </div>
      </Container>
    </section>
  );
}

export const EXTRA_RENDERERS: Record<string, ComponentType<SectionProps>> = {
  announcement: Announcement,
  logos: Logos,
  cases: Cases,
  team: Team,
  gallery: Gallery,
  comparison: Comparison,
  products: Products,
  menu: Menu,
  schedule: Schedule,
  timeline: Timeline,
  areas: Areas,
  newsletter: Newsletter,
};

/** 底色在 默认/浅灰 之间交替的新区块(和 sections.tsx 的 ALTERNATING 合并) */
export const EXTRA_ALTERNATING = ["cases", "team", "gallery", "comparison", "products", "menu", "schedule", "timeline", "areas"];
