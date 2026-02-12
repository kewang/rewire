## Context

隨機老屋生成器 `generateRandomOldHouse()` 是 v0.8 加入的功能，允許玩家隨機挑戰老屋修復關卡。v0.9 為所有 L01-L31 配了平面圖（S/M/L/XL），但隨機老屋生成器尚未整合平面圖，仍使用舊版 CircuitDiagram。

目前的問題：
1. 生成的 `FixedCircuitLevel` 沒有 `floorPlan` 屬性
2. `CIRCUIT_LABEL_KEYS` 使用中文房間名，不匹配 FloorPlan 的 room.id（GameBoard 用 `config.label === room.id || room.label` 建立 roomToCircuitMap）
3. 修復成本使用 `DEFAULT_WIRE_LENGTH`（固定值），而非 routing engine 計算的實際走線距離

## Goals / Non-Goals

**Goals:**
- 生成的隨機關卡附帶 `floorPlan`，進入平面圖模式
- 迴路 label 使用 FloorPlan 的 room.id，讓 roomToCircuitMap 正確匹配
- wetArea 迴路分配到 FloorPlan 中 `wetArea: true` 的房間
- 修復成本使用 Dijkstra 距離計算（星形策略），影響 budget
- 難度→房型映射：難度1→S（4房）、難度2→M（6房）、難度3→L（10房）

**Non-Goals:**
- 不新增房型或修改現有 FloorPlan 定義
- 不修改 GameBoard 或 FloorPlanView（已有完整 floorPlan 支援）
- 不新增 UI 元件（LevelSelect 隨機卡片 UI 已完善）

## Decisions

### D1: 難度→房型映射

| 難度 | 迴路數 | 房型 | 可用房間數 |
|------|--------|------|-----------|
| 1    | 2-3    | S    | 4         |
| 2    | 3-4    | M    | 6         |
| 3    | 4-6    | L    | 10        |

**理由**: S 有 4 房間剛好容納 2-3 迴路。M 有 6 房間給 3-4 迴路。L 有 10 房間給 4-6 迴路。不使用 XL 是因為 XL 有 12 房間過大，且高級難度最多 6 迴路，L 的 10 房間足夠分配。

### D2: Room 分配策略

從選定 FloorPlan 的 rooms 中隨機選取 N 個房間分配給 N 個迴路（1:1 映射）。

- wetArea 迴路 MUST 分配到 `room.wetArea === true` 的房間
- 非 wetArea 迴路分配到剩餘非 wetArea 房間
- 使用 room.id 作為 CircuitConfig.label（取代中文房間名）
- 刪除 `CIRCUIT_LABEL_KEYS` 硬編碼陣列

**理由**: GameBoard 已用 `config.label === room.id || room.label` 匹配，用 room.id 最可靠。

### D3: 距離成本計算

用 `findShortestPath` 計算每個迴路房間到配電箱的最短路徑距離，取代固定 `DEFAULT_WIRE_LENGTH`：

```
repairCost (per circuit needing rewire) = correctWire.costPerMeter × routeDistance
budget = max(100, ceil(totalRepairCost × 1.3 / 10) × 10)
```

**理由**: 平面圖模式下 GameBoard 已使用 `costPerMeter × routeDistance` 計算成本，budget 也應匹配。

**Fallback**: 若 `findShortestPath` 找不到路徑（不應發生），fallback 到 `DEFAULT_WIRE_LENGTH`。

### D4: 每迴路1房間（不使用多房串聯）

隨機老屋是 FixedCircuitLevel（固定迴路），每個 CircuitConfig 對應一個房間。不需要星形/串聯策略選擇。走線路徑為 panel→outlet（direct）。

**理由**: 固定迴路不支援多房間分配，保持簡單。高級難度仍有 `requiresRouting: true` 觸發走線整理（PanelInteriorView），但平面圖上的路徑顯示為 direct。

## Risks / Trade-offs

- **[風險] 房間數不足以容納 wetArea 需求** → 如果選定的 FloorPlan wetArea 房間不夠（如 S 有 2 個 wetArea），而需要更多 wetArea 迴路，分配邏輯需 clamp。實際上 S 有 2 個 wetArea 房間、M 有 2 個、L 有 3 個，足以覆蓋各難度需求。
- **[風險] 距離計算後 budget 可能與固定值時差異大** → 用 Dijkstra 距離通常比 `DEFAULT_WIRE_LENGTH=10` 更大，budget 可能偏高。但這更合理，因為玩家在平面圖上看到的走線距離對應實際成本。
