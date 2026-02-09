## ADDED Requirements

### Requirement: Aesthetics Score Calculation
`calcAestheticsScore` 純函式 SHALL 計算整線分數（0–100），公式為：`score = clamp(0, 100, 100 - crossings × CROSSING_PENALTY - unbundledPairs × UNBUNDLED_PENALTY)`。CROSSING_PENALTY = 20，UNBUNDLED_PENALTY = 5。

#### Scenario: Perfect score
- **WHEN** crossings = 0, unbundledPairs = 0
- **THEN** aestheticsScore = 100

#### Scenario: One crossing no unbundled
- **WHEN** crossings = 1, unbundledPairs = 0
- **THEN** aestheticsScore = 80

#### Scenario: No crossing with unbundled pairs
- **WHEN** crossings = 0, unbundledPairs = 4
- **THEN** aestheticsScore = 80

#### Scenario: Multiple penalties
- **WHEN** crossings = 2, unbundledPairs = 2
- **THEN** aestheticsScore = 50

#### Scenario: Score floor at zero
- **WHEN** crossings = 5, unbundledPairs = 5
- **THEN** aestheticsScore = 0（不低於 0）

### Requirement: Unbundled Pairs Count
`countUnbundledPairs` 函式 SHALL 計算相鄰且平行（不交叉）但未放束帶的線對數量。

#### Scenario: All bundled
- **WHEN** 3 對相鄰線材皆平行且全部已束帶
- **THEN** unbundledPairs = 0

#### Scenario: Some unbundled
- **WHEN** 3 對相鄰線材皆平行，僅 1 對已束帶
- **THEN** unbundledPairs = 2

#### Scenario: Crossing pairs not counted
- **WHEN** 3 對相鄰線材中 1 對交叉（無法束帶），另 2 對平行且已束帶
- **THEN** unbundledPairs = 0（交叉的不計入未束帶）

### Requirement: Scoring Constants
CROSSING_PENALTY 和 UNBUNDLED_PENALTY SHALL 定義在 `constants.ts`。

#### Scenario: Constants accessible
- **WHEN** 引入 constants
- **THEN** CROSSING_PENALTY = 20, UNBUNDLED_PENALTY = 5

### Requirement: Crossing Detection Shared Function
detectCrossings 函式 SHALL 從 PanelInteriorView 提取到 `aesthetics.ts`，供 PanelInteriorView 和 GameBoard 共用。

#### Scenario: PanelInteriorView uses shared function
- **WHEN** PanelInteriorView 計算交叉
- **THEN** 使用從 aesthetics.ts import 的 detectCrossings

#### Scenario: GameBoard uses shared function for scoring
- **WHEN** GameBoard 計算最終整線分數
- **THEN** 使用從 aesthetics.ts import 的 detectCrossings
