## 1. randomOldHouse.ts 平面圖整合

- [x] 1.1 新增難度→FloorPlan 映射（difficulty 1→FLOOR_PLAN_S、2→FLOOR_PLAN_M、3→FLOOR_PLAN_L），import FloorPlan 常數
- [x] 1.2 移除 `CIRCUIT_LABEL_KEYS` 中文陣列，改為從選定 FloorPlan 的 rooms 中隨機挑選 N 個房間，使用 room.id 作為 CircuitConfig.label
- [x] 1.3 實作 wetArea 房間分配邏輯：wetArea 迴路分配到 `room.wetArea === true` 的房間，非 wetArea 迴路分配到其餘房間
- [x] 1.4 使用 `findShortestPath(floorPlan.routingGraph, 'panel', 'outlet-{roomId}')` 計算走線距離，取代 `DEFAULT_WIRE_LENGTH` 用於 repairCost 計算（含 fallback）
- [x] 1.5 在生成的 `FixedCircuitLevel` 物件中加入 `floorPlan` 屬性

## 2. 驗證與建置

- [x] 2.1 執行 `npm run build` 確認 TypeScript 編譯通過
- [x] 2.2 執行 `npm run lint` 確認無新 lint 錯誤（既有 GameBoard.tsx 錯誤不影響）
