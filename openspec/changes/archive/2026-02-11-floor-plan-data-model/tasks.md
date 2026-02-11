## 1. 型別定義

- [x] 1.1 建立 `src/types/floorPlan.ts`，定義 FloorPlanOutlet、FloorPlanRoom、RoutingNode、RoutingEdge、RoutingGraph、FloorPlan interface，全部 readonly + export
- [x] 1.2 修改 `src/types/game.ts`，FixedCircuitLevel 和 FreeCircuitLevel 新增 `floorPlan?: FloorPlan` 可選欄位，import FloorPlan 型別

## 2. 預設房型定義

- [x] 2.1 建立 `src/data/floorPlans.ts`，export FLOOR_PLAN_S 常數（4×4 套房：4 房間 + 配電箱在客廳 + RoutingGraph 含 panel/outlet/corner 節點與邊）
- [x] 2.2 定義 FLOOR_PLAN_M 常數（6×4 兩房：6 房間 + 配電箱在玄關 + RoutingGraph，走線距離 3-8m）
- [x] 2.3 定義 FLOOR_PLAN_L 常數（8×6 三房：10 房間 + 配電箱在玄關 + RoutingGraph，走線距離 3-15m）
- [x] 2.4 定義 FLOOR_PLAN_XL 常數（10×6 豪宅：12 房間 + 配電箱在玄關 + RoutingGraph，走線距離 3-18m）

## 3. 驗證

- [x] 3.1 確認 `npm run build` 編譯通過，無型別錯誤
- [x] 3.2 確認所有房型的 RoutingGraph 為連通圖（panel 可達所有 outlet 節點），RoutingEdge.distance 基於幾何座標正確計算
