## ADDED Requirements

### Requirement: Cable Tie Placement Points
PanelInteriorView 走線區中，每對相鄰車道之間 SHALL 有一個可點擊的束帶放置點。放置點位於兩條線材的中間位置。

#### Scenario: Display placement points between adjacent lanes
- **WHEN** PanelInteriorView 顯示 4 條車道
- **THEN** 走線區顯示 3 個束帶放置點（lane 0-1 之間、lane 1-2 之間、lane 2-3 之間）

### Requirement: Cable Tie Toggle
點擊放置點 SHALL toggle 束帶狀態：無束帶→放置束帶、已有束帶→移除束帶。每對相鄰線材最多放一條束帶。

#### Scenario: Place cable tie
- **WHEN** 玩家點擊無束帶的放置點
- **THEN** 出現束帶圖示，onToggleCableTie 回調觸發

#### Scenario: Remove cable tie
- **WHEN** 玩家點擊已有束帶的放置點
- **THEN** 束帶圖示消失，onToggleCableTie 回調觸發

### Requirement: Cable Tie Disabled on Crossing
若兩條相鄰線材的路徑交叉，該放置點 SHALL 為 disabled 狀態（不可點擊）。交叉的線無法用束帶固定。

#### Scenario: Crossing pair is disabled
- **WHEN** lane 1 和 lane 2 的走線交叉
- **THEN** lane 1-2 之間的束帶放置點顯示 disabled 狀態（紅色半透明 + 禁止游標）

#### Scenario: Resolving crossing enables placement
- **WHEN** 拖曳車道後消除交叉
- **THEN** 原本 disabled 的放置點變為可點擊

### Requirement: Cable Tie Visual States
放置點 SHALL 依狀態顯示不同視覺：無束帶且不交叉=淡黃色虛線提示、已放束帶=綠色束帶圖示、交叉=disabled 紅色半透明。

#### Scenario: Available placement point appearance
- **WHEN** 相鄰線材平行且未放束帶
- **THEN** 放置點顯示淡黃色虛線提示，hover 時有高亮效果

#### Scenario: Placed cable tie appearance
- **WHEN** 束帶已放置
- **THEN** 顯示綠色束帶圖示（環繞兩條線的束帶造型）

### Requirement: Cable Ties Reset on Lane Drag
車道拖曳改變排列後 SHALL 清除所有束帶，讓玩家重新放置。

#### Scenario: Drag clears cable ties
- **WHEN** 玩家拖曳車道改變排列
- **THEN** 所有已放置的束帶被清除
