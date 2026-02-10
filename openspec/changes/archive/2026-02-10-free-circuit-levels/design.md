## Context

v0.7 的前 5 個 changes 已建立完整的自由配迴路基礎設施：

- FreeCircuitLevel / Room / PanelConfig 型別（free-circuit-data-model）
- CircuitPlanner / RoomPanel / CircuitCard UI 元件（circuit-planner-ui）
- stepMulti 主開關跳脫機制（main-breaker-simulation）
- 相位選擇器 / ELCB toggle / 相位平衡預估（planner-phase-elcb）

目前 `src/data/levels.ts` 中 L06-L17 / L21-L23 仍為 FixedCircuitLevel 格式，需全面改寫。

## Goals / Non-Goals

**Goals:**

- 將 L06-L17、L21-L23 全部改寫為 FreeCircuitLevel 格式
- 嚴格依照 PRD v0.7 FR-E 的關卡設計（房間、電器、配電箱規格、預算、存活時間、bonusCondition、機制旗標）
- 確保 TypeScript 型別正確（Level union 自動 discriminated）

**Non-Goals:**

- 不調整 L01-L05（教學固定迴路）
- 不調整 L18-L20（老屋固定迴路）
- 不做 playtest 數值微調（下一個 change: level-balance-tuning）
- 不做 UI/引擎層面的程式碼變更（基礎設施已就緒）

## Decisions

### 1. 純資料替換，不改動程式碼邏輯

**選擇：** 僅修改 `src/data/levels.ts`，不動任何元件/引擎程式碼。

**理由：** GameBoard 已實作 `'rooms' in level` 判斷，CircuitPlanner/相位/ELCB/壓接/走線流程全部就緒。關卡資料格式切換後，既有程式碼會自動走對應流程。

### 2. 新增 destructure 變數用於新電器

**選擇：** 在 levels.ts 頂部 destructure 中新增 `oven`（烤箱）、`dehumidifier`（除濕機）。

**理由：** L07/L08/L10/L12/L22 等關卡使用到這兩種新電器，需要短名引用。`heater`（電暖器）已在 new-appliances-and-nfb-cost 中新增。

### 3. leakageEvents circuitId 使用佔位符

**選擇：** scripted leakageEvent 的 circuitId 使用 `'wetArea'` 佔位符。

**理由：** FreeCircuitLevel 中迴路 ID 在規劃階段才產生。GameBoard 的 `resolvedLeakageEventsRef` 機制已實作動態映射（planner-phase-elcb change），將 `'wetArea'` 映射到實際含 wetArea 電器的迴路。

### 4. 關卡順序維持 index 不變

**選擇：** LEVELS 陣列中 L06-L17 / L21-L23 的 index 位置不變，僅替換內容。

**理由：** localStorage 星等以 index 為 key，位置不變可維持向後相容（雖然內容不同，但 index 對應關係不變）。

## Risks / Trade-offs

- **[預算數值可能不精確]** → PRD 中的預算/插槽/主開關值為設計稿，正式 playtest 時在 level-balance-tuning change 微調。本 change 先忠實照 PRD 實作。
- **[L21-L23 走線相關的 initialLanes 移除]** → FreeCircuitLevel 沒有 initialLanes 欄位（迴路在規劃階段才建立）。走線車道初始排列交由 GameBoard 動態處理。若有需要，未來可在 FreeCircuitLevel 型別中加入此欄位。
