## MODIFIED Requirements

### Requirement: CalcStarsInput Aesthetics Score Parameter
CalcStarsInput 介面 SHALL 新增可選欄位 `aestheticsScore?: number`。目前不影響計算邏輯，為 Change 3 的 `aesthetics-score` BonusCondition 預留介面。

#### Scenario: Existing behavior unchanged
- **WHEN** calcStars 被呼叫且未提供 aestheticsScore
- **THEN** 計算結果與原本完全相同

#### Scenario: Aesthetics score passed but unused
- **WHEN** calcStars 被呼叫且 aestheticsScore = 85
- **THEN** 計算結果與未提供 aestheticsScore 時相同（Change 3 才啟用）

#### Scenario: Interface compatibility
- **WHEN** GameBoard 呼叫 calcStars 並傳入 aestheticsScore
- **THEN** TypeScript 型別檢查通過，無編譯錯誤
