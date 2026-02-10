# old-house-mode (delta)

## Changes

### Modified Requirement: Routing Integration

老屋模式與走線整理系統整合。Level 可同時設定 `oldHouse` + `routingMode: 'panel'`。

**流程更新：**
- 遊戲流程：診斷問題 → 修復（拆線/換線/換 NFB/裝 ELCB）→ 整線 → 送電
- `routingReady` 前置條件：需 `!problemsRemaining`（所有問題修復 + 所有迴路接線完成）
- 整線階段在問題全修復後才可進入

### Modified Requirement: Level Definitions

新增 L26-L28 固定關卡：
- **L26 五毒俱全**：4 迴路 + 全 5 種問題（c1 雙問題 wrong-wire-gauge + overrated-breaker）+ 手動相位 + 隨機漏電
- **L27 翻修+整線**：4 迴路 + oldHouse + routingMode 整合 + 初始車道交叉 + aesthetics-score bonus
- **L28 終極考驗**：5 迴路 + 4 問題 + 相位 + 漏電 + 走線 = 全機制綜合畢業考
