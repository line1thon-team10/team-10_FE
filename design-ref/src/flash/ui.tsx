import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePage } from "./context";
import { stylePack } from "./theme";

// 组件库的基础积木。所有内容按纯文本渲染（不用 dangerouslySetInnerHTML），
// 对 props 一律做防御：缺字段、类型不对都不会崩；文案全部来自 site.json，这里不写死任何面向访客的文字。

export type Rec = Record<string, any>;
export type Img = { src?: string; alt?: string };

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
export const str = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");
export const arr = (v: unknown): Rec[] => (Array.isArray(v) ? (v as Rec[]) : []);
export const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

// 只允许页内锚点(#...)和站内路径(/...)，挡掉外链和 javascript: 之类
export const safeHref = (v: unknown) =>
  typeof v === "string" && (v.startsWith("#") || (v.startsWith("/") && !v.startsWith("//"))) ? v : "#";

export const tel = (v: unknown) => {
  const s = str(v).trim();
  return /^[+(\d][\d\s().+-]{5,}$/.test(s) ? `tel:${s.replace(/[^\d+]/g, "")}` : null;
};

// ───── 表单公共逻辑（联系表单、订阅表单共用）─────

const HONEYPOT = "website_alt";

/** 防垃圾蜜罐：真人看不见也填不到，机器人会填；样式见 flash.css 的 .flash-aux（不用 hidden/sr-only 这类一眼可见的写法） */
export function Honeypot() {
  return (
    <div className="flash-aux" aria-hidden>
      <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" aria-hidden readOnly />
    </div>
  );
}

/** 蜜罐被填了：调用方不发请求，但照常显示成功，不给机器人明确的拒绝信号 */
export const isBot = (form: HTMLFormElement) => str(new FormData(form).get(HONEYPOT)).trim() !== "";

/**
 * 提交到 Readdy 表单接口。成功 = HTTP 2xx 且返回的 code 是 "OK"；
 * 否则返回错误文案（优先用服务端 meta.message / meta.detail），空串表示没有可展示的服务端文案。成功返回 null。
 */
export async function postForm(url: string, body: URLSearchParams): Promise<string | null> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const text = await res.text();
  let parsed: Rec | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (res.ok && parsed?.code === "OK") return null;
  return str(parsed?.meta?.message) || str(parsed?.meta?.detail) || str(parsed?.message) || "";
}

/** 入场动效：给元素加 data-reveal，延迟按序号错开；真正的显隐由 FlashPage 里的 IntersectionObserver 加 .is-in。 */
export const rv = (i = 0): { "data-reveal": string; style: CSSProperties } => ({
  "data-reveal": "",
  style: { "--d": `${Math.min(i, 6) * 70}ms` } as CSSProperties,
});

/** 站内路径走 router（带上 BASE_PATH，预览路径下也不会跳错），锚点用原生 a。 */
export function A({ to, className, children, ...rest }: { to?: string; className?: string; children: ReactNode } & Rec) {
  const href = safeHref(to);
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

const BTN_BASE =
  "flash-btn inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const BTN_SIZE = { md: "h-10 px-5 text-sm", lg: "h-12 px-7 text-base" };
const BTN_VARIANT = {
  primary: "bg-primary text-primary-foreground shadow-card hover:brightness-110",
  outline: "border border-border bg-transparent hover:bg-muted",
  onDeep: "bg-white text-brand-deep shadow-card hover:bg-white/90",
  onDeepOutline: "border border-white/45 bg-transparent text-white hover:bg-white/10",
  // 放在实心主色卡片(价格高亮卡、评分卡)上的按钮：底用主色的前景色，字用主色
  inverse: "bg-primary-foreground text-primary shadow-card hover:opacity-90",
};

export function Btn({ to, label, variant = "primary", size = "lg", className, children }: { to?: string; label?: string; variant?: keyof typeof BTN_VARIANT; size?: keyof typeof BTN_SIZE; className?: string; children?: ReactNode }) {
  return (
    <A to={to} className={cn(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className)}>
      {children}
      {label}
    </A>
  );
}

export function Container({ children, className, ...rest }: { children: ReactNode; className?: string } & Rec) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 md:px-8", className)} {...rest}>
      {children}
    </div>
  );
}

export type Tone = "default" | "muted" | "deep" | "tint";

/** 通栏区块。tone: default 底色 / muted 浅灰底(由页面交替分配) / tint 品牌淡染 / deep 品牌深色底。 */
export function Band({ id, tone = "default", children, className }: { id?: string; tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        tone === "muted" && "border-y border-border bg-muted/70",
        tone === "tint" && "flash-tint",
        tone === "deep" && "flash-deep",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Head({ title, subtitle, center, invert }: { title?: unknown; subtitle?: unknown; center?: boolean; invert?: boolean }) {
  const { style } = usePage();
  if (!title && !subtitle) return null;
  // 风格包里 headCenter 的风格(优雅/自然/奢华/俏皮/复古)所有小节标题居中；center 是组件自己要求居中
  center = center || stylePack(style).headCenter;
  return (
    <div {...rv()} className={cn("mb-10 flex max-w-2xl flex-col gap-4 md:mb-14", center && "mx-auto items-center text-center")}>
      <span className={cn("flash-bar", invert && "flash-bar-invert")} aria-hidden />
      {title ? <h2 className="text-3xl leading-tight md:text-[2.6rem]">{str(title)}</h2> : null}
      {subtitle ? <p className={cn("text-lg leading-relaxed", invert ? "text-white/80" : "text-muted-foreground")}>{str(subtitle)}</p> : null}
    </div>
  );
}

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & Rec) {
  return (
    <div className={cn("flash-card rounded-card border border-border bg-card p-6 text-card-foreground shadow-card md:p-7", className)} {...rest}>
      {children}
    </div>
  );
}

// 图片只允许站内路径或 https，防止把别的协议带进页面
const IMG_OK = /^(https:\/\/|\/(?!\/))/;

/**
 * 图片坑位：下面永远铺一层品牌色淡染的占位，图片加载好了再淡入盖上；没有图、加载失败(生图还没好/失败)就一直是占位。
 * 父元素给比例（aspect-*）和圆角，这里铺满。图片生成走 search-image：首次访问可能要十几秒，所以占位必须在。
 * priority：首屏大图，立即加载并标高优先级(LCP)。
 */
export function Slot({ img, className, priority, sizes }: { img?: Img; className?: string; priority?: boolean; sizes?: string }) {
  const src = img?.src && IMG_OK.test(img.src) ? img.src : null;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      {/* 占位图：图片还没生成好/加载中/失败时的底，一张纯淡色底(不带文字)；真实图片加载好后会淡入盖住它 */}
      <svg className={cn("flash-placeholder absolute inset-0 size-full", className)} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden />
      {src && !failed ? (
        <img
          src={src}
          alt={str(img?.alt)}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", ready ? "opacity-100" : "opacity-0", className)}
        />
      ) : null}
    </>
  );
}

/** 这个图片坑位有没有真能显示的图（决定版式要不要给图留位置） */
export const hasImg = (img?: Img) => Boolean(img?.src && IMG_OK.test(img.src));
