## MODIFIED Requirements

### Requirement: Cable Tie Props
PanelInteriorView SHALL 新增 props：`cableTies: Set<number>` 和 `onToggleCableTie: (pairIndex: number) => void`。cableTies 表示已放束帶的相鄰車道 pair index，onToggleCableTie 為 toggle 回調。

#### Scenario: Receive cable tie state
- **WHEN** PanelInteriorView 接收 cableTies = Set([0, 2])
- **THEN** pair index 0 和 2 的束帶放置點顯示已放置狀態

#### Scenario: Toggle callback fires
- **WHEN** 玩家點擊 pair index 1 的放置點
- **THEN** onToggleCableTie(1) 被呼叫

### Requirement: Cable Tie Placement Points Rendering
走線區中每對相鄰車道之間 SHALL 渲染一個可點擊的束帶放置點。放置點位於兩條線材的垂直中間位置、走線區的水平中央。

#### Scenario: Placement points count
- **WHEN** PanelInteriorView 顯示 4 條車道
- **THEN** 走線區顯示 3 個束帶放置點

#### Scenario: Placement point position
- **WHEN** lane[i] 在 x=100、lane[i+1] 在 x=164
- **THEN** 放置點中心在 x=132、y=走線區垂直中央

### Requirement: Cable Tie Visual States
放置點 SHALL 依狀態顯示不同視覺效果。

#### Scenario: Available (no tie, no crossing)
- **WHEN** 相鄰線材平行且未放束帶
- **THEN** 放置點顯示淡黃色虛線提示，hover 時高亮

#### Scenario: Placed cable tie
- **WHEN** cableTies 包含此 pair index
- **THEN** 顯示綠色束帶圖示（環繞兩條線的束帶造型）

#### Scenario: Crossing disabled
- **WHEN** 兩條相鄰線材的路徑交叉
- **THEN** 放置點顯示 disabled（紅色半透明 + cursor: not-allowed）

### Requirement: Aesthetics Score Display
PanelInteriorView score bar SHALL 新增 `aestheticsScore` prop 顯示。

#### Scenario: Score bar content
- **WHEN** aestheticsScore = 85
- **THEN** score bar 顯示「交叉數: N | 束帶: M/T | 整線分數: 85」

#### Scenario: Score updates in real-time
- **WHEN** 玩家拖曳車道或放置束帶導致 aestheticsScore 從 70 變 90
- **THEN** score bar 中的分數即時更新為 90
