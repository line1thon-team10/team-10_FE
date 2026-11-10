// 主题 = 主题色(accent) × 风格包(style) × 明暗(mode)。
//   accent：品牌色，Jev 按行业从 14 个里选；
//   style ：风格包，决定标题字体、圆角、中性色温度、hero 版式、标题气质——同样的内容，修车铺和花店气质完全不同；
//   mode  ：明暗。
// 全部落成 CSS 变量(RGB 三元组给 tailwind 的 rgb(var(--x) / alpha) 用)，组件里不写任何硬编码色值。

type Mode = "light" | "dark";
export type StyleName = "modern" | "elegant" | "warm" | "clean" | "rugged" | "corporate" | "editorial" | "tech" | "organic" | "luxe" | "playful" | "vintage";
/** 首屏版式：fullbleed 整幅照片 / split 左文右图 / panel 左深色面板右整幅图 / framed 照片加内框居中 / arch 拱形图 / editorial 杂志大标题 / window 深色光晕+应用窗口图 / centered 居中大字+斜框图 */
export type HeroVariant = "fullbleed" | "split" | "panel" | "framed" | "arch" | "editorial" | "window" | "centered";
/** 导航形态：bar 通栏 / center 品牌居中链接分列两侧 / float 悬浮胶囊 */
export type NavVariant = "bar" | "center" | "float";

const ACCENTS: Record<string, { light: string; dark: string; deep: string }> = {
  navy: { light: "#1e3a8a", dark: "#93c5fd", deep: "#1e3a8a" },
  teal: { light: "#0f766e", dark: "#5eead4", deep: "#0f766e" },
  indigo: { light: "#4f46e5", dark: "#818cf8", deep: "#4f46e5" },
  emerald: { light: "#059669", dark: "#34d399", deep: "#059669" },
  rose: { light: "#e11d48", dark: "#fb7185", deep: "#e11d48" },
  amber: { light: "#c2410c", dark: "#fbbf24", deep: "#c2410c" },
  sky: { light: "#0369a1", dark: "#38bdf8", deep: "#0369a1" },
  violet: { light: "#7c3aed", dark: "#a78bfa", deep: "#7c3aed" },
  slate: { light: "#334155", dark: "#cbd5e1", deep: "#334155" },
  gold: { light: "#a16207", dark: "#d4af37", deep: "#6b4a0b" },
  forest: { light: "#2d6a4f", dark: "#74c69d", deep: "#1b4332" },
  cyan: { light: "#0e7490", dark: "#22d3ee", deep: "#155e75" },
  crimson: { light: "#b91c1c", dark: "#f87171", deep: "#7f1d1d" },
  coral: { light: "#d9480f", dark: "#ff8a65", deep: "#9c2f0a" },
};

type Neutrals = { bg: string; fg: string; card: string; muted: string; mutedFg: string; border: string };

export type StylePack = {
  /** 标题字体 / 正文字体（Google Fonts 族名）；mono 是小标签用的等宽字体(可选) */
  display: string;
  body: string;
  mono?: string;
  /** 要加载的 Google Fonts 族（含字重），拼成一条 css2 请求 */
  fonts: string[];
  /** 卡片 / 按钮圆角(px) */
  radius: number;
  radiusBtn: number;
  /** 首页 hero 版式，见 HeroVariant；没有 hero 图时每种版式都退成纯文字版。目前 12 套风格都是整幅照片(fullbleed/framed)，其它版式保留可用 */
  hero: HeroVariant;
  /** hero 图的宽高比(Tailwind 类)，要和后端 images.go 里该风格的生图尺寸一致 */
  heroAspect: string;
  nav: NavVariant;
  /** fullbleed 版式里文字的位置：start 左上 / center 居中 / end 左下(杂志) */
  heroAlign: "start" | "center" | "end";
  /** 小节标题是否居中 */
  headCenter: boolean;
  /** 天生深色的风格(tech/luxe)：不管 Jev 选什么明暗都用深色 */
  forceDark?: boolean;
  dark?: Neutrals;
  btnTransform: "none" | "uppercase";
  btnTracking: string;
  /** split 版式下 hero 的底：deep=品牌深色渐变；light=浅色 */
  heroTone: "deep" | "light";
  /** 联系区的底：deep=品牌深色；light=浅色卡 */
  contactTone: "deep" | "light";
  headTransform: "none" | "uppercase";
  headTracking: string;
  headWeight: number;
  /** 浅色模式下的中性色（暖/冷/纯白） */
  light: Neutrals;
  /** 阴影强度 */
  shadow: string;
  shadowLift: string;
};

