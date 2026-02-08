## Why

multi-circuit-types 已定義了多迴路資料模型（CircuitState、MultiCircuitState 等），但模擬引擎 `step()` 仍然接收/回傳舊的 `SimulationState`，GameBoard 的 rAF loop 也只處理單一迴路。需要讓引擎和遊戲控制器真正支援多迴路獨立運算，才能為後續的多迴路 UI（multi-circuit-ui）鋪路。

## What Changes

- **BREAKING**: `step()` 函式簽名改為接收 `CircuitState` 回傳 `CircuitState`（不含 elapsed）
- 新增 `stepMulti()` 多迴路步進函式，迭代所有迴路呼叫 `step()`，更新 elapsed 和 overallStatus
- GameBoard 的 rAF loop 改用 `MultiCircuitState` + `stepMulti()`，取代原本的單一 `SimulationState` + `step()`
- GameBoard 用 `toLegacyState()` 將 MultiCircuitState 轉換為 SimulationState，傳給現有子元件（StatusDisplay、CircuitDiagram、ResultPanel 等）
- 現有子元件 props **不改**，維持接收 SimulationState
- 過關/失敗判定改用 `overallStatus`
- buzzing 音效改用第一個 warning 迴路的 wireHeat

## Capabilities

### New Capabilities
- `multi-circuit-simulation`: 多迴路步進函式 stepMulti，迭代各迴路獨立運算並匯總 overallStatus

### Modified Capabilities
- `simulation-engine`: step() 簽名改為 CircuitState 輸入/輸出，移除 elapsed 管理

## Impact

- `src/engine/simulation.ts` — step() 簽名改變 + 新增 stepMulti()
- `src/components/GameBoard.tsx` — 核心重構：MultiCircuitState + stepMulti() + toLegacyState bridge
- `src/types/helpers.ts` — 已有 toLegacyState()，無需修改
