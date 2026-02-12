## Why

隨機老屋生成器（`generateRandomOldHouse`）目前沒有指派 `floorPlan` 給生成的關卡，導致隨機關卡仍使用舊版 CircuitDiagram 而非平面圖模式。所有 L01-L31 已配平面圖，隨機老屋是最後缺 floorPlan 的關卡類型。需要補齊讓遊戲體驗一致。

## What Changes

- 修改 `generateRandomOldHouse` 函式，依難度選擇合適的 FloorPlan（難度1→S、難度2→M、難度3→L）
- 將 `CIRCUIT_LABEL_KEYS`（中文房間名）改為使用 FloorPlan 的 room.id，讓 GameBoard 的 `roomToCircuitMap` 匹配邏輯正常運作
- 生成的 `FixedCircuitLevel` 附帶 `floorPlan` 屬性
- 走線成本計算使用 routing engine 的 Dijkstra 距離取代固定 `DEFAULT_WIRE_LENGTH`，影響 `repairCost` 與 `budget` 計算
- wetArea 迴路自動分配到平面圖中有 `wetArea: true` 的房間（浴室/廚房）

## Capabilities

### New Capabilities

（無新 capability — 此 change 是既有 random-old-house capability 的平面圖整合）

### Modified Capabilities

- `random-old-house`: 隨機老屋生成器新增 floorPlan 選擇 + room ID 匹配 + 距離成本計算

## Impact

- `src/engine/randomOldHouse.ts` — 主要修改：新增 floorPlan 選擇、room 分配、距離成本
- `src/data/floorPlans.ts` — 讀取（無修改）
- `src/engine/routing.ts` — 讀取 calcRouteCandidates 計算距離（無修改）
- `src/components/GameBoard.tsx` — 無修改（已有 `level.floorPlan` 支援）
- `src/components/LevelSelect.tsx` — 無修改（已正常傳遞 level）