const DARK: Neutrals = { bg: "9 13 25", fg: "241 245 249", card: "17 24 39", muted: "22 30 46", mutedFg: "148 163 184", border: "38 48 66" };

export const STYLE_PACKS: Record<StyleName, StylePack> = {
  // 现代：通用、自信的几何无衬线，整幅照片 hero——科技/代理/没有更强匹配的一切
  modern: {
    display: "Plus Jakarta Sans", body: "Inter", fonts: ["Plus+Jakarta+Sans:wght@600;700;800", "Inter:wght@400;500;600"],
    radius: 16, radiusBtn: 10, hero: "fullbleed", heroAspect: "aspect-[16/9]", heroAlign: "start", nav: "bar", headCenter: false, heroTone: "deep", contactTone: "deep",
    headTransform: "none", headTracking: "-0.02em", headWeight: 800, btnTransform: "none", btnTracking: "0",
    light: { bg: "255 255 255", fg: "15 23 42", card: "255 255 255", muted: "241 245 249", mutedFg: "100 116 139", border: "226 232 240" },
    shadow: "0 1px 2px rgb(15 23 42 / .05), 0 4px 16px rgb(15 23 42 / .05)", shadowLift: "0 12px 32px rgb(15 23 42 / .12)",
  },
  // 优雅：衬线标题 + 竖幅人像照片 + 大留白，花店/婚礼/美容/精品
  elegant: {
    display: "Playfair Display", body: "Inter", fonts: ["Playfair+Display:wght@500;600;700", "Inter:wght@400;500;600"],
    radius: 4, radiusBtn: 2, hero: "fullbleed", heroAspect: "aspect-[4/5]", heroAlign: "center", nav: "center", headCenter: true, heroTone: "light", contactTone: "light",
    headTransform: "none", headTracking: "-0.01em", headWeight: 600, btnTransform: "uppercase", btnTracking: "0.12em",
    light: { bg: "253 252 250", fg: "28 25 23", card: "255 255 255", muted: "246 243 238", mutedFg: "120 113 108", border: "231 226 219" },
    dark: { bg: "20 18 17", fg: "245 241 236", card: "30 27 25", muted: "26 23 21", mutedFg: "168 160 152", border: "54 49 45" },
    shadow: "0 1px 2px rgb(28 25 23 / .04), 0 8px 24px rgb(28 25 23 / .06)", shadowLift: "0 16px 40px rgb(28 25 23 / .12)",
  },
  // 温暖：圆润、奶油底色、拱形照片，咖啡/烘焙/餐厅/社区
  warm: {
    display: "Fraunces", body: "Nunito", fonts: ["Fraunces:wght@600;700", "Nunito:wght@400;600;700"],
    radius: 24, radiusBtn: 999, hero: "fullbleed", heroAspect: "aspect-[5/6]", heroAlign: "start", nav: "bar", headCenter: false, heroTone: "light", contactTone: "light",
    headTransform: "none", headTracking: "-0.01em", headWeight: 700, btnTransform: "none", btnTracking: "0",
    light: { bg: "255 252 247", fg: "41 37 36", card: "255 255 255", muted: "250 243 232", mutedFg: "120 108 98", border: "238 228 212" },
    dark: { bg: "28 22 18", fg: "247 240 230", card: "40 32 26", muted: "36 29 23", mutedFg: "190 175 158", border: "64 52 42" },
    shadow: "0 2px 4px rgb(120 80 30 / .05), 0 8px 24px rgb(120 80 30 / .07)", shadowLift: "0 14px 36px rgb(120 80 30 / .14)",
  },
  // 清爽：浅色、精确、左文右图，牙科/医疗/地产/保洁
  clean: {
    display: "Manrope", body: "Inter", fonts: ["Manrope:wght@600;700;800", "Inter:wght@400;500;600"],
    radius: 12, radiusBtn: 8, hero: "fullbleed", heroAspect: "aspect-[4/3]", heroAlign: "start", nav: "bar", headCenter: false, heroTone: "light", contactTone: "light",
    headTransform: "none", headTracking: "-0.025em", headWeight: 800, btnTransform: "none", btnTracking: "0",
    light: { bg: "255 255 255", fg: "15 23 42", card: "255 255 255", muted: "244 247 251", mutedFg: "93 107 128", border: "224 231 240" },
    shadow: "0 1px 2px rgb(15 23 42 / .04), 0 4px 14px rgb(15 23 42 / .05)", shadowLift: "0 10px 28px rgb(15 23 42 / .10)",
  },
  // 硬朗：窄体大写标题 + 暗色照片，修车/水电/屋顶/建筑
  rugged: {
    display: "Barlow Condensed", body: "Barlow", fonts: ["Barlow+Condensed:wght@600;700", "Barlow:wght@400;500;600"],
    radius: 6, radiusBtn: 4, hero: "fullbleed", heroAspect: "aspect-[16/9]", heroAlign: "start", nav: "bar", headCenter: false, heroTone: "deep", contactTone: "deep",
    headTransform: "uppercase", headTracking: "0.01em", headWeight: 700, btnTransform: "uppercase", btnTracking: "0.04em",
    light: { bg: "250 250 249", fg: "24 24 27", card: "255 255 255", muted: "243 243 241", mutedFg: "99 99 105", border: "226 226 222" },
    dark: { bg: "15 15 17", fg: "244 244 245", card: "24 24 27", muted: "20 20 23", mutedFg: "150 150 158", border: "48 48 54" },
    shadow: "0 1px 2px rgb(0 0 0 / .08), 0 2px 8px rgb(0 0 0 / .06)", shadowLift: "0 8px 20px rgb(0 0 0 / .16)",
  },
  // 企业：稳重衬线 + 深色面板 + 直角，咨询/代理/法律/财税/制造/贸易
  corporate: {
    display: "Source Serif 4", body: "Inter", fonts: ["Source+Serif+4:wght@600;700", "Inter:wght@400;500;600"],
    radius: 4, radiusBtn: 4, hero: "fullbleed", heroAspect: "aspect-[7/5]", heroAlign: "start", nav: "bar", headCenter: false, heroTone: "deep", contactTone: "deep",
    headTransform: "none", headTracking: "-0.015em", headWeight: 700, btnTransform: "none", btnTracking: "0.01em",
    light: { bg: "255 255 255", fg: "17 24 39", card: "255 255 255", muted: "243 245 248", mutedFg: "82 92 108", border: "218 224 232" },
    shadow: "0 1px 2px rgb(17 24 39 / .05), 0 2px 8px rgb(17 24 39 / .04)", shadowLift: "0 10px 26px rgb(17 24 39 / .12)",
  },
  // 杂志：超大衬线标题 + 纸张底色 + 黑色细线，创意代理/摄影/建筑/媒体/个人品牌
  editorial: {
    display: "Instrument Serif", body: "Hanken Grotesk", fonts: ["Instrument+Serif:ital@0;1", "Hanken+Grotesk:wght@400;500;600"],
    radius: 0, radiusBtn: 0, hero: "fullbleed", heroAspect: "aspect-[4/3]", heroAlign: "end", nav: "center", headCenter: false, heroTone: "light", contactTone: "light",
    headTransform: "none", headTracking: "-0.02em", headWeight: 400, btnTransform: "uppercase", btnTracking: "0.08em",
    light: { bg: "250 249 246", fg: "17 17 17", card: "255 255 255", muted: "240 238 233", mutedFg: "102 100 94", border: "214 211 203" },
    dark: { bg: "17 17 17", fg: "245 243 238", card: "26 26 26", muted: "22 22 22", mutedFg: "158 155 148", border: "58 58 56" },
    shadow: "none", shadowLift: "0 14px 30px rgb(0 0 0 / .10)",
  },
  // 科技：深色光晕 + 网格 + 等宽小标签 + 悬浮导航，SaaS/App/AI/开发者工具
  tech: {
    display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono", fonts: ["Space+Grotesk:wght@500;600;700", "Inter:wght@400;500;600", "JetBrains+Mono:wght@500"],
    radius: 14, radiusBtn: 10, hero: "fullbleed", heroAspect: "aspect-[16/9]", heroAlign: "center", nav: "float", headCenter: false, forceDark: true, heroTone: "deep", contactTone: "deep",
    headTransform: "none", headTracking: "-0.03em", headWeight: 700, btnTransform: "none", btnTracking: "0",
    light: { bg: "255 255 255", fg: "15 23 42", card: "255 255 255", muted: "241 245 249", mutedFg: "100 116 139", border: "226 232 240" },
    dark: { bg: "7 9 20", fg: "232 236 245", card: "15 19 36", muted: "12 16 31", mutedFg: "138 148 173", border: "34 42 66" },
    shadow: "0 1px 0 rgb(255 255 255 / .04) inset, 0 8px 24px rgb(0 0 0 / .35)", shadowLift: "0 18px 48px rgb(0 0 0 / .5)",
  },
  // 自然：大地色 + 拱形图 + 叶形装饰 + 大圆角，瑜伽/疗愈/护肤/有机/园艺
  organic: {
    display: "Lora", body: "Nunito Sans", fonts: ["Lora:wght@500;600;700", "Nunito+Sans:wght@400;600;700"],
    radius: 28, radiusBtn: 999, hero: "fullbleed", heroAspect: "aspect-[5/6]", heroAlign: "start", nav: "bar", headCenter: true, heroTone: "light", contactTone: "light",
    headTransform: "none", headTracking: "-0.01em", headWeight: 600, btnTransform: "none", btnTracking: "0",
    light: { bg: "250 248 242", fg: "38 44 35", card: "255 254 250", muted: "241 238 227", mutedFg: "106 113 98", border: "226 222 207" },
    dark: { bg: "17 24 19", fg: "232 240 226", card: "25 34 27", muted: "21 29 23", mutedFg: "160 177 156", border: "45 58 48" },
    shadow: "0 2px 4px rgb(60 70 40 / .05), 0 10px 28px rgb(60 70 40 / .07)", shadowLift: "0 16px 40px rgb(60 70 40 / .14)",
  },
  // 奢华：黑金、直角、细线框、宽字距，酒店/珠宝/高端地产/私人会所
  luxe: {
    display: "Cormorant Garamond", body: "Jost", fonts: ["Cormorant+Garamond:wght@500;600;700", "Jost:wght@300;400;500"],
    radius: 0, radiusBtn: 0, hero: "framed", heroAspect: "aspect-[16/9]", heroAlign: "center", nav: "center", headCenter: true, forceDark: true, heroTone: "deep", contactTone: "deep",
    headTransform: "none", headTracking: "0.01em", headWeight: 500, btnTransform: "uppercase", btnTracking: "0.16em",
    light: { bg: "255 255 255", fg: "15 23 42", card: "255 255 255", muted: "241 245 249", mutedFg: "100 116 139", border: "226 232 240" },
    dark: { bg: "10 10 11", fg: "245 241 232", card: "20 19 18", muted: "16 15 14", mutedFg: "168 160 145", border: "52 48 40" },
    shadow: "none", shadowLift: "0 18px 44px rgb(0 0 0 / .55)",
  },
  // 俏皮：圆体标题 + 粗描边硬阴影 + 大圆角 + 斜框贴纸感，儿童/宠物/甜品/游乐
  playful: {
    display: "Fredoka", body: "Nunito", fonts: ["Fredoka:wght@500;600;700", "Nunito:wght@400;600;700"],
    radius: 22, radiusBtn: 999, hero: "fullbleed", heroAspect: "aspect-[16/8]", heroAlign: "center", nav: "bar", headCenter: true, heroTone: "light", contactTone: "deep",
    headTransform: "none", headTracking: "-0.01em", headWeight: 600, btnTransform: "none", btnTracking: "0",
    light: { bg: "255 250 240", fg: "40 30 60", card: "255 255 255", muted: "255 238 214", mutedFg: "110 98 130", border: "233 223 245" },
    dark: { bg: "26 20 40", fg: "250 244 255", card: "38 30 58", muted: "33 26 50", mutedFg: "190 178 215", border: "70 58 100" },
    shadow: "4px 4px 0 rgb(var(--f-fg))", shadowLift: "7px 7px 0 rgb(var(--f-fg))",
  },
  // 复古：厚实板岩体标题 + 米黄纸色 + 双线框，理发店/烘焙咖啡/手作/酒吧
  vintage: {
    display: "Alfa Slab One", body: "Karla", fonts: ["Alfa+Slab+One", "Karla:wght@400;500;700"],
    radius: 4, radiusBtn: 2, hero: "framed", heroAspect: "aspect-[16/9]", heroAlign: "center", nav: "center", headCenter: true, heroTone: "deep", contactTone: "deep",
    headTransform: "none", headTracking: "0.01em", headWeight: 400, btnTransform: "uppercase", btnTracking: "0.1em",
    light: { bg: "250 244 230", fg: "45 32 24", card: "255 250 238", muted: "241 230 208", mutedFg: "112 94 76", border: "214 196 164" },
    dark: { bg: "30 22 16", fg: "245 234 214", card: "42 32 24", muted: "36 27 20", mutedFg: "187 168 140", border: "70 56 40" },
    shadow: "0 1px 0 rgb(45 32 24 / .08)", shadowLift: "0 10px 24px rgb(45 32 24 / .18)",
  },
};

