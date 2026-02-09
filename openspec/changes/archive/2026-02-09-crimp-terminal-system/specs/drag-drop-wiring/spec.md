## MODIFIED Requirements

### Requirement: Drop zone detection

CircuitDiagram MUST 作為有效的放置區域（drop zone），接受拖曳中的線材。requiresCrimp 關卡 drop 後觸發壓接小遊戲而非直接完成接線。

#### Scenario: 進入有效放置區域

- **WHEN** 拖曳中的線材進入 CircuitDiagram 區域
- **THEN** 插座圖示 MUST 顯示高亮邊框（發光效果）
- **AND** MUST 顯示視覺提示表示可放置

#### Scenario: 放置線材完成接線（非 requiresCrimp）

- **WHEN** 玩家在非 requiresCrimp 關卡的 CircuitDiagram 區域內放開拖曳
- **THEN** 接線 MUST 確認完成
- **AND** 虛線 MUST 轉變為實線，顯示已連接狀態
- **AND** contactResistance MUST 預設為 1.0

#### Scenario: 放置線材觸發壓接（requiresCrimp）

- **WHEN** 玩家在 requiresCrimp 關卡的 CircuitDiagram 區域內放開拖曳
- **THEN** MUST 記錄待壓接的迴路 ID 和線材
- **AND** MUST 彈出壓接小遊戲 overlay
- **AND** 接線狀態 MUST 不標記為 isWired（等壓接完成）

#### Scenario: 壓接完成後標記接線

- **WHEN** 壓接小遊戲完成並確認
- **THEN** 接線狀態 MUST 標記為 isWired
- **AND** circuitCrimps MUST 儲存壓接結果

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

- **WHEN** 拖曳放置成功（非 requiresCrimp 或壓接已完成）
- **THEN** isWired MUST 為 true
- **AND** connectedWire MUST 為放置的線材

#### Scenario: 替換線材

- **WHEN** 已有接線的情況下再次拖入新線材
- **THEN** connectedWire MUST 更新為新線材
- **AND** 電路圖上的線段 MUST 更新為新線材的顏色
- **AND** 若 requiresCrimp，MUST 重新觸發壓接小遊戲

#### Scenario: 重試時重置接線狀態

- **WHEN** 玩家點擊重試按鈕
- **THEN** 接線狀態 MUST 重置為未接線
- **AND** 壓接狀態 MUST 清除
