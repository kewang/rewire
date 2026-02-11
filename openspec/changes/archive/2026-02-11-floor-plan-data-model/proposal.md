## Why

v0.9 的平面圖模式需要空間資料結構來描述房型佈局、走線路徑和距離關係。目前遊戲缺乏空間概念——所有走線距離固定為 10m，無法表達「遠處房間拉線較貴」的真實配電體驗。建立平面圖資料模型是整個 v0.9 的基石，後續的路由引擎、視覺渲染、互動系統都依賴這些型別。

## What Changes

- 新增 `src/types/floorPlan.ts`：定義 FloorPlan、FloorPlanRoom、FloorPlanOutlet、RoutingGraph、RoutingNode、RoutingEdge 型別
- 新增 `src/data/floorPlans.ts`：4 種預設房型定義（S 套房 4×4、M 兩房 6×4、L 三房 8×6、XL 豪宅 10×6），含完整房間佈局、出線口位置、配電箱位置、RoutingGraph 走線路徑圖
- 修改 `src/types/game.ts`：FixedCircuitLevel 和 FreeCircuitLevel 新增可選 `floorPlan?: FloorPlan` 欄位
- FloorPlanOutlet.type 包含 `'power' | 'network'`，v0.9 僅使用 power，為 v1.0 弱電預留

## Capabilities

### New Capabilities
- `floor-plan-types`: FloorPlan / FloorPlanRoom / FloorPlanOutlet / RoutingGraph / RoutingNode / RoutingEdge 型別定義，描述平面圖空間結構
- `preset-floor-plans`: 4 種預設房型（S/M/L/XL）完整定義，含房間、出線口、配電箱、走線路徑圖

### Modified Capabilities
- `free-circuit-level`: Level 型別擴充 floorPlan 可選欄位（FixedCircuitLevel + FreeCircuitLevel）

## Impact

- **新增檔案**：`src/types/floorPlan.ts`、`src/data/floorPlans.ts`
- **修改檔案**：`src/types/game.ts`（Level 型別擴充）
- **無 breaking change**：floorPlan 為可選欄位，缺少時 fallback 到舊 CircuitDiagram 視圖
- **模擬引擎不受影響**：純資料模型變更，不影響 simulation.ts
- **後續 change 依賴**：routing-engine、floor-plan-renderer 等所有 v0.9 change 都依賴此資料模型
