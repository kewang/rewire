## MODIFIED Requirements

### Requirement: ELCB cost included in planner total cost

GameBoard 的自由配迴路成本計算 MUST 在所有位置保持一致，包含 wire + NFB + ELCB 三項。

#### Scenario: 含 ELCB 的總成本
- **WHEN** 一條迴路 elcbEnabled 為 true，wire cost = $30，NFB cost = $15
- **THEN** 該迴路成本 MUST = $30 + $15 + $35 = $80
- **AND** 總成本 MUST 包含此 $80

#### Scenario: endgame finalCost 包含 NFB 成本
- **WHEN** 遊戲結束計算 finalCost（用於 over-budget 判定和星等計算）
- **AND** 當前關卡為 FreeCircuitLevel
- **THEN** finalCost MUST 包含每條迴路的 NFB 成本（NFB_COSTS[breaker.ratedCurrent]）
- **AND** finalCost MUST 與 displayedCost 和 plannerTotalCost 數值一致

#### Scenario: 固定迴路關卡不受影響
- **WHEN** 遊戲結束計算 finalCost
- **AND** 當前關卡為 FixedCircuitLevel
- **THEN** finalCost MUST 不包含 NFB 成本（與既有行為相同）
