## MODIFIED Requirements

### Requirement: Random Old House Generator

`src/engine/randomOldHouse.ts` MUST 提供純函式 `generateRandomOldHouse(difficulty: 1 | 2 | 3): FixedCircuitLevel`，生成的關卡 MUST 包含 `floorPlan` 屬性。

#### Scenario: 難度→房型映射

- **WHEN** difficulty = 1
- **THEN** 生成的關卡 MUST 附帶 `floorPlan: FLOOR_PLAN_S`

- **WHEN** difficulty = 2
- **THEN** 生成的關卡 MUST 附帶 `floorPlan: FLOOR_PLAN_M`

- **WHEN** difficulty = 3
- **THEN** 生成的關卡 MUST 附帶 `floorPlan: FLOOR_PLAN_L`

#### Scenario: Room ID 作為迴路標籤

- **WHEN** 生成迴路
- **THEN** CircuitConfig.label MUST 使用 FloorPlan 中對應 room.id（而非中文硬編碼名）
- **AND** 每個迴路 MUST 對應到 FloorPlan 中一個不同的房間
- **AND** 原有 `CIRCUIT_LABEL_KEYS` 中文陣列 MUST 移除

#### Scenario: wetArea 房間分配

- **WHEN** 迴路需要 wetArea（voltage=220V 或 difficulty>=2 決定的 wetArea）
- **THEN** 該迴路 MUST 分配到 FloorPlan 中 `room.wetArea === true` 的房間
- **AND** 非 wetArea 迴路 MUST NOT 分配到 wetArea 房間（優先確保 wetArea 迴路有正確房間）

#### Scenario: 距離成本計算

- **WHEN** 計算修復成本（repairCost）
- **THEN** MUST 使用 `findShortestPath(floorPlan.routingGraph, 'panel', outletNodeId)` 取得走線距離
- **AND** wire 成本 MUST 為 `wire.costPerMeter × routeDistance`（而非 `costPerMeter × DEFAULT_WIRE_LENGTH`）
- **AND** 若 findShortestPath 返回 null，MUST fallback 到 `DEFAULT_WIRE_LENGTH`

#### Scenario: 難度 1（初級）— 維持不變

- **WHEN** difficulty = 1
- **THEN** 生成 MUST 有 2-3 迴路、1-2 問題
- **AND** 問題池 MUST 僅限 bare-wire/wrong-wire-gauge/oxidized-splice
- **AND** 存活時間 MUST 為 13 秒

#### Scenario: 難度 2（中級）— 維持不變

- **WHEN** difficulty = 2
- **THEN** 生成 MUST 有 3-4 迴路、2-3 問題
- **AND** 問題池 MUST 為全 5 種
- **AND** MUST 啟用手動相位
- **AND** 存活時間 MUST 為 16 秒

#### Scenario: 難度 3（高級）— 維持不變

- **WHEN** difficulty = 3
- **THEN** 生成 MUST 有 4-6 迴路、3-5 問題
- **AND** 問題池 MUST 為全 5 種
- **AND** MUST 啟用相位 + 漏電 + 走線
- **AND** 存活時間 MUST 為 19 秒

#### Scenario: 預算計算（含距離）

- **WHEN** 生成隨機老屋關卡
- **THEN** budget MUST 為修復成本 × 1.3（30% 彈性），最低 $100
- **AND** 修復成本 MUST 基於 Dijkstra 走線距離而非固定長度
