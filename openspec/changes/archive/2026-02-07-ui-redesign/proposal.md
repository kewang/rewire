## Why

目前遊戲 UI 為開發初期的 prototype 品質，存在三個核心問題：
1. **手機版完全壞掉** — 三欄 flex layout 在 ≤768px 寬度下文字被壓成直排，無任何 responsive breakpoints
2. **視覺風格缺乏氛圍** — 全部 system-ui 字體、#1a1a1a 黑底 + #444 邊框的卡片、無紋理/無深度感，呈現工程師 prototype 風格
3. **結果面板需要捲動** — 過關/燒線結果在畫面下方，需捲動才能看到，打斷遊戲體驗

## What Changes

- 新增 responsive layout：手機版改為單欄堆疊，線材選擇改為水平捲動或折疊式，電路圖放大置中
- 視覺風格全面升級：配電盤工業主題（金屬質感、紋理背景）、特色字體配對、電力主題色彩（琥珀/電弧藍 accent）、卡片深度感（shadow、gradient）
- 關卡選擇頁面視覺升級：卡片 hover 動效、難度漸進的視覺提示
- Layout 重構：確保結果面板在 viewport 內可見、電路圖作為視覺焦點放大
- 微互動動效：送電按鈕反饋強化、過關/失敗動畫

## Capabilities

### New Capabilities
- `responsive-layout`: RWD 響應式佈局，支援手機/平板/桌面斷點
- `visual-theme`: 配電盤工業主題視覺風格系統（字體、色彩、紋理、卡片設計）

### Modified Capabilities
- `game-ui`: Layout 重構（結果面板可見性、電路圖放大、三欄→響應式）

## Impact

- `src/App.css` — 主要 CSS 大幅改寫（layout、色彩、字體、動效）
- `src/index.css` — 全域樣式/CSS variables
- `src/components/GameBoard.tsx` — layout 結構調整
- `src/components/LevelSelect.tsx` — 關卡選單視覺升級
- `src/components/WireSelector.tsx` — 手機版水平捲動/折疊
- `src/components/CircuitDiagram.tsx` — 尺寸調整
- `src/components/ResultPanel.tsx` — 可見性確保
- `src/components/StatusDisplay.tsx` — 響應式調整
- 可能新增 Google Fonts CDN 引用（在 index.html）
