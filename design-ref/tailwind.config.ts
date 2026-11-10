/** @type {import('tailwindcss').Config} */
// Flash 站的语义色/字体/圆角全部来自 src/flash/flash.css 和 theme.ts 设的 CSS 变量：
// 换主题色、明暗、风格包只改变量，组件里统一用 bg-primary / font-display / rounded-card 这类名字。
const rgb = (name: string) => `rgb(var(--f-${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: rgb("bg"),
        foreground: rgb("fg"),
        card: rgb("card"),
        muted: rgb("muted"),
        "muted-foreground": rgb("muted-fg"),
        border: rgb("border"),
        primary: rgb("primary"),
        "primary-foreground": rgb("primary-fg"),
        "brand-deep": rgb("deep"),
      },
      fontFamily: {
        display: ["var(--f-font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--f-font-body)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        card: "var(--f-radius)",
        btn: "var(--f-radius-btn)",
        // 表单输入框：跟随按钮圆角，但封顶 12px，避免胶囊风格下多行文本框变成大椭圆
        field: "min(var(--f-radius-btn), 12px)",
      },
      boxShadow: {
        card: "var(--f-shadow)",
        lift: "var(--f-shadow-lift)",
      },
    },
  },
  plugins: [],
};
