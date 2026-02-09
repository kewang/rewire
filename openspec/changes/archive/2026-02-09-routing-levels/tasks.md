# Tasks: routing-levels

## 1. 型別擴充

- [x] 1.1 在 `src/types/game.ts` 的 BonusCondition union 新增 `{ readonly type: 'aesthetics-score'; readonly minScore: number }` member

## 2. calcStars 擴充

- [x] 2.1 在 `src/engine/scoring.ts` 的 `checkBonus` switch 新增 `case 'aesthetics-score'`：回傳 `input.aestheticsScore != null && input.aestheticsScore >= bonusCondition.minScore`
- [x] 2.2 在 `src/engine/scoring.ts` 的 `bonusLabel` switch 新增 `case 'aesthetics-score'`：回傳 `` `整線分數 ≥ ${condition.minScore}` ``

## 3. L21–L23 關卡定義

- [x] 3.1 在 `src/data/levels.ts` 新增 L21「整線入門」：3 迴路（c1 客廳 R/20A, c2 廚房 T/20A, c3 儲藏室 R/15A）、requiresCrimp + requiresRouting、phaseMode auto、budget $150、survivalTime 10、bonusCondition aesthetics-score 90
- [x] 3.2 在 `src/data/levels.ts` 新增 L22「交叉迷宮」：5 迴路（c1 廚房 R/20A, c2 客廳 T/20A, c3 儲藏室 R/15A, c4 陽台 220V/20A, c5 備用 T/15A）、requiresCrimp + requiresRouting、phaseMode manual、budget $300、survivalTime 12、bonusCondition aesthetics-score 80
- [x] 3.3 在 `src/data/levels.ts` 新增 L23「完美配電箱」：6 迴路（c1 廚房 R/20A, c2 客廳 R/20A, c3 儲藏室 T/15A, c4 客廳冷氣 220V/20A, c5 浴室 220V/20A wetArea+ELCB, c6 備用 T/15A）、requiresCrimp + requiresRouting、phaseMode manual、leakageMode random、budget $400、survivalTime 15、bonusCondition aesthetics-score 70

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認 TypeScript 編譯無錯誤（特別是 BonusCondition exhaustive check）
- [x] 4.2 執行 `npm run lint` 確認 ESLint 無錯誤
