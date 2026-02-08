## Why

目前 NFB 送電為普通按鈕形式（`<button>` 元素），點擊即切換 ON/OFF。缺乏實際操作配電箱的「儀式感」——真實的 NFB 是透過撥桿上扳/下扳來控制送電與斷電。將按鈕改為可拖曳的撥桿，能大幅提升操作的沉浸感與遊戲體驗。

## What Changes

- NFB 開關從 `<button>` 改為 SVG 撥桿元件，整合在 CircuitDiagram 內
- 撥桿支援拖曳操作（向上扳=ON、向下扳=OFF），同時保留點擊切換作為快速操作
- 送電瞬間加入撥桿滑動動畫（彈性 ease-out）
- 跳脫/燒毀時撥桿自動彈回 OFF 位置，配合既有的跳脫音效
- 撥桿禁用狀態（未接線/無電器）有明確視覺提示

## Capabilities

### New Capabilities
- `nfb-lever`: NFB 撥桿互動元件的視覺呈現與操作行為

### Modified Capabilities
- `game-ui`: Power control 從按鈕改為撥桿互動，送電/斷電的觸發方式變更
- `visual-feedback`: NFB 區域的視覺呈現從矩形按鈕改為撥桿造型，跳脫時增加撥桿彈回動畫

## Impact

- `src/components/CircuitDiagram.tsx` — NFB 區域改為撥桿 SVG 圖形，新增拖曳/點擊互動
- `src/components/GameBoard.tsx` — 移除獨立的 NFB `<button>` 元素，改由 CircuitDiagram 觸發送電
- `src/App.css` — 移除 `.nfb-switch` 按鈕樣式，新增撥桿動畫 keyframes
- 無新增依賴，使用既有 Pointer Events API 與 SVG 動畫
