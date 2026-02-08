## Context

目前型別系統假設單一迴路：`Circuit` 描述一個 NFB + 一條線 + 一組電器，`SimulationState` 只追蹤一個 wireHeat / breakerTripTimer / status。要支援 FR-B 多迴路玩法，需要讓資料模型能表達「配電盤上有 N 個迴路，各自獨立運作」。

此 change 只處理型別定義與資料結構的重構，不涉及模擬引擎邏輯或 UI 變更（那些留給後續的 multi-circuit-engine 和 multi-circuit-ui）。

## Goals / Non-Goals

**Goals:**
- 定義多迴路資料模型：CircuitId、帶識別的 Circuit、獨立的 CircuitState
- 定義整體模擬狀態 MultiCircuitState，包含所有迴路的各自狀態
- 擴展 Level 定義以描述多迴路配置
- 擴展 WiringState 追蹤每個迴路的接線狀態
- 現有 L01-L05 關卡用單一迴路表達（向後相容）
- 保持所有型別 readonly / immutable

**Non-Goals:**
- 模擬引擎 step() 多迴路邏輯（multi-circuit-engine）
- SVG 多迴路佈局（multi-circuit-ui）
- 電器拖曳分配到迴路的 UI（multi-circuit-ui）
- 110V / 220V 區分（voltage-distinction）
- 新增多迴路關卡 L06+（multi-circuit-levels）

## Decisions

### D1: CircuitId 用 string 型別（不用 branded type）

**選擇**: `type CircuitId = string`

**理由**: branded type 增加複雜度但收益有限。迴路數量少（一般 2-4 個），用簡單 string 如 `"c1"`, `"c2"` 即可。TypeScript strict mode 下 Map/Record key 已有足夠型別安全。

**替代方案**: `type CircuitId = string & { readonly __brand: 'CircuitId' }` — 過度工程。

### D2: MultiCircuitState 用 Record<CircuitId, CircuitState> 存每迴路狀態

**選擇**: 每迴路獨立的 `CircuitState`（含 status / wireHeat / breakerTripTimer / totalCurrent），整體狀態用 `Record<CircuitId, CircuitState>` 索引。另有頂層 `elapsed` 和 `overallStatus` 欄位。

**理由**:
- 每迴路需要獨立的跳脫/燒毀判定，不能共用 wireHeat
- Record 比 Array 更適合用 id 索引查找
- 頂層 `overallStatus` 由各迴路最嚴重狀態決定（方便 UI 判斷全局結果）

**替代方案**: 用 `CircuitState[]` 陣列 — 需要額外的 findById 邏輯，不如 Record 直覺。

### D3: Level 用 `circuitConfigs` 描述迴路配置

**選擇**: Level 新增 `circuitConfigs: CircuitConfig[]`，每個 `CircuitConfig` 含 `id`, `label`, `breaker`, `availableAppliances`。現有 `requiredAppliances` 保留作為「全部迴路必須運作的電器總清單」。

**理由**:
- 分離「迴路硬體配置」與「需求目標」
- `availableAppliances` 定義哪些電器*可以*接到該迴路（位置限制，例如廚房迴路只能接廚房電器）
- `requiredAppliances` 作為全局過關條件不變

### D4: WiringState 擴展為 Map 結構

**選擇**: `CircuitWiringState` 描述單迴路接線，`WiringState` 增加 `circuits: Record<CircuitId, CircuitWiringState>` 和 `targetCircuitId: CircuitId | null`（拖曳目標迴路）。

**理由**: 每個迴路需獨立追蹤 isWired / connectedWire，拖曳時需知道目標迴路。

### D5: 向後相容策略 — 單迴路退化為多迴路

**選擇**: 現有 L01-L05 改用新型別表達，每關只有一個 `CircuitConfig`。提供 helper function `createSingleCircuitLevel()` 簡化轉換。

**理由**: 避免維護兩套型別系統。單迴路就是「只有一個迴路的多迴路」。

## Risks / Trade-offs

- **[Breaking change 範圍大]** → 所有引用 Circuit / SimulationState 的檔案都需要適配。Mitigation: 此 change 只改型別定義和資料，不改元件邏輯，讓 TypeScript compiler error 引導後續 change 的修改範圍。
- **[compile error 期間]** → 型別改完後到引擎/UI 適配前，專案會有大量 TS error。Mitigation: 在型別旁提供 shim/adapter（如 `toLegacyState()`）讓現有程式碼暫時可編譯，後續 change 再移除。
- **[過度設計風險]** → 多迴路型別可能比最終需求複雜。Mitigation: 保持型別簡單，只定義確定需要的欄位，不預留擴展。
