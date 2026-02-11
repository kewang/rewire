## Why

v0.9 平面圖模式的核心遊戲性在於「走線距離影響成本」。floor-plan-data-model 已完成 FloorPlan/RoutingGraph 型別與 4 種預設房型定義，但目前沒有路由演算法能計算配電箱到各出線口的最短路徑，也無法產生星形/串聯候選方案供玩家選擇。本 change 實作走線路由引擎，是後續 floor-plan-renderer 和 floor-plan-wiring-interaction 的基礎依賴。

## What Changes

- 新增 `src/engine/routing.ts`，實作 Dijkstra 最短路徑演算法（基於 RoutingGraph）
- 提供 `findShortestPath(graph, from, to)` 計算單一最短路徑 + 距離
- 提供 `calcRouteCandidates(floorPlan, roomIds)` 計算星形/串聯候選方案
  - 單房間迴路：直接回傳最短路徑
  - 多房間迴路：回傳星形（各房間獨立拉線）和串聯（貪心最近鄰居巡迴）兩種方案
- 新增 `RouteCandidates` / `RouteCandidate` / `RoutePath` 回傳型別
- 提供 `calcRouteDistance(floorPlan, roomIds, strategy)` 計算指定策略的走線總距離（供成本計算使用）

## Capabilities

### New Capabilities
- `routing-algorithm`: Dijkstra 最短路徑演算法 + 星形/串聯候選方案計算 + 走線距離成本

### Modified Capabilities

## Impact

- 新增檔案：`src/engine/routing.ts`
- 新增型別（可在 routing.ts 中 export 或獨立到 types/）：RoutePath, RouteCandidate, RouteCandidates
- 依賴：`src/types/floorPlan.ts`（FloorPlan, RoutingGraph, RoutingNode, RoutingEdge）
- 不影響現有任何元件或引擎（純新增）
