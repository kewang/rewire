## MODIFIED Requirements

### Requirement: Wire selection

玩家 MUST 能從材料庫中拖曳線材到電路圖完成接線，接線後迴路即時更新。

#### Scenario: 顯示可選線材

- **WHEN** 遊戲畫面載入
- **THEN** MUST 顯示所有可用線材卡片，包含線徑、安全電流、每米成本
- **AND** 每張卡片 MUST 可作為拖曳來源

#### Scenario: 拖曳接線

- **WHEN** 玩家從線材卡片拖曳到 CircuitDiagram 並放置
- **THEN** 當前迴路的線材 MUST 更新為拖曳的線材
- **AND** 已接線的線材 MUST 在電路圖上顯示對應的線色與標示

#### Scenario: 替換線材

- **WHEN** 已有接線的情況下玩家拖曳不同線材到電路圖
- **THEN** 迴路線材 MUST 更新為新拖曳的線材
- **AND** 電路圖上的線段 MUST 即時更新

#### Scenario: 手機版水平滾動

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 線材選擇區 MUST 改為水平滾動列表
- **AND** 每張線材卡片 MUST 維持足夠寬度以顯示完整文字

### Requirement: Power control

玩家 MUST 能透過 NFB 開關控制送電與斷電，但 MUST 先完成接線。

#### Scenario: 未接線時禁用送電

- **WHEN** 接線狀態為未接線（isWired = false）
- **THEN** NFB 開關 MUST 處於禁用狀態
- **AND** MUST 顯示視覺提示表示需先接線

#### Scenario: 送電

- **WHEN** 玩家點擊 NFB 開關且已接線且迴路有電器
- **THEN** 模擬引擎 MUST 開始以 requestAnimationFrame 驅動 step 函式
- **AND** NFB 開關 MUST 顯示為「ON」狀態

#### Scenario: 斷電

- **WHEN** 玩家點擊已開啟的 NFB 開關
- **THEN** 模擬迴圈 MUST 停止
- **AND** 模擬狀態 MUST 重置為初始狀態
