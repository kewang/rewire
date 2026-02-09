## Why

v0.5 完成後，玩家已具備選線、接線、壓接、相位分配、ELCB 等核心電工技能。但配電箱「走線整齊」這項真實電工基本功尚未呈現。v0.6 引入整線美學系統，第一步需要建立配電箱內部視圖（Panel Interior View）——展示匯流排→NFB 的走線佈局，讓玩家透過車道排列學習整線概念。此元件是後續束帶工具、整線評分的視覺基礎。

## What Changes

- 新增 `PanelInteriorView` SVG 元件，繪製配電箱內部佈局（匯流排區、走線區、NFB/DIN 軌道區）
- 匯流排區繪製 R（紅相）、T（黑相）、N（中性線）三條水平銅排，含分接點標示
- 走線區繪製各迴路線材的垂直車道，線材顏色/粗細依線徑與電壓區分
- NFB 區繪製 DIN 軌道 + NFB 迷你圖示 + 迴路標籤
- 車道拖曳互動：Pointer Events 拖曳線材左右移動，snap to nearest lane，平滑 transition
- 交叉視覺標示：偵測車道排列的逆序數，交叉處紅色高亮 + 叉叉圖示
- 響應式設計：桌面 80% / 平板 90% / 手機全螢幕 overlay
- 配電箱金屬質感外殼（深灰背景 + 微光澤 + 螺絲裝飾）

## Capabilities

### New Capabilities
- `panel-interior-view`: 配電箱內部 SVG 視圖元件，含匯流排、走線區、NFB 區的繪製與車道拖曳互動

### Modified Capabilities
（無——此 change 為獨立新元件，不修改既有 spec 的需求）

## Impact

- 新增檔案：`src/components/PanelInteriorView.tsx`
- 新增樣式：`src/App.css` 追加 panel-interior overlay 相關 CSS
- 型別影響：可能需在 `src/types/game.ts` 新增 lane/routing 相關型別（但不修改既有型別）
- 無依賴變更、無 API 變更、不影響既有 L01–L20 功能
