## Context

目前的 UI 是 PRD v0.1/v0.2 開發過程中逐步堆砌的 prototype，使用純 CSS + flex 三欄 layout，無 responsive breakpoints，視覺上僅有基礎的深色主題。遊戲功能完整但視覺品質不足以作為展示或發佈使用。

現有 CSS 結構：
- `src/App.css` — 所有元件樣式（約 376 行）
- `src/index.css` — 僅 body reset
- 無 CSS variables 系統、無 breakpoints、無字體引入

## Goals / Non-Goals

**Goals:**
- 手機/平板/桌面三斷點 responsive layout
- 建立 CSS variable 為基礎的主題系統（色彩、字體、間距）
- 配電盤工業主題視覺風格，有辨識度
- 結果面板在 viewport 內可見，不需捲動
- 電路圖作為視覺焦點，佔更大比例

**Non-Goals:**
- 不做 dark/light 主題切換（維持深色主題）
- 不引入 CSS framework（Tailwind、MUI 等）
- 不改動遊戲邏輯或模擬引擎
- 不新增頁面或路由
- 不做 i18n

## Decisions

### 1. CSS Variable 主題系統

**決定**：在 `:root` 建立完整的 CSS variables（色彩、字體、間距、圓角），所有元件樣式改用 variables。

**理由**：目前 hardcoded 的色值散落各處（#1a1a1a、#444、#22c55e 等），改用 variables 可統一管理，也為未來擴展留路。

**替代方案**：CSS-in-JS（styled-components）→ 拒絕，引入新依賴且與現有 CSS 架構不符。

### 2. Responsive 策略：Mobile-first + 3 breakpoints

**決定**：
- `≤ 640px`（mobile）：單欄堆疊，線材選擇改水平滾動
- `641px – 1024px`（tablet）：兩欄（左：線材+電器，右：電路圖+控制）
- `≥ 1025px`（desktop）：三欄維持現有 layout，但比例調整

**理由**：遊戲核心互動需要同時看到線材選擇和電路圖，tablet 兩欄是合理折衷。

**替代方案**：只做 desktop + mobile 兩斷點 → 拒絕，tablet 是常見遊戲裝置。

### 3. 字體選擇

**決定**：使用 Google Fonts，display 字體選擇有工業/技術感的無襯線字體，body 維持系統字體以確保效能。在 `index.html` 加入 `<link>` 引用。

**理由**：字體是拉開視覺品質最有效的手段。僅 display 用特殊字體可控制載入量。

**替代方案**：全部用系統字體 → 拒絕，無法突破 prototype 感。

### 4. 電路圖尺寸與 Layout

**決定**：桌面版電路圖從固定 200px 寬改為佔中欄 280px 以上，SVG viewBox 等比放大。手機版電路圖置頂全寬顯示。

**理由**：電路圖是遊戲的核心視覺元素，目前太小無法展現燒毀特效的細節。

### 5. 結果面板可見性

**決定**：結果面板出現時，使用 `scrollIntoView({ behavior: 'smooth' })` 自動捲動到可見範圍。維持 inline 顯示不做 overlay。

**理由**：保留 inline 設計（不遮蓋燒毀特效），但自動捲動解決「需要手動捲」的問題。

**替代方案**：改為 sticky/fixed overlay → 拒絕，會遮蓋 SVG 燒毀特效（這是之前的設計決策）。

### 6. 視覺風格方向

**決定**：由 frontend-design skill 在實作階段決定具體美學方向。Design 只定義技術架構（CSS variables、breakpoints、字體載入方式），不鎖定具體色值或紋理。

**理由**：frontend-design skill 專門處理視覺創意，過度在 design 階段限定會壓縮創意空間。

## Risks / Trade-offs

- **[CSS 改動範圍大]** → 一次性重寫 App.css，分 task 逐步進行，每個 task 可獨立驗證
- **[Google Fonts 外部依賴]** → 使用 `font-display: swap` 確保字體載入失敗時 fallback 到系統字體
- **[手機版 layout 大改]** → 可能影響電器拖放互動 → 目前無拖放，只有點擊，影響低
- **[scrollIntoView 體驗]** → 快速失敗時自動捲動可能讓人措手不及 → 加 smooth behavior 緩解
