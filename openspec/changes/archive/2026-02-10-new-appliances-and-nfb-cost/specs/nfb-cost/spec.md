## ADDED Requirements

### Requirement: NFB cost constants

系統 MUST 定義三種 NFB 規格的單價常數，供自由配迴路成本計算使用。

#### Scenario: NFB 15A 成本為 $10

- **WHEN** 查詢 NFB_COST_15A 常數
- **THEN** 其值 MUST 為 10

#### Scenario: NFB 20A 成本為 $15

- **WHEN** 查詢 NFB_COST_20A 常數
- **THEN** 其值 MUST 為 15

#### Scenario: NFB 30A 成本為 $20

- **WHEN** 查詢 NFB_COST_30A 常數
- **THEN** 其值 MUST 為 20

### Requirement: NFB cost lookup table

系統 MUST 提供以額定電流查詢 NFB 單價的 Record 物件 `NFB_COSTS`。

#### Scenario: 以 ratedCurrent 查詢 NFB 成本

- **WHEN** 查詢 `NFB_COSTS[15]`、`NFB_COSTS[20]`、`NFB_COSTS[30]`
- **THEN** 回傳值 MUST 分別為 10、15、20
