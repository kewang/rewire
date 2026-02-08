## ADDED Requirements

### Requirement: Drag initiation from wire spool

玩家 MUST 能從線材捲（WireSelector）的線材卡片啟動拖曳操作。

#### Scenario: 桌面版滑鼠拖曳啟動

- **WHEN** 玩家在線材卡片上按下滑鼠左鍵並移動
- **THEN** MUST 啟動拖曳模式，游標變為抓取狀態
- **AND** 被拖曳的線材卡片 MUST 顯示半透明視覺提示

#### Scenario: 觸控裝置長按拖曳啟動

- **WHEN** 玩家在線材卡片上長按 150ms 以上
- **THEN** MUST 啟動拖曳模式
- **AND** 頁面捲動 MUST 被抑制，避免與拖曳衝突

#### Scenario: 送電中不可拖曳

- **WHEN** 模擬正在運行（isPowered = true）
- **THEN** 線材卡片 MUST 不可啟動拖曳

### Requirement: Drag preview in circuit diagram

拖曳過程中 MUST 在 CircuitDiagram SVG 內顯示即時線段預覽。

#### Scenario: 顯示虛線預覽

- **WHEN** 拖曳模式啟動且游標移動
- **THEN** CircuitDiagram MUST 顯示從 NFB 底部到游標位置的虛線路徑
- **AND** 虛線顏色 MUST 對應拖曳中線材的線色（依線徑區分）

#### Scenario: 游標離開有效區域

- **WHEN** 游標移出 CircuitDiagram SVG 範圍
- **THEN** 虛線預覽 MUST 繼續顯示但延伸至 SVG 邊界最近點

### Requirement: Drop zone detection

CircuitDiagram MUST 作為有效的放置區域（drop zone），接受拖曳中的線材。

#### Scenario: 進入有效放置區域

- **WHEN** 拖曳中的線材進入 CircuitDiagram 區域
- **THEN** 插座圖示 MUST 顯示高亮邊框（發光效果）
- **AND** MUST 顯示視覺提示表示可放置

#### Scenario: 放置線材完成接線

- **WHEN** 玩家在 CircuitDiagram 區域內放開拖曳
- **THEN** 接線 MUST 確認完成
- **AND** 虛線 MUST 轉變為實線，顯示已連接狀態

#### Scenario: 放置在無效區域

- **WHEN** 玩家在 CircuitDiagram 區域外放開拖曳
- **THEN** 拖曳 MUST 取消，不改變接線狀態
- **AND** 虛線預覽 MUST 消失

### Requirement: Wire connection state

系統 MUST 追蹤當前的接線狀態（是否已接線、接的是哪種線材）。

#### Scenario: 初始狀態為未接線

- **WHEN** 進入關卡
- **THEN** 接線狀態 MUST 為未接線（isWired = false）

#### Scenario: 接線後記錄線材

- **WHEN** 拖曳放置成功
- **THEN** isWired MUST 為 true
- **AND** connectedWire MUST 為放置的線材

#### Scenario: 替換線材

- **WHEN** 已有接線的情況下再次拖入新線材
- **THEN** connectedWire MUST 更新為新線材
- **AND** 電路圖上的線段 MUST 更新為新線材的顏色

#### Scenario: 重試時重置接線狀態

- **WHEN** 玩家點擊重試按鈕
- **THEN** 接線狀態 MUST 重置為未接線

### Requirement: Wiring hint for new players

未接線時 MUST 顯示引導提示，幫助玩家理解操作方式。

#### Scenario: 顯示接線提示

- **WHEN** 接線狀態為未接線且未在拖曳中
- **THEN** CircuitDiagram MUST 在電路圖區域顯示提示文字「拖曳線材到此處接線」
- **AND** NFB 到插座的路徑 MUST 顯示為虛線佔位符

#### Scenario: 拖曳時隱藏提示

- **WHEN** 拖曳模式啟動
- **THEN** 提示文字 MUST 隱藏
