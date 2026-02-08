## 1. 新增多迴路型別定義

- [x] 1.1 在 `src/types/game.ts` 新增 `CircuitId` 型別（string）
- [x] 1.2 在 `src/types/game.ts` 新增 `CircuitConfig` 介面（id, label, breaker, availableAppliances）
- [x] 1.3 在 `src/types/game.ts` 新增 `CircuitState` 介面（status, totalCurrent, wireHeat, breakerTripTimer）
- [x] 1.4 在 `src/types/game.ts` 新增 `MultiCircuitState` 介面（circuitStates, elapsed, overallStatus）
- [x] 1.5 在 `src/types/game.ts` 新增 `CircuitWiringState` 介面（isWired, connectedWire）

## 2. 修改現有型別

- [x] 2.1 修改 `Circuit` 介面，新增 `id`（CircuitId）和 `label`（string）欄位
- [x] 2.2 修改 `Level` 介面，新增 `circuitConfigs`（readonly CircuitConfig[]）欄位
- [x] 2.3 修改 `WiringState` 介面，新增 `circuits`（Record<CircuitId, CircuitWiringState>）和 `targetCircuitId`（CircuitId | null）欄位

## 3. Helper functions 與轉接層

- [x] 3.1 在 `src/types/helpers.ts` 實作 `createSingleCircuitLevel()` helper function
- [x] 3.2 實作 `toLegacyState(multiState, circuitId)` 轉接函式
- [x] 3.3 實作 `toLegacyCircuit(circuitConfig, connectedWire, assignedAppliances)` 轉接函式
- [x] 3.4 在 `src/engine/simulation.ts` 新增 `createInitialMultiState(circuitIds)` 函式

## 4. 資料適配

- [x] 4.1 更新 `src/data/levels.ts`：L01-L05 改用新 Level 型別（加入 circuitConfigs，每關一個迴路）
- [x] 4.2 確認 `src/data/constants.ts` 的 DEFAULT_BREAKER 等常數保持不變且可被新型別使用

## 5. 編譯驗證與適配

- [x] 5.1 修復所有因型別變更導致的 TypeScript 編譯錯誤（元件中的 Circuit / SimulationState 引用）
- [x] 5.2 確認 `npm run build` 通過無新增錯誤
