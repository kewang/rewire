## MODIFIED Requirements

### Requirement: BonusCondition type definition
BonusCondition discriminated union SHALL 新增第 6 種類型：

- `{ type: 'aesthetics-score', minScore: number }` — 整線分數 ≥ 指定分數

#### Scenario: TypeScript 型別正確定義
- **WHEN** 在 game.ts 中定義 BonusCondition
- **THEN** MUST 包含 `{ type: 'aesthetics-score'; minScore: number }` member
- **AND** 現有 5 種類型保持不變

### Requirement: BonusCondition aesthetics-score judgment
`aesthetics-score` 條件 MUST 判定整線分數 ≥ minScore。

#### Scenario: 分數達標
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore = 90
- **THEN** 條件 MUST 判定為達成

#### Scenario: 分數未達標
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore = 70
- **THEN** 條件 MUST 判定為未達成

#### Scenario: aestheticsScore 未提供
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore 為 undefined
- **THEN** 條件 MUST 判定為未達成

### Requirement: Star rating calculation (aesthetics-score label)
`bonusLabel` 函式 MUST 為 `aesthetics-score` 類型回傳描述文字。

#### Scenario: Label text
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **THEN** bonusLabel MUST 回傳「整線分數 ≥ 80」
