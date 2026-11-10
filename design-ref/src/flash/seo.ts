import type { PageCtx } from "./context";
import { hoursKey, isGenerated, phoneKey } from "./facts";
import { langCode } from "./theme";
import { arr, str, strs, type Rec } from "./ui";

// 本地商家的 SEO 基本盘：每页 title/description/canonical/OG、LocalBusiness + FAQPage + Service + BreadcrumbList 结构化数据、
// 按品牌生成的 favicon、正确的 html lang。全部在浏览器里写进 <head>（Google 会渲染 JS 并读取其中的 JSON-LD）。
// 铁律：结构化数据只放真实信息。电话和营业时间如果还是生成时模型编的占位(nap.generated 的指纹对得上)就不写，
// 用户改过之后才写；地址取站点级的 nap.address(用户给的城市或地址)，不取模型编的街道。

type PageLike = { kind?: string; name?: string; title?: string; description?: string; sections?: Record<string, Rec>; images?: Record<string, { src?: string }> };
type SiteLike = { name?: string; lang?: string; theme?: { accent?: string }; pages?: PageLike[] };

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

const meta = (attr: "name" | "property", key: string, content: string) => {
  if (!content) return;
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  }) as HTMLMetaElement;
  el.content = content;
};

const link = (rel: string, href: string, extra?: Record<string, string>) => {
  const el = upsert(`link[rel="${rel}"]`, () => {
    const l = document.createElement("link");
    l.rel = rel;
    return l;
  }) as HTMLLinkElement;
  el.href = href;
  Object.entries(extra || {}).forEach(([k, v]) => el.setAttribute(k, v));
};

// 品牌字母 + 主题色的 SVG favicon（模板自带的是 Vite 的默认图标）
const PRIMARY: Record<string, string> = { navy: "#1e3a8a", teal: "#0f766e", indigo: "#4f46e5", emerald: "#059669", rose: "#e11d48", amber: "#c2410c", sky: "#0369a1", violet: "#7c3aed", slate: "#334155", gold: "#a16207", forest: "#2d6a4f", cyan: "#0e7490", crimson: "#b91c1c", coral: "#d9480f" };
function faviconHref(name: string, accent: string) {
  const letter = (name.trim()[0] || "•").toUpperCase().replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${PRIMARY[accent] || PRIMARY.indigo}"/><text x="32" y="44" font-family="system-ui,sans-serif" font-size="36" font-weight="700" text-anchor="middle" fill="#fff">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ───── 营业时间 → schema.org OpeningHoursSpecification（目前只认英文星期和 12/24 小时制；别的语言就不输出，不猜） ─────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dayIndex = (s: string) => DAYS.findIndex((d) => s.trim().toLowerCase().startsWith(d.slice(0, 3).toLowerCase()));

function expandDays(label: string): string[] {
  const out: string[] = [];
  for (const part of label.split(/\s*(?:,|&|\band\b|\+)\s*/i)) {
    const range = part.split(/\s*(?:[-–—]|\bto\b|\bthrough\b|\bthru\b)\s*/i);
    const a = dayIndex(range[0] || "");
    if (a < 0) continue;
    if (range.length < 2) {
      out.push(DAYS[a]);
      continue;
    }
    const b = dayIndex(range[range.length - 1]);
    if (b < 0) continue;
    for (let i = a; ; i = (i + 1) % 7) {
      out.push(DAYS[i]);
      if (i === b) break;
    }
  }
  return out;
}

function to24h(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] || "00";
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h > 24 ? null : `${String(h).padStart(2, "0")}:${min}`;
}

function openingHours(hours: { day: string; time: string }[]) {
  const specs: Rec[] = [];
  for (const row of hours) {
    if (/closed/i.test(row.time)) continue;
    const days = expandDays(row.day);
    const t = row.time.split(/\s*(?:[-–—]|\bto\b)\s*/i);
    const opens = t[0] ? to24h(t[0]) : null;
    const closes = t[1] ? to24h(t[1]) : null;
    if (!days.length || !opens || !closes) continue;
    specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes });
  }
  return specs;
}

const httpsOnly = (u?: string) => (u && /^https:\/\//.test(u) ? u : undefined);

export function applySeo(site: SiteLike, page: PageLike, ctx: PageCtx) {
  const origin = location.origin;
  const url = origin + location.pathname;
  const home = site.pages?.find((p) => p.kind === "home");
  const title = str(page.title) || ctx.brand;
  const desc = str(page.description);
  const heroImg = httpsOnly((home?.images || {}).hero?.src) || httpsOnly(page.images?.hero?.src);

  document.documentElement.lang = langCode(ctx.lang);
  document.title = title;
  meta("name", "description", desc);
  link("canonical", url);
  link("icon", faviconHref(ctx.brand, site.theme?.accent || ""), { type: "image/svg+xml" });

  meta("property", "og:type", "website");
  meta("property", "og:site_name", ctx.brand);
  meta("property", "og:title", title);
  meta("property", "og:description", desc);
  meta("property", "og:url", url);
  if (heroImg) meta("property", "og:image", heroImg);
  meta("name", "twitter:card", heroImg ? "summary_large_image" : "summary");
  meta("name", "twitter:title", title);
  meta("name", "twitter:description", desc);
  if (heroImg) meta("name", "twitter:image", heroImg);

  // ───── 结构化数据 ─────
  const bizId = `${origin}/#business`;
  const areas = strs(home?.sections?.footer?.areas);
  const business: Rec = { "@type": "LocalBusiness", "@id": bizId, name: ctx.brand, url: `${origin}/` };
  const homeDesc = str(home?.description);
  if (homeDesc) business.description = homeDesc;
  if (heroImg) business.image = heroImg;
  if (ctx.phone && !isGenerated(ctx.generated?.phone, phoneKey(ctx.phone))) business.telephone = ctx.phone;
  if (ctx.address) {
    business.address = /\d/.test(ctx.address)
      ? { "@type": "PostalAddress", streetAddress: ctx.address }
      : { "@type": "PostalAddress", addressLocality: ctx.address };
  }
  const specs = isGenerated(ctx.generated?.hours, hoursKey(ctx.hours)) ? [] : openingHours(ctx.hours);
  if (specs.length) business.openingHoursSpecification = specs;
  if (areas.length) business.areaServed = areas.map((name) => ({ "@type": "Place", name }));

  const graph: Rec[] = [business, { "@type": "WebSite", "@id": `${origin}/#website`, name: ctx.brand, url: `${origin}/`, inLanguage: langCode(ctx.lang) }];

  const faq = arr(page.sections?.faq?.items).filter((q) => str(q.question) && str(q.answer));
  if (faq.length) {
    graph.push({ "@type": "FAQPage", mainEntity: faq.map((q) => ({ "@type": "Question", name: str(q.question), acceptedAnswer: { "@type": "Answer", text: str(q.answer) } })) });
  }
  if (page.kind === "service" && page.name) {
    graph.push({ "@type": "Service", name: page.name, description: str(page.sections?.hero?.subtitle) || desc, provider: { "@id": bizId }, ...(areas.length ? { areaServed: areas } : {}) });
  }
  if (page.kind && page.kind !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: str(ctx.ui.home) || "Home", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: str(page.name) || title, item: url },
      ],
    });
  }

  const script = upsert("script#flash-jsonld", () => {
    const s = document.createElement("script");
    s.id = "flash-jsonld";
    s.type = "application/ld+json";
    return s;
  });
  script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}
