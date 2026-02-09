## MODIFIED Requirements

### Requirement: Desktop layout (≥ 1025px)

桌面版 MUST 維持三欄 layout，但電路圖中欄寬度 MUST ≥ 280px。迴路數 ≥ 4 時 MUST 切換為垂直堆疊佈局以確保電路圖有足夠寬度。

#### Scenario: 三欄比例調整

- **WHEN** viewport 寬度 ≥ 1025px
- **AND** 迴路數 ≤ 3
- **THEN** game-main MUST 為三欄 layout
- **AND** 中欄（電路圖區）最小寬度 MUST 為 280px

#### Scenario: 4+ 迴路垂直堆疊

- **WHEN** viewport 寬度 ≥ 1025px
- **AND** 迴路數 ≥ 4
- **THEN** game-main MUST 切換為垂直堆疊佈局（flex column）
- **AND** 電路圖 MUST 佔滿容器全寬
- **AND** 線材選擇與電器面板 MUST 排列在電路圖下方
