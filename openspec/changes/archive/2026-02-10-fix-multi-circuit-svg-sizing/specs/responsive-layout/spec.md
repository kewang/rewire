## MODIFIED Requirements

### Requirement: Desktop layout (≥ 1025px)

桌面版 MUST 維持三欄 layout，但電路圖中欄寬度 MUST ≥ 280px。迴路數 ≥ 4 時 MUST 加寬容器以容納多行電路圖。

#### Scenario: 三欄比例調整

- **WHEN** viewport 寬度 ≥ 1025px
- **THEN** game-main MUST 為三欄 layout
- **AND** 中欄（電路圖區）最小寬度 MUST 為 280px

#### Scenario: 4+ 迴路加寬容器

- **WHEN** viewport 寬度 ≥ 1025px
- **AND** 迴路數 ≥ 4
- **THEN** game-board max-width MUST 加寬至 1500px
- **AND** 三欄 layout MUST 維持不變（線材選擇左、電路圖中、電器右）
