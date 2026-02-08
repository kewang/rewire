## MODIFIED Requirements

### Requirement: Power control

玩家 MUST 能透過 CircuitDiagram 內的 NFB 撥桿控制送電與斷電，但 MUST 先完成接線。

#### Scenario: 未接線時禁用送電

- **WHEN** 接線狀態為未接線（isWired = false）
- **THEN** NFB 撥桿 MUST 處於禁用狀態
- **AND** MUST 顯示視覺提示表示需先接線

#### Scenario: 送電

- **WHEN** 玩家透過撥桿操作（拖曳上扳或點擊）觸發送電，且已接線且迴路有電器
- **THEN** 模擬引擎 MUST 開始以 requestAnimationFrame 驅動 step 函式
- **AND** 撥桿 MUST 顯示為 ON 狀態

#### Scenario: 斷電

- **WHEN** 玩家透過撥桿操作（拖曳下扳或點擊）觸發斷電
- **THEN** 模擬迴圈 MUST 停止
- **AND** 模擬狀態 MUST 重置為初始狀態
