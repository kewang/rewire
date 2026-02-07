## 1. 型別定義

- [x] 1.1 建立 `src/types/game.ts`，定義 Wire 型別（crossSection, maxCurrent, costPerMeter）
- [x] 1.2 定義 Appliance 型別（name, power, voltage）
- [x] 1.3 定義 Breaker 型別（ratedCurrent, tripDelay）
- [x] 1.4 定義 Circuit 型別（breaker, wire, appliances）
- [x] 1.5 定義 SimulationStatus 聯合型別（normal, warning, tripped, burned）
- [x] 1.6 定義 Level 型別（name, requiredAppliances, budget, survivalTime）

## 2. 預設常數

- [x] 2.1 建立 `src/data/constants.ts`，匯出預設線材資料（1.6/2.0/5.5 mm²）
- [x] 2.2 匯出預設電器資料（吹風機、快煮壺、微波爐）
- [x] 2.3 匯出預設 NFB 資料（20A, 1.5s）

## 3. 驗證

- [x] 3.1 執行 `npm run build` 確認型別無錯誤
