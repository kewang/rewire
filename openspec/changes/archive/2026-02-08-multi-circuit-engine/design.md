## Context

multi-circuit-types 已建立多迴路型別（CircuitState、MultiCircuitState），但引擎和 GameBoard 仍用舊的 SimulationState 單迴路邏輯。此 change 讓引擎和 rAF loop 真正以多迴路方式運算。

目前是過渡階段：L01-L05 都是單迴路（circuitConfigs 只有一個），所以多迴路引擎在當前關卡下行為應與舊版完全一致。

## Goals / Non-Goals

**Goals:**
- step() 改為純 CircuitState 輸入/輸出（不含 elapsed）
- 新增 stepMulti() 迭代多迴路並匯總 overallStatus
- GameBoard rAF loop 改用 MultiCircuitState + stepMulti()
- 透過 toLegacyState() bridge 將 MultiCircuitState 傳給現有子元件
- 保持所有子元件 props 不變（它們仍接收 SimulationState）
- 過關/失敗/buzzing 邏輯改用 MultiCircuitState

**Non-Goals:**
- 子元件改為直接接收 MultiCircuitState（留給 multi-circuit-ui）
- 多迴路 UI 佈局（留給 multi-circuit-ui）
- 新增多迴路關卡（留給 multi-circuit-levels）

## Decisions

### D1: step() 改為 CircuitState → CircuitState

**選擇**: step() 不再管 elapsed，專注於單迴路物理模擬。elapsed 由 stepMulti() 統一管理。

**理由**: 每個迴路共用同一個 elapsed，不應在各迴路 step 裡各自累加。分離職責讓 step() 更純粹。

**影響**: step() 回傳的 SimulationState 中不再有 elapsed 欄位，改回傳 CircuitState。但保留舊 step() 簽名的 overload 讓 TypeScript 相容。

### D2: stepMulti() 作為新的頂層步進函式

**選擇**: `stepMulti(circuits: Circuit[], state: MultiCircuitState, dt: number) → MultiCircuitState`

**流程**:
1. 新 elapsed = state.elapsed + dt
2. 對每個 circuit，取其 CircuitState 呼叫 step()，收集新 CircuitState
3. 用 worstStatus() 計算 overallStatus
4. 組成新的 MultiCircuitState

**理由**: 保持 step() 為純函式單迴路邏輯不變，stepMulti() 只負責迭代和匯總。

### D3: GameBoard 使用 bridge pattern

**選擇**: GameBoard 內部改用 `MultiCircuitState`，但傳給子元件前用 `toLegacyState('c1')` 轉回 `SimulationState`。

**理由**: 最小化變更範圍。子元件（StatusDisplay、CircuitDiagram、ResultPanel）不需要知道多迴路的存在，直到 multi-circuit-ui 才需要改它們。

### D4: 單迴路下保持行為一致

**選擇**: 單迴路（L01-L05）下，stepMulti() 的行為必須與舊 step() 完全一致。

**理由**: 這是純重構，不應改變任何遊戲行為。

## Risks / Trade-offs

- **[行為不一致風險]** → step() 簽名改變後，若有地方遺漏適配會 runtime error。Mitigation: TypeScript strict mode 會抓到型別錯誤。
- **[bridge 層額外成本]** → toLegacyState() 每幀呼叫一次。Mitigation: 只是物件屬性複製，效能忽略不計。
- **[暫時的冗餘]** → SimulationState 和 CircuitState 並存。Mitigation: 等 multi-circuit-ui 完成後可以移除 SimulationState。
