import { useEffect, useRef, useState } from "react";
import "./flash.css";
import site from "./site.json";
import { PageContext, type Hours, type PageCtx, type SectionProps } from "./context";
import { applySeo } from "./seo";
import { ALTERNATING, RENDERERS } from "./sections";
import { fontsHref, isRtl, themeStyle } from "./theme";
import { str } from "./ui";
import type { Generated } from "./facts";

// Flash 站：整站内容都在 site.json 里（由生成流程写入），页面 = 按 page.types 的顺序渲染组件库里的组件。
// 想改文案/换图直接改 site.json；想改版式、加组件改 sections.tsx / ui.tsx；换气质换 theme.style(见 theme.ts)。

type Page = (typeof site.pages)[number];
type Site = {
  name?: string;
  lang?: string;
  formUrl?: string;
  ui?: PageCtx["ui"];
  theme?: { accent?: string; mode?: string; style?: string };
  nap?: { phone?: string; address?: string; generated?: Generated };
};
const meta = site as unknown as Site;

/** 页面里带 data-reveal 的元素滚到视口就淡入上移；没有 IntersectionObserver 或开了减少动效就直接全部显示 */
function useReveal(deps: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // 减少动效偏好、不支持 IO、或页面开在后台标签页(浏览器会暂停动画和 IO 回调)：直接全部显示，内容永远不被动效挡住
    if (reduce || document.hidden || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [deps]);
}

function useFonts(style: string) {
  useEffect(() => {
    const href = fontsHref(style);
    if (document.head.querySelector(`link[data-flash-fonts][href="${href}"]`)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.setAttribute("data-flash-fonts", "");
    document.head.appendChild(l);
  }, [style]);
}

export default function FlashPage({ page }: { page: Page }) {
  const sections = page.sections as Record<string, SectionProps>;
  const types = page.types as string[];
  const style = meta.theme?.style || "modern";
  const home = site.pages.find((p) => p.kind === "home");
  const hours = ((home?.sections as Record<string, SectionProps> | undefined)?.map?.hours as Hours | undefined) || [];
  const ctx: PageCtx = {
    lang: meta.lang || "",
    brand: meta.name || "",
    ui: meta.ui || {},
    kind: page.kind,
    navLabel: str(((sections.navbar?.links as { href?: string; label?: string }[] | undefined) || []).find((l) => l.href === page.path)?.label) || undefined,
    style,
    formUrl: meta.formUrl,
    phone: meta.nap?.phone,
    address: meta.nap?.address,
    generated: meta.nap?.generated,
    hours: Array.isArray(hours) ? hours : [],
    ctaHref: types.includes("contact") ? "#contact" : "/contact",
    images: (page as { images?: PageCtx["images"] }).images || {},
  };

  const [js, setJs] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => setJs(true), []);
  useFonts(style);
  useReveal(page.path + js);
  useEffect(() => {
    applySeo(site as never, page as never, ctx);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 区块按位置分三段：导航在前、页脚/手机栏在后，中间是 <main>（主内容地标，跳转链接指向它）
  let muted = false;
  const render = (type: string) => {
    const C = RENDERERS[type];
    let props = sections[type];
    if (!C || !props) return null;
    if (ALTERNATING.has(type)) {
      props = { ...props, tone: muted ? "muted" : "default" };
      muted = !muted;
    } else {
      muted = false;
    }
    return <C key={type} {...props} />;
  };
  const head: string[] = types.filter((t) => t === "announcement" || t === "navbar");
  const tail: string[] = types.filter((t) => t === "footer" || t === "stickybar");
  const body = types.filter((t) => !head.includes(t) && !tail.includes(t));
  return (
    <PageContext.Provider value={ctx}>
      <div
        ref={topRef}
        className={`flash-site flex w-full flex-col max-md:pb-20${js ? " flash-js" : ""}`}
        data-style={style}
        style={themeStyle(meta.theme?.accent || "", meta.theme?.mode || "", style)}
        dir={isRtl(ctx.lang) ? "rtl" : "ltr"}
      >
        <a href="#main" className="flash-skip">
          {str(ctx.ui.skip_to_content) || "Skip to content"}
        </a>
        {head.map(render)}
        <main id="main" className="flex flex-col">
          {body.map(render)}
        </main>
        {tail.map(render)}
      </div>
    </PageContext.Provider>
  );
}
