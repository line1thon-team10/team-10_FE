import { createContext, useContext } from "react";
import type { Generated } from "./facts";
import type { Img, Rec } from "./ui";

export type UIText = { form_success?: string; form_error?: string; skip_to_content?: string; [k: string]: string | undefined };

export type Hours = { day: string; time: string }[];

export type PageCtx = {
  /** 站点语言(英文名)，决定 html lang / dir */
  lang: string;
  brand: string;
  ui: UIText;
  /** 页面类型：home | about | services | contact | service */
  kind: string;
  /** 本页在导航里的名字（面包屑末级用），取自 navbar.links 里 href 等于本页路径的那项 */
  navLabel?: string;
  /** 风格包名，见 theme.ts */
  style: string;
  /** 联系表单提交地址(Readdy 表单接口)。没有就只做前端校验和成功提示，不发请求 */
  formUrl?: string;
  /** 站点级联系信息：头部/页脚/手机栏的拨号、页脚地址都读这里（电话可能是模型编的占位，见 generated） */
  phone?: string;
  address?: string;
  /** 生成时模型编的电话、地址、营业时间的指纹，见 facts.ts */
  generated?: Generated;
  /** 营业时间（取自首页的 map 区块），页脚展示用 */
  hours: Hours;
  /** 本页所有主按钮跳转的地址：本页有联系表单就是 #contact，否则去 /contact */
  ctaHref: string;
  /** 本页的图片坑位 */
  images: Record<string, Img>;
};

export const PageContext = createContext<PageCtx>({ lang: "", brand: "", ui: {}, kind: "home", style: "modern", hours: [], ctaHref: "#", images: {} });
export const usePage = () => useContext(PageContext);

export type SectionProps = Rec & { tone?: "default" | "muted" };