export const stylePack = (style: string): StylePack => STYLE_PACKS[(style as StyleName) in STYLE_PACKS ? (style as StyleName) : "modern"];

const triplet = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

export function themeStyle(accent: string, mode: string, style: string): Record<string, string> {
  const pack = stylePack(style);
  const m: Mode = pack.forceDark || mode === "dark" ? "dark" : "light";
  const a = ACCENTS[accent] ?? ACCENTS.indigo;
  const n = m === "dark" ? pack.dark ?? DARK : pack.light;
  return {
    "--f-primary": triplet(a[m]),
    "--f-deep": triplet(a.deep),
    "--f-primary-fg": m === "dark" ? "15 23 42" : "255 255 255",
    "--f-bg": n.bg, "--f-fg": n.fg, "--f-card": n.card, "--f-muted": n.muted, "--f-muted-fg": n.mutedFg, "--f-border": n.border,
    "--f-font-display": `"${pack.display}"`,
    "--f-font-body": `"${pack.body}"`,
    "--f-font-mono": pack.mono ? `"${pack.mono}", ui-monospace, SFMono-Regular, Menlo, monospace` : "ui-monospace, SFMono-Regular, Menlo, monospace",
    "--f-radius": `${pack.radius}px`,
    "--f-radius-btn": `${pack.radiusBtn}px`,
    "--f-head-transform": pack.headTransform,
    "--f-head-tracking": pack.headTracking,
    "--f-head-weight": String(pack.headWeight),
    "--f-btn-transform": pack.btnTransform,
    "--f-btn-tracking": pack.btnTracking,
    "--f-shadow": pack.shadow,
    "--f-shadow-lift": pack.shadowLift,
  };
}

