## MODIFIED Requirements

### Requirement: Multi-circuit SVG layout

CircuitDiagram MUST 支援並列繪製多個迴路，每個迴路包含 NFB + 線材 + 插座。迴路數超過 MAX_CIRCUITS_PER_ROW（4）時 MUST 自動換行排列。

#### Scenario: 單迴路佈局不變

- **WHEN** circuits 陣列長度為 1
- **THEN** SVG viewBox 與佈局 MUST 與既有單迴路完全相同（200×280）
- **AND** 視覺外觀 MUST 無任何差異

#### Scenario: 多迴路水平並列（≤ 4 迴路）

- **WHEN** circuits 陣列長度為 2-4
- **THEN** 每個迴路 MUST 水平排列在同一行
- **AND** SVG viewBox 寬度 MUST 為 n × CIRCUIT_WIDTH
- **AND** 每個迴路 MUST 包含獨立的 NFB body + 撥桿 + 線材 + 插座

#### Scenario: 多迴路多行排列（> 4 迴路）

- **WHEN** circuits 陣列長度 > MAX_CIRCUITS_PER_ROW（4）
- **THEN** 迴路 MUST 排列為多行，每行最多 4 個
- **AND** SVG viewBox 寬度 MUST 為 MAX_CIRCUITS_PER_ROW × CIRCUIT_WIDTH
- **AND** SVG viewBox 高度 MUST 為 rows × CIRCUIT_HEIGHT + (rows-1) × ROW_GAP
- **AND** 每個迴路的位置為 x = (i % 4) × CIRCUIT_WIDTH, y = floor(i / 4) × (CIRCUIT_HEIGHT + ROW_GAP)

#### Scenario: 迴路標籤

- **WHEN** 多迴路佈局中
- **THEN** 每個迴路 MUST 顯示其 label 文字（如「主迴路」「廚房迴路」）

#### Scenario: SVG maxWidth 跟隨每行迴路數

- **WHEN** circuits 陣列長度 > 1
- **THEN** SVG inline maxWidth MUST 為 min(n, MAX_CIRCUITS_PER_ROW) × 260
- **AND** SVG MUST 以 `width="100%"` 搭配 capped maxWidth 實現響應式縮放
