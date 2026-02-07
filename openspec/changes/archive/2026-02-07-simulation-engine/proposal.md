## Why

遊戲資料模型已就位，但目前缺乏核心的模擬計算邏輯。需要實作電流計算（I = P / V）、斷路器跳脫判定、線材熱度累積與冷卻模型，這是 PRD FR-4 的核心需求，也是整個遊戲玩法的基礎。

## What Changes

- 實作電流計算函式：根據迴路上的電器計算總電流 I_total = Σ(P / V)
- 實作斷路器跳脫判定：總電流超過 NFB 額定時，延遲後觸發跳電
- 實作線材熱度模型：電流超過線材安全電流時熱度累積，低於時冷卻
- 實作狀態判定邏輯：根據熱度與跳脫狀態輸出 Normal / Warning / Tripped / Burned
- 實作模擬步進函式（step）：接收 Circuit 和目前狀態，輸出下一個時間步的狀態

## Capabilities

### New Capabilities
- `simulation-engine`: 電流計算、熱度模型、狀態判定的純函式模擬引擎

### Modified Capabilities

## Impact

- 新增 `src/engine/simulation.ts`：模擬引擎核心邏輯
- 依賴 `src/types/game.ts` 的型別定義
