## Why

L22（5 迴路）和 L23（6 迴路）的電路圖 SVG 因為多迴路 maxWidth 超出中間欄位可用寬度，整體被等比縮小到難以辨識。SVG 想要 1300px（5×260）但中間欄位只有 ~830px，導致 NFB 區域和電路圖變得超小。這個問題嚴重影響遊戲體驗。

## What Changes

- 修正 `CircuitDiagram.tsx` 中多迴路 SVG 的 maxWidth 計算邏輯，避免超出容器可用寬度時過度縮小
- 調整多迴路佈局的 CSS grid 欄位比例或 max-width 約束，確保中間欄位有足夠空間
- 確保 4+ 迴路場景下電路圖仍然清晰可讀

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `multi-circuit-diagram`: 修正多迴路 SVG 尺寸計算，使 4+ 迴路不會過度縮小
- `responsive-layout`: 調整多迴路模式下的 grid 佈局約束

## Impact

- `src/components/CircuitDiagram.tsx` — SVG maxWidth 計算邏輯
- `src/App.css` — `.game-board.multi-circuit` max-width 和 `.game-main` grid 欄位定義
- L01-L23 所有關卡需確認無回歸