/** 该风格要加载的 Google Fonts 样式表地址（display=swap，字体没到之前先用系统字体，不阻塞渲染） */
export const fontsHref = (style: string) => `https://fonts.googleapis.com/css2?${stylePack(style).fonts.map((f) => `family=${f}`).join("&")}&display=swap`;

// 站点语言是英文名（brief.language）；从右到左的语言要给容器加 dir="rtl"。
const RTL = new Set(["arabic", "urdu", "hebrew", "persian", "farsi", "pashto", "sindhi", "yiddish"]);
export const isRtl = (language: string) => RTL.has((language || "").trim().toLowerCase());

// 英文语言名 → BCP-47(html lang / 地图 hl 参数用)。没收录的退回 en。
const LANG_CODES: Record<string, string> = {
  english: "en", chinese: "zh-CN", "simplified chinese": "zh-CN", "traditional chinese": "zh-TW", japanese: "ja", korean: "ko",
  spanish: "es", french: "fr", german: "de", italian: "it", portuguese: "pt", dutch: "nl", russian: "ru", arabic: "ar", hebrew: "he",
  turkish: "tr", polish: "pl", swedish: "sv", danish: "da", norwegian: "no", finnish: "fi", greek: "el", hindi: "hi", thai: "th",
  vietnamese: "vi", indonesian: "id", malay: "ms", ukrainian: "uk", czech: "cs", romanian: "ro", hungarian: "hu", persian: "fa", urdu: "ur",
};
export const langCode = (language: string) => LANG_CODES[(language || "").trim().toLowerCase()] || "en";
