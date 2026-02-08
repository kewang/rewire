## 1. 引擎改造

- [x] 1.1 修改 `step()` 簽名：接收 `Circuit` + `CircuitState` + `dt`，回傳 `CircuitState`（移除 elapsed 計算）
- [x] 1.2 新增 `stepMulti(circuits, state, dt)` 函式：迭代各迴路呼叫 step()，更新 elapsed，用 worstStatus() 計算 overallStatus
- [x] 1.3 確認 `createInitialState()` 向後相容保留，`createInitialMultiState()` 不需修改

## 2. GameBoard 重構

- [x] 2.1 GameBoard state 從 `SimulationState` 改為 `MultiCircuitState`（用 `createInitialMultiState(['c1'])` 初始化）
- [x] 2.2 rAF tick 改用 `stepMulti()`：組裝 circuits 陣列 → stepMulti() → 設定新 MultiCircuitState
- [x] 2.3 新增 bridge 邏輯：用 `toLegacyState(multiState, 'c1')` 產生 SimulationState 傳給子元件
- [x] 2.4 過關判定改用 `multiState.elapsed >= level.survivalTime`
- [x] 2.5 終態判定改用 `multiState.overallStatus`（tripped / burned）
- [x] 2.6 buzzing 音效改用 bridge 後的 CircuitState 的 wireHeat 和 status

## 3. 驗證

- [x] 3.1 確認 `npm run build` 通過無新增錯誤
- [x] 3.2 確認 L01-L05 單迴路行為與重構前完全一致（送電、過載、跳脫、燒毀、過關流程）
