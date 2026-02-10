## Context

目前 `Level` 型別為單一 interface，所有關卡都使用 `circuitConfigs`（固定迴路）。v0.7 需要新增「自由配迴路」模式，玩家自行建立迴路並指派電器。兩種關卡模式需並存——教學關卡(L01-L05)和老屋(L18-L20)保持固定迴路，其他全面改為自由配迴路。

Change 1（new-appliances-and-nfb-cost）已完成：新增 3 種電器 + NFB 成本常數 + L05 bug 修復。本 change 專注於型別定義。

## Goals / Non-Goals

**Goals:**
- 定義 `Room`、`PanelConfig`、`FreeCircuitLevel` 型別
- 將 `Level` 重構為 `FixedCircuitLevel | FreeCircuitLevel` discriminated union
- 新增 type guard 函式方便下游 narrowing
- 擴充 `SimulationStatus` 支援 `'main-tripped'`
- 擴充 `MultiCircuitState` 支援 `mainBreakerTripTimer`
- 確保所有現有程式碼編譯通過（無行為變更）

**Non-Goals:**
- 不實作 CircuitPlanner UI（change 3）
- 不實作 stepMulti 主開關跳脫邏輯（change 4）
- 不建立 FreeCircuitLevel 關卡資料（change 6）
- 不改變任何現有關卡的執行行為

## Decisions

### D1: Discriminated union via 結構判別

**選擇：** 以 `'rooms' in level` 判斷是否為 FreeCircuitLevel，不使用 `kind` / `type` discriminant 欄位。

**理由：**
- PRD 明確指定此方式
- `circuitConfigs` 和 `rooms` 互斥，結構上自然區分
- 減少重構成本——不需為所有現有關卡加 `kind` 欄位

**替代方案：** 加 `kind: 'fixed' | 'free'` discriminant → 更明確，但需改動所有 23 個現有關卡定義。不值得。

### D2: FixedCircuitLevel 保留既有 Level 全部欄位

**選擇：** 將現有 `Level` interface 重新命名為 `FixedCircuitLevel`，保留所有欄位不動。`FreeCircuitLevel` 複製共用欄位 + 新增 `rooms` / `panel`。

**理由：**
- 最小化對既有程式碼的影響
- 共用欄位（name / description / budget / survivalTime / bonusCondition / phaseMode / leakageMode 等）兩邊都有，但不抽 base interface，避免過度抽象

**替代方案：** 抽出 `BaseLevelConfig` → 引入不必要的繼承層級，且 `requiredAppliances` 只在 FixedCircuitLevel 有意義（FreeCircuitLevel 從 rooms 推導）。

### D3: FreeCircuitLevel 不需要 requiredAppliances

**選擇：** `FreeCircuitLevel` 不含 `requiredAppliances` 欄位。所需電器從 `rooms[].appliances` 推導。

**理由：** `requiredAppliances` 是固定迴路的冗餘清單（用於 UI 顯示和計分），自由配迴路中 rooms 已包含完整電器資訊。

### D4: FreeCircuitLevel 使用 requiresRouting 取代 routingMode

**選擇：** `FreeCircuitLevel` 用 `requiresRouting?: boolean`（同 PRD），不沿用固定迴路的 `initialLanes`。

**理由：** 自由配迴路的迴路順序由玩家決定，預設 initialLanes 無意義。

### D5: mainBreakerTripTimer 預設 0

**選擇：** `MultiCircuitState.mainBreakerTripTimer` 預設 0，型別定義時加入。`stepMulti` 的實際跳脫邏輯在 change 4 實作。

**理由：** 本 change 只做型別準備，不改模擬行為。`mainBreakerTripTimer` 初始化為 0 確保向後相容。

## Risks / Trade-offs

- **[Risk] 大量檔案需要 type narrowing** → 本 change 只做型別定義 + 確保編譯通過。GameBoard 等元件的深度整合在後續 change。
- **[Risk] levels.ts 的關卡定義需要型別標註更新** → 使用 `satisfies FixedCircuitLevel` 或在 `LEVELS` 陣列中明確標註，確保既有關卡仍匹配。
- **[Risk] 共用欄位在兩個 interface 重複** → 接受此取捨以避免繼承。若日後欄位過多可重構為 base interface。
