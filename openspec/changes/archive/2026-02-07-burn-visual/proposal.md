## Why

v0.1 的 burned 狀態只有線色變黑和三個灰色煙霧粒子，缺乏「燒毀瞬間」的衝擊感。真實燒線會有明火、電線斷裂、絕緣皮剝落露出銅芯，這些視覺元素能大幅提升遊戲的回饋品質。

## What Changes

- 新增明火特效：燒毀時在接點處產生橘紅色火焰粒子（向上飄散後消失）
- 電線斷裂視覺：burned 狀態下 SVG 線段在接點處斷開，形成可見缺口
- 絕緣皮剝落：斷裂處顯示外皮翻開、露出銅色內芯的 SVG 圖形

## Capabilities

### New Capabilities

（無新增獨立能力）

### Modified Capabilities

- `visual-feedback`: 強化 burned 狀態的視覺效果（明火 + 斷線 + 絕緣皮剝落）

## Impact

- `src/components/CircuitDiagram.tsx` — 修改 burned 狀態的 SVG 渲染（斷線、銅芯、火焰粒子）
- `src/App.css` — 新增火焰粒子的 CSS 動畫、ResultPanel 改為 inline 佈局
- `src/components/ResultPanel.tsx` — 移除 fixed overlay，改為 inline 顯示以避免遮住燒毀特效
- `src/components/GameBoard.tsx` — 配合 ResultPanel 調整
