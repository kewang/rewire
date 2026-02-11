## MODIFIED Requirements

### Requirement: Drop zone detection

CircuitDiagram MUST 作為有效的放置區域（drop zone），接受拖曳中的線材。requiresCrimp 關卡 drop 後觸發壓接小遊戲而非直接完成接線。在平面圖模式下，FloorPlanView 的房間 SHALL 作為 drop zone，取代 CircuitDiagram 的 SVG 座標偵測。

#### Scenario: 進入有效放置區域（CircuitDiagram）

- **WHEN** 拖曳中的線材進入 CircuitDiagram 區域
- **THEN** 插座圖示 MUST 顯示高亮邊框（發光效果）
- **AND** MUST 顯示視覺提示表示可放置

#### Scenario: 進入有效放置區域（FloorPlanView）

- **WHEN** 拖曳中的線材進入 FloorPlanView 的某房間區域
- **THEN** 房間 MUST 顯示高亮效果（由 highlightedRoomId + dragActive props 控制）
- **AND** GameBoard SHALL 透過 circuitAssignments 查詢房間所屬迴路

#### Scenario: 放置線材完成接線（非 requiresCrimp）

- **WHEN** 玩家在非 requiresCrimp 關卡的有效 drop zone 內放開拖曳
- **THEN** 接線 MUST 確認完成
- **AND** 虛線 MUST 轉變為實線，顯示已連接狀態
- **AND** contactResistance MUST 預設為 1.0

#### Scenario: 放置線材觸發壓接（requiresCrimp）

- **WHEN** 玩家在 requiresCrimp 關卡的有效 drop zone 內放開拖曳
- **THEN** MUST 記錄待壓接的迴路 ID 和線材
- **AND** MUST 彈出壓接小遊戲 overlay
- **AND** 接線狀態 MUST 不標記為 isWired（等壓接完成）

#### Scenario: 壓接完成後標記接線

- **WHEN** 壓接小遊戲完成並確認
- **THEN** 接線狀態 MUST 標記為 isWired
- **AND** circuitCrimps MUST 儲存壓接結果

#### Scenario: 放置在無效區域

- **WHEN** 玩家在有效 drop zone 外放開拖曳
- **THEN** 拖曳 MUST 取消，不改變接線狀態
- **AND** 虛線預覽 MUST 消失

#### Scenario: 平面圖模式下的走線策略選擇

- **WHEN** 玩家在平面圖模式下 drop 線材到多房間迴路
- **THEN** 系統 MUST 先顯示 RoutingStrategyPicker
- **AND** 策略選擇完成後才繼續到 crimp（如 requiresCrimp）或直接完成接線

### Requirement: Wire connection state

系統 MUST 追蹤當前的接線狀態（是否已接線、接的是哪種線材）。平面圖模式下額外追蹤走線策略和路徑距離。

#### Scenario: 初始狀態為未接線

- **WHEN** 進入關卡
- **THEN** 接線狀態 MUST 為未接線（isWired = false）

#### Scenario: 接線後記錄線材

- **WHEN** 拖曳放置成功（非 requiresCrimp 或壓接已完成）
- **THEN** isWired MUST 為 true
- **AND** connectedWire MUST 為放置的線材

#### Scenario: 平面圖模式記錄走線策略和距離

- **WHEN** 在平面圖模式下完成走線策略選擇
- **THEN** circuitRoutingStrategies MUST 記錄所選策略（'direct' | 'star' | 'daisy-chain'）
- **AND** circuitRouteDistances MUST 記錄走線總距離
- **AND** circuitRoutePaths MUST 記錄所選的 RoutePath[]

#### Scenario: 替換線材

- **WHEN** 已有接線的情況下再次拖入新線材
- **THEN** connectedWire MUST 更新為新線材
- **AND** 電路圖上的線段 MUST 更新為新線材的顏色
- **AND** 若 requiresCrimp，MUST 重新觸發壓接小遊戲
- **AND** 若為平面圖多房間迴路，MUST 重新觸發走線策略選擇

#### Scenario: 重試時重置接線狀態

- **WHEN** 玩家點擊重試按鈕
- **THEN** 接線狀態 MUST 重置為未接線
- **AND** 壓接狀態 MUST 清除
- **AND** 走線策略和路徑 MUST 清除
