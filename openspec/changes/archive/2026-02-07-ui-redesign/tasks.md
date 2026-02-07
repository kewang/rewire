## 1. Theme System Foundation

- [x] 1.1 建立 CSS variable 主題系統：在 `src/index.css` 的 `:root` 定義色彩、字體、間距、圓角 variables
- [x] 1.2 引入 display 字體：在 `index.html` 加入 Google Fonts `<link>`，設定 `font-display: swap`
- [x] 1.3 將 `src/App.css` 中所有 hardcoded 色值替換為 CSS variables

## 2. Visual Theme — Industrial Atmosphere

- [x] 2.1 用 frontend-design skill 設計關卡選擇頁面（LevelSelect）：背景紋理、卡片設計、hover 動效、字體應用
- [x] 2.2 用 frontend-design skill 設計遊戲主畫面（GameBoard）：卡片升級、送電按鈕強化、狀態面板風格化
- [x] 2.3 確保所有文字對比度達 WCAG AA 標準（label ≥ 4.5:1, value ≥ 4.5:1）

## 3. Responsive Layout

- [x] 3.1 Desktop layout 調整：電路圖中欄最小寬度 280px，三欄比例優化
- [x] 3.2 Tablet layout（641px–1024px）：改為兩欄（左：選擇面板，右：電路圖+控制）
- [x] 3.3 Mobile layout（≤ 640px）：單欄堆疊，線材選擇改水平滾動，電路圖全寬

## 4. Circuit Diagram & Result Panel

- [x] 4.1 電路圖放大：SVG viewBox 調整，桌面版中欄 ≥ 280px
- [x] 4.2 結果面板自動捲動：ResultPanel 渲染後 `scrollIntoView({ behavior: 'smooth' })`

## 5. Verification

- [x] 5.1 桌面版（≥ 1025px）全流程測試：關卡選擇 → 遊戲 → 過關/燒線
- [x] 5.2 平板版（641px–1024px）全流程測試
- [x] 5.3 手機版（≤ 640px）全流程測試
- [x] 5.4 `npm run build` 確認無建置錯誤
