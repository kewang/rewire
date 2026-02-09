## MODIFIED Requirements

### Requirement: SVG Area Labels
PanelInteriorView SVG SHALL 在三個區域的右側邊緣顯示垂直區域標注文字。

#### Scenario: Area labels rendered
- **WHEN** PanelInteriorView 渲染
- **THEN** 匯流排區右側顯示「匯流排」、走線區右側顯示「走線區」、NFB 區右側顯示「NFB」
- **AND** 標注文字為淡色（#3a4555），90 度旋轉，不干擾主要視覺

#### Scenario: Mobile hidden
- **WHEN** viewport ≤ 640px
- **THEN** 區域標注文字隱藏（手機版空間不足）
