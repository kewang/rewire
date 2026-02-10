## 1. 新增電器

- [x] 1.1 在 `src/data/constants.ts` 的 DEFAULT_APPLIANCES 陣列末尾新增電暖器(1800W/110V)、烤箱(1500W/110V)、除濕機(600W/110V)
- [x] 1.2 在 `src/data/levels.ts` 的解構賦值中加入 heater 變數（oven/dehumidifier 因目前無關卡使用，留待後續 change 解構）

## 2. NFB 成本常數

- [x] 2.1 在 `src/data/constants.ts` 新增 NFB_COST_15A=10、NFB_COST_20A=15、NFB_COST_30A=20 常數
- [x] 2.2 在 `src/data/constants.ts` 新增 NFB_COSTS Record 物件（以 ratedCurrent 為 key 查詢單價）

## 3. L05 Bug 修復

- [x] 3.1 在 `src/data/levels.ts` 將 L05 的 requiredAppliances 從 [dryer, kettle] 改為 [heater, kettle]
- [x] 3.2 將 L05 的 circuitConfigs availableAppliances 從 [dryer, kettle] 改為 [heater, kettle]
- [x] 3.3 將 L05 的 breaker 從 DEFAULT_BREAKER(20A) 改為 BREAKER_30A
- [x] 3.4 將 L05 的 budget 從 85 改為 130
- [x] 3.5 將 L05 的 description 更新為「電暖器 + 快煮壺，合計 30A。需要粗線才撐得住！」

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認 TypeScript 編譯無錯誤
- [x] 4.2 執行 `npm run lint` 確認無 lint 警告
