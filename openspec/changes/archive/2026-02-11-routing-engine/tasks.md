## 1. 型別定義

- [x] 1.1 在 `src/engine/routing.ts` 中定義並 export `RoutePath`、`RouteCandidate`、`RouteCandidates` 型別
- [x] 1.2 實作 `getOutletNodeId(roomId)` 和 `getPanelNodeId()` helper 函式

## 2. Dijkstra 最短路徑

- [x] 2.1 實作 `findShortestPath(graph, fromNodeId, toNodeId)` — 從 edges 建構 adjacency list，執行 Dijkstra，回傳 RoutePath 或 null
- [x] 2.2 處理邊界情況：同一節點、不可達節點、不存在的節點 ID

## 3. 候選方案計算

- [x] 3.1 實作星形（star）候選方案：每個房間獨立計算 panel → outlet 最短路徑，加總距離
- [x] 3.2 實作串聯（daisy-chain）候選方案：貪心最近鄰居演算法，從 panel 出發依序串接各房間
- [x] 3.3 實作 `calcRouteCandidates(floorPlan, roomIds)` — 單房間回傳 direct，多房間回傳 star + daisy-chain
- [x] 3.4 實作 `calcRouteDistance(floorPlan, roomIds, strategy)` — 回傳指定策略的總距離

## 4. 驗證

- [x] 4.1 用 4 種預設房型手動驗證 findShortestPath 計算結果正確性（確認 panel → 各 outlet 的距離合理）
- [x] 4.2 驗證 calcRouteCandidates 的 star vs daisy-chain 距離比較（串聯 ≤ 星形）
- [x] 4.3 確認 `npm run build` 無型別錯誤、`npm run lint` 通過
