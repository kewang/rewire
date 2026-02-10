## 1. 型別定義（game.ts）

- [x] 1.1 新增 `Room` interface（id / name / appliances / wetArea?，readonly）
- [x] 1.2 新增 `PanelConfig` interface（maxSlots / mainBreakerRating，readonly）
- [x] 1.3 新增 `FreeCircuitLevel` interface（name / description / rooms / panel / budget / survivalTime + 可選機制欄位，readonly）
- [x] 1.4 將現有 `Level` interface 重新命名為 `FixedCircuitLevel`
- [x] 1.5 新增 `Level` union type = `FixedCircuitLevel | FreeCircuitLevel`
- [x] 1.6 擴充 `SimulationStatus` 加入 `'main-tripped'`
- [x] 1.7 擴充 `MultiCircuitState` 加入 `mainBreakerTripTimer: number`

## 2. Helper 函式（helpers.ts）

- [x] 2.1 新增 `isFreeCircuitLevel(level: Level): level is FreeCircuitLevel` type guard
- [x] 2.2 新增 `isFixedCircuitLevel(level: Level): level is FixedCircuitLevel` type guard
- [x] 2.3 擴充 `worstStatus` 支援 `'main-tripped'`（severity=3）

## 3. 下游編譯修復

- [x] 3.1 更新 `src/data/levels.ts` — 關卡陣列型別標註改為 `FixedCircuitLevel[]`
- [x] 3.2 更新 `src/engine/simulation.ts` — `stepMulti` 初始化 `mainBreakerTripTimer` 為 0 + 終態保護 + 回傳值包含欄位
- [x] 3.3 更新引用 `Level` 的元件（GameBoard/LevelSelect/StatusDisplay/ResultPanel），確保 TypeScript 編譯通過
- [x] 3.4 執行 `npm run build` 確認全專案無 TypeScript 錯誤 ✓
