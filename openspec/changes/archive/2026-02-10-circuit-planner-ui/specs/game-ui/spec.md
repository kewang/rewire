## MODIFIED Requirements

### Requirement: Power control

玩家 MUST 能透過 CircuitDiagram 內的 NFB 撥桿控制送電與斷電，但 MUST 先完成接線。老屋模式下額外需修復所有問題迴路。自由配迴路關卡 MUST 先完成迴路規劃後才能進入接線/送電流程。

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

#### Scenario: 老屋模式未修復不可送電

- **WHEN** 老屋關卡中仍有問題迴路未修復
- **THEN** NFB 撥桿 MUST 處於禁用狀態
- **AND** MUST 顯示提示「請先修復所有問題迴路」

#### Scenario: 自由配迴路規劃未完成時不顯示接線 UI

- **WHEN** 自由配迴路關卡且 gamePhase = 'planning'
- **THEN** MUST 不顯示 WireSelector / CircuitDiagram / AppliancePanel
- **AND** MUST 顯示 CircuitPlanner 規劃 UI
