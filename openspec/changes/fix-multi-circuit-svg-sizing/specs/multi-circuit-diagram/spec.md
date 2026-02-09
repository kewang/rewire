## MODIFIED Requirements

### Requirement: Multi-circuit SVG layout

CircuitDiagram MUST 支援並列繪製多個迴路，每個迴路包含 NFB + 線材 + 插座。

#### Scenario: 單迴路佈局不變

- **WHEN** circuits 陣列長度為 1
- **THEN** SVG viewBox 與佈局 MUST 與既有單迴路完全相同（200×280）
- **AND** 視覺外觀 MUST 無任何差異

#### Scenario: 多迴路水平並列

- **WHEN** circuits 陣列長度大於 1
- **THEN** 每個迴路 MUST 水平排列在 SVG 中
- **AND** SVG viewBox 寬度 MUST 依迴路數量動態調整
- **AND** 每個迴路 MUST 包含獨立的 NFB body + 撥桿 + 線材 + 插座

#### Scenario: 迴路標籤

- **WHEN** 多迴路佈局中
- **THEN** 每個迴路 MUST 顯示其 label 文字（如「主迴路」「廚房迴路」）

#### Scenario: SVG maxWidth 上限

- **WHEN** circuits 陣列長度 ≥ 4
- **THEN** SVG inline maxWidth MUST 不超過 1200px
- **AND** SVG MUST 以 `width="100%"` 搭配 capped maxWidth 實現響應式縮放
