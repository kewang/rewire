## 1. 型別擴充

- [x] 1.1 在 `src/types/game.ts` 新增 SimulationState 介面（status, totalCurrent, wireHeat, elapsed, breakerTripTimer）
- [x] 1.2 新增模擬用可調常數型別 SimulationConfig（heatRate, coolRate）

## 2. 核心計算函式

- [x] 2.1 建立 `src/engine/simulation.ts`，實作 `calcTotalCurrent(appliances): number`
- [x] 2.2 實作 `createInitialState(): SimulationState`
- [x] 2.3 實作 `step(circuit, state, dt, config?): SimulationState` 純函式

## 3. step 內部邏輯

- [x] 3.1 實作斷路器跳脫判定（電流 > 額定 → 累計計時器 → 超過延遲則 tripped）
- [x] 3.2 實作線材熱度累積與冷卻（過載加熱、正常冷卻、clamp [0,1]、到 1.0 即 burned）
- [x] 3.3 實作狀態判定邏輯（normal / warning / tripped / burned，終態不可逆）

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認型別與編譯無錯誤
