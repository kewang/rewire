## Why

PRD FR-5 要求視覺回饋：線色變化（白→黃→黑）、接點冒煙粒子、狀態音效。目前遊戲只有數字顯示，缺乏直覺的視覺線索讓玩家「感受」過載和燒線的緊張感。加入視覺回饋能大幅提升遊戲體驗。

## What Changes

- 建立線路視覺化元件：用 SVG 繪製 NFB → 線材 → 插座的簡化線路圖
- 線色根據熱度變化：白(正常) → 黃(預警) → 紅→黑(燒毀)
- 加入簡單的 CSS 冒煙/發光動畫效果
- 狀態音效使用 Web Audio API 產生簡單的提示音（不需外部音檔）

## Capabilities

### New Capabilities
- `visual-feedback`: 線路視覺化、線色變化、冒煙動畫、狀態提示音

### Modified Capabilities

## Impact

- 新增 `src/components/CircuitDiagram.tsx`：SVG 線路視覺化
- 修改 `src/components/GameBoard.tsx`：嵌入線路圖
- 修改 `src/App.css`：冒煙/發光動畫 CSS
