## 1. 修復 finalCost NFB 成本 bug

- [x] 1.1 修改 GameBoard.tsx endgame finalCost 計算（line 339-345），對 FreeCircuitLevel 加入 NFB 成本（NFB_COSTS[breaker.ratedCurrent]），需取得 circuitConfigs 和判斷 isFreeLevel

## 2. 調整關卡 budget 和 bonusCondition

- [x] 2.1 L10：budget $250→$280，bonusCondition ratio 0.85→0.9
- [x] 2.2 L13：bonusCondition 從 { type: 'no-trip' } 改為 { type: 'time-margin', margin: 3 }
- [x] 2.3 L14：bonusCondition 從 { type: 'no-trip' } 改為 { type: 'under-budget-ratio', ratio: 0.9 }
- [x] 2.4 L15：bonusCondition 從 { type: 'no-trip' } 改為 { type: 'time-margin', margin: 5 }
- [x] 2.5 L17：budget $180→$150
- [x] 2.6 L22：budget $300→$250
- [x] 2.7 L23：budget $400→$350

## 3. 調整關卡 mainBreakerRating

- [x] 3.1 L06：mainBreakerRating 50→35
- [x] 3.2 L07：mainBreakerRating 50→30
- [x] 3.3 L08：mainBreakerRating 50→40
- [x] 3.4 L09：mainBreakerRating 50→40
- [x] 3.5 L10：mainBreakerRating 75→60
- [x] 3.6 L11：mainBreakerRating 75→50
- [x] 3.7 L13：mainBreakerRating 50→30
- [x] 3.8 L14：mainBreakerRating 50→35
- [x] 3.9 L15：mainBreakerRating 75→60
- [x] 3.10 L16：mainBreakerRating 50→20
- [x] 3.11 L17：mainBreakerRating 50→40
- [x] 3.12 L21：mainBreakerRating 50→30
- [x] 3.13 L22：mainBreakerRating 75→60
- [x] 3.14 L23：mainBreakerRating 75→65

## 4. 驗證

- [x] 4.1 npm run build 確認無編譯錯誤
