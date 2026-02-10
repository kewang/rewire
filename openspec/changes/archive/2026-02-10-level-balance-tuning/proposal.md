## Why

v0.7 的自由配迴路關卡（L06-L17, L21-L23）在實作時使用了估算預算，需要經過數值分析後微調。分析發現四類問題：(1) endgame 結算成本漏算 NFB 費用的 bug，(2) 兩個關卡的 bonus 條件數學上不可能達成，(3) 部分關卡預算過鬆或 bonus 依賴 RNG，(4) 主開關額定過高導致負載指示器在多數關卡形同虛設（30-65%，永不觸及橘色警示）。

## What Changes

- **修復 finalCost bug**：endgame 結算的 `finalCost` 加入 NFB 成本（目前只計 wire + ELCB，缺少 NFB）
- **L10 bonus 修正**：`under-budget-ratio: 0.85` 要求 ≤$212，但最低可行成本 $240 → 不可能達成。調高預算或調整 ratio
- **L13 bonus 修正**：`no-trip` 搭配 scripted 漏電事件 → ELCB 必定跳脫 → 不可能達成。改為其他 bonus 類型
- **L14/L15 bonus 調整**：`no-trip` 搭配 random 漏電 → 純靠運氣（54%/36% 機率）。改為技巧可控的 bonus
- **收緊偏鬆關卡預算**：L17（67%）、L22（67%）、L23（74%）預算相對最低成本過於寬鬆
- **收緊主開關額定**：L06-L23（除 L12 已合理外）的 mainBreakerRating 全面下調，讓負載指示器在教學關達 50-65%、中階關 70-80%、進階關 80-90%

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `free-circuit-level-definitions`: 調整 L06-L23 的 budget/bonusCondition/mainBreakerRating 數值
- `planner-game-integration`: 修復 endgame finalCost 計算，加入 NFB 成本

## Impact

- `src/data/levels.ts` — L06-L23 數值變更（budget/bonusCondition/mainBreakerRating）
- `src/components/GameBoard.tsx` — endgame finalCost 計算邏輯修正（line 339-345）
