## ADDED Requirements

### Requirement: Step Bar Guide
PanelInteriorView SHALL 在 score bar 上方顯示水平步驟引導列，包含 3 個步驟。

#### Scenario: Step 1 active when crossings exist
- **WHEN** crossings > 0
- **THEN** 步驟 1「消除交叉」為 active 狀態（高亮），步驟 2、3 為 pending

#### Scenario: Step 2 active when no crossings but unbundled pairs exist
- **WHEN** crossings === 0 且有未束帶的平行線對
- **THEN** 步驟 1 為 done（打勾），步驟 2「放置束帶」為 active，步驟 3 為 pending

#### Scenario: Step 3 active when all done
- **WHEN** crossings === 0 且所有平行線對已束帶
- **THEN** 步驟 1、2 為 done，步驟 3「完成整線」為 active

#### Scenario: Steps are non-blocking
- **WHEN** 玩家在任何步驟狀態下點擊「完成整線」
- **THEN** overlay 正常關閉（步驟僅為指引，不強制順序）

### Requirement: Drag Hint Text
走線區頂部 SHALL 顯示半透明提示文字「← 拖曳調整順序 →」。

#### Scenario: Hint visible on first open
- **WHEN** 玩家首次進入 overlay（未拖曳過）
- **THEN** 走線區頂部顯示拖曳提示

#### Scenario: Hint disappears after drag
- **WHEN** 玩家完成一次拖曳操作
- **THEN** 拖曳提示消失（不再顯示）

### Requirement: Wire Labels
每條走線 SHALL 在走線區中段顯示迴路名稱標籤。

#### Scenario: Label content
- **WHEN** circuitConfig.label = '廚房'
- **THEN** 對應走線中段顯示「廚房」文字標籤

#### Scenario: Label styling
- **WHEN** 走線標籤渲染
- **THEN** 標籤為白色文字 + 半透明深色背景圓角矩形

### Requirement: Cable Tie Tooltip
available 狀態的束帶放置點 SHALL 有操作提示。

#### Scenario: SVG title tooltip
- **WHEN** 玩家 hover available 狀態的束帶放置點
- **THEN** 顯示原生 tooltip「點擊綁束帶」

#### Scenario: Placed tie tooltip
- **WHEN** 玩家 hover 已放置束帶的位置
- **THEN** 顯示原生 tooltip「點擊移除束帶」
