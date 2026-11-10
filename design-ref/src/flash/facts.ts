// 模型编的电话、街道地址、营业时间，生成时会在 site.json 的 nap.generated 里留一个指纹(后端见 service/flashsite/facts.go)。
// 页面运行时用指纹判断某个值是不是还是模型编的：用户改过(不管是手改还是让 AI 改)，指纹就对不上，当作用户给的真实信息。
// 存指纹而不存原文，是因为让 AI 全局替换号码时会把原文副本一起改掉，两边又相等，永远判成"编的"。
// 这里的归一化(phoneKey / addressKey / hoursKey)和 fingerprint 必须与后端 facts.go 逐字一致。

export type Generated = { phone?: string; address?: string; hours?: string };

/** FNV-1a 32 位，按 UTF-8 字节算，输出 8 位小写十六进制 */
export function fingerprint(s: string): string {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

const squash = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean).join(" ");
const text = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");

export const phoneKey = (v: unknown) => text(v).replace(/\D/g, "");
export const addressKey = (v: unknown) => squash(text(v));
export const hoursKey = (rows: { day?: unknown; time?: unknown }[]) => rows.map((r) => squash(`${text(r.day)}|${text(r.time)}`)).join("\n");

/** key 对应的值是不是还是生成时模型编的那个 */
export const isGenerated = (fp: string | undefined, key: string) => !!fp && !!key && fingerprint(key) === fp;

/** 地图和"查看地图"链接钉哪里：地址文字不是模型编的，就用它；是编的，退回站点级地址(用户给的城市或地址)，也没有就不钉(返回空串) */
export const mapPin = (shown: string, siteAddress: unknown, g: Generated | undefined) =>
  isGenerated(g?.address, addressKey(shown)) ? text(siteAddress).slice(0, 200) : shown;
