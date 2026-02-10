## 1. GameBoard routingReady 更新

- [x] 1.1 在 routingReady 計算中加入 `!problemsRemaining` 條件
- [x] 1.2 驗證老屋+走線關卡：問題未全修復時走線按鈕 disabled
- [x] 1.3 驗證問題修復完成後走線按鈕 enabled

## 2. L26-L28 關卡定義

- [x] 2.1 在 levels.ts 新增 L26 五毒俱全（4 迴路 + 5 種問題 + c1 雙問題 + manual phase + random leakage）
- [x] 2.2 在 levels.ts 新增 L27 翻修+整線（4 迴路 + oldHouse + routingMode + initial lanes + aesthetics-score bonus）
- [x] 2.3 在 levels.ts 新增 L28 終極考驗（5 迴路 + 4 問題 + phase + leakage + routing + under-budget-ratio bonus）
- [x] 2.4 驗證 L26-L28 所有 preWiredCircuits 配置正確
- [x] 2.5 驗證 L26-L28 的 budget/survivalTime/bonusCondition 數值合理

## 3. 驗證

- [x] 3.1 TypeScript 編譯通過
- [x] 3.2 既有關卡 L01-L25 無回歸
