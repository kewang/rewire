## 1. 修正跳脫閾值

- [x] 1.1 修改 `src/engine/simulation.ts` 的 `step()` 函式：計算 `tripThreshold = circuit.breaker.ratedCurrent * 1.25`，將跳脫判定從 `totalCurrent > ratedCurrent` 改為 `totalCurrent > tripThreshold`

## 2. 驗證

- [x] 2.1 執行 `npm run build` 確認編譯無錯誤
