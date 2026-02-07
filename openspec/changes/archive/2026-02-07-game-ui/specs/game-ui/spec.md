## ADDED Requirements

### Requirement: Wire selection

玩家 MUST 能從材料庫中選擇線材，選擇後迴路即時更新。

#### Scenario: 顯示可選線材

- **WHEN** 遊戲畫面載入
- **THEN** MUST 顯示所有可用線材卡片，包含線徑、安全電流、每米成本

#### Scenario: 切換線材

- **WHEN** 玩家點選不同的線材卡片
- **THEN** 當前迴路的線材 MUST 更新為選擇的線材
- **AND** 已選線材 MUST 有視覺標示

### Requirement: Appliance management

玩家 MUST 能將電器加入或移除插座。

#### Scenario: 加入電器

- **WHEN** 玩家點選一個電器
- **THEN** 該電器 MUST 加入迴路的電器清單
- **AND** 面板 MUST 即時更新顯示已插入的電器

#### Scenario: 移除電器

- **WHEN** 玩家點選已插入的電器
- **THEN** 該電器 MUST 從迴路中移除

### Requirement: Power control

玩家 MUST 能透過 NFB 開關控制送電與斷電。

#### Scenario: 送電

- **WHEN** 玩家點擊 NFB 開關且迴路有電器
- **THEN** 模擬引擎 MUST 開始以 requestAnimationFrame 驅動 step 函式
- **AND** NFB 開關 MUST 顯示為「ON」狀態

#### Scenario: 斷電

- **WHEN** 玩家點擊已開啟的 NFB 開關
- **THEN** 模擬迴圈 MUST 停止
- **AND** 模擬狀態 MUST 重置為初始狀態

### Requirement: Real-time status display

遊戲 MUST 即時顯示迴路的模擬狀態數據。

#### Scenario: 顯示關鍵數據

- **WHEN** 模擬運行中
- **THEN** MUST 顯示總電流（A）、線材熱度百分比、當前狀態文字
- **AND** 數據 MUST 每幀更新

#### Scenario: 狀態顏色對應

- **WHEN** 狀態為 normal
- **THEN** 狀態指示 MUST 為綠色
- **WHEN** 狀態為 warning
- **THEN** 狀態指示 MUST 為黃色
- **WHEN** 狀態為 tripped 或 burned
- **THEN** 狀態指示 MUST 為紅色

### Requirement: Failure result display

模擬結束於失敗狀態時，MUST 顯示失敗原因與關鍵數字。

#### Scenario: 跳電結果

- **WHEN** 模擬狀態變為 tripped
- **THEN** MUST 顯示結果面板，包含失敗類型「跳電」、總電流、NFB 額定電流
- **AND** MUST 提供重試按鈕

#### Scenario: 燒線結果

- **WHEN** 模擬狀態變為 burned
- **THEN** MUST 顯示結果面板，包含失敗類型「燒線」、總電流、線材安全電流上限
- **AND** MUST 提供重試按鈕
