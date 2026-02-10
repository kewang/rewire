## Why

v0.8 的老屋驚魂模式需要與 v0.6 的走線整理系統整合，讓高難度老屋關卡需要「修復 + 整線」的完整翻修流程。同時需要新增 L26-L28 三個關卡，漸進引入所有問題類型並綜合所有遊戲機制。

## What Changes

- **oldHouse + routingMode 整合**：Level 可同時設定 oldHouse + routingMode，遊戲流程為「診斷→修復→整線→送電」
- **routingReady 前置條件**：問題全修復 + 所有迴路接線完成後才能進入走線階段
- **L26 五毒俱全**：4 迴路 + 全 5 種問題（c1 雙問題 wrong-wire-gauge + overrated-breaker）+ 手動相位 + 隨機漏電
- **L27 翻修+整線**：4 迴路老屋 + 走線整合，修復後進入配電箱整線，aesthetics-score bonus
- **L28 終極考驗**：5 迴路 + 4 問題 + 相位 + 漏電 + 走線，全機制綜合畢業考

## Capabilities

### Modified Capabilities

- `old-house-mode`: routingReady 前置條件更新——需 !problemsRemaining 才能進入走線

### New Capabilities

- 無（組合既有功能）

## Impact

- **修改**：`GameBoard.tsx`（routingReady 條件更新）、`levels.ts`（新增 L26-L28）
- **無 breaking changes**：L01-L25 完全不受影響
