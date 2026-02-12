## Why

平面圖模式（fp-layout）通關後，ResultPanel 作為 `.game-board.fp-layout` 的直接 flex 子元素渲染，擠壓 `.fp-main` 的可用空間，導致 FloorPlanView 被壓縮至極小尺寸，玩家幾乎看不到平面圖。

## What Changes

- 將 ResultPanel 從 `overlays` 拆分出來，在 fp-layout 分支中移入 `.fp-center` 內部（可捲動區域），避免佔用 flex column 的固定空間
- 為 FloorPlanView 在 `.fp-center` 內設定 `min-height`，防止被 ResultPanel 過度壓縮
- 調整 `.fp-center` 的 `justify-content` 策略，確保 FloorPlanView + ResultPanel 共存時可正常捲動

## Capabilities

### New Capabilities

（無新增功能）

### Modified Capabilities

- `floor-plan-simulation-visual`: ResultPanel 在 fp-layout 中的渲染位置從 flex 直接子元素改為 `.fp-center` 內部捲動區域

## Impact

- `src/components/GameBoard.tsx` — 拆分 `overlays` 為 `resultPanel` + `modalOverlays`，fp-layout 分支 JSX 結構調整
- `src/App.css` — `.fp-center` 和 `.fp-center .floor-plan-view` 樣式微調（min-height、justify-content）
