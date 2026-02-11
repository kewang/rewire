## Why

v0.9 平面圖模式需要一個 SVG 渲染元件，將 FloorPlan 資料結構（房間、電器插座、配電箱、走線路徑）視覺化呈現。floor-plan-data-model 和 routing-engine 已完成，接下來需要將這些資料轉化為玩家可見的互動畫面，作為取代 CircuitDiagram 的主視圖。

## What Changes

- 新增 `FloorPlanView` SVG 元件，渲染平面圖房間色塊、房間名稱、電器圖示、配電箱標記
- 新增走線路徑 SVG 渲染（候選路徑虛線 + 已選路徑實線 + 線徑顏色）
- 新增路徑距離/成本標籤顯示
- SVG 座標系統：grid 座標 → pixel 轉換（cellSize 控制縮放）
- 房間依迴路分配狀態著色（未指派暗色 / 已指派迴路色邊框）
- 潮濕區域視覺標記（水滴圖示 + 淺藍色調）
- 配電箱圖示（可點擊，未來連接 PanelInteriorView）
- 響應式 SVG（viewBox 自適應）
- i18n 整合（房間名稱多語翻譯）

## Capabilities

### New Capabilities
- `floor-plan-renderer`: FloorPlanView SVG 元件渲染邏輯（房間/插座/配電箱/走線路徑的視覺化）

### Modified Capabilities
（無既有 spec 需修改，此為全新視覺元件）

## Impact

- 新增 `src/components/FloorPlanView.tsx` 元件
- 依賴 `src/types/floorPlan.ts`（FloorPlan 型別）
- 依賴 `src/engine/routing.ts`（RoutePath/RouteCandidate 型別）
- 依賴 `src/data/floorPlans.ts`（預設房型資料）
- 依賴 `src/data/constants.ts`（線材顏色映射）
- 新增 CSS 樣式至 `src/App.css`
- i18n：使用現有 `tRoomName` 翻譯函式
- 不影響現有 CircuitDiagram（並存，未來 change 才整合）
