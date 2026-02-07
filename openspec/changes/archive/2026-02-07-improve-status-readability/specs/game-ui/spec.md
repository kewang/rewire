## ADDED Requirements

### Requirement: Status display text contrast

狀態面板中的所有文字 MUST 在深色背景上具有足夠的對比度（WCAG AA 標準，至少 4.5:1）。

#### Scenario: Label 文字可讀

- **WHEN** 狀態面板顯示時
- **THEN** label 文字（如「狀態」、「總電流」）MUST 在深色背景上清晰可讀

#### Scenario: Value 文字可讀

- **WHEN** 狀態面板顯示數值時
- **THEN** 數值文字（如電流值、時間值）MUST 在深色背景上清晰可讀，使用明確設定的亮色前景色
