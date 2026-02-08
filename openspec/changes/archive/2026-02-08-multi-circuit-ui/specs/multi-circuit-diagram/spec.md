## ADDED Requirements

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

### Requirement: Per-circuit wire visualization

每個迴路 MUST 獨立顯示接線狀態與熱度。

#### Scenario: 各迴路獨立接線狀態

- **WHEN** 迴路 A 已接線、迴路 B 未接線
- **THEN** 迴路 A MUST 顯示已接線的實線（含線色）
- **AND** 迴路 B MUST 顯示未接線的灰色虛線

#### Scenario: 各迴路獨立熱度顏色

- **WHEN** 迴路 A wireHeat 為 0.5、迴路 B wireHeat 為 0
- **THEN** 迴路 A 的線材 MUST 顯示偏紅色
- **AND** 迴路 B 的線材 MUST 顯示正常色

#### Scenario: 各迴路獨立燒毀特效

- **WHEN** 迴路 A status 為 burned、迴路 B status 為 normal
- **THEN** 迴路 A MUST 顯示斷裂缺口 + 火焰粒子
- **AND** 迴路 B MUST 顯示正常線材

### Requirement: Per-circuit drop zone

拖曳接線時，每個迴路的插座區域 MUST 為獨立的 drop zone。

#### Scenario: 拖曳到特定迴路

- **WHEN** 玩家將線材拖曳到迴路 B 的插座區域
- **THEN** 僅迴路 B 的 drop zone MUST 高亮
- **AND** 放置後僅迴路 B 的接線狀態 MUST 更新

#### Scenario: 拖曳預覽在目標迴路顯示

- **WHEN** 拖曳線材游標經過迴路 A 的範圍
- **THEN** 預覽虛線 MUST 顯示在迴路 A 的線材路徑上
- **AND** 其他迴路 MUST 不顯示預覽

### Requirement: Global power toggle

多迴路時 MUST 有全域送電開關控制所有迴路同時送電/斷電。

#### Scenario: 全域送電條件

- **WHEN** 所有迴路都已完成接線且至少一個迴路有電器
- **THEN** 全域送電開關 MUST 可用

#### Scenario: 部分迴路未接線禁用送電

- **WHEN** 任一迴路尚未完成接線
- **THEN** 全域送電開關 MUST 禁用
