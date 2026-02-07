## MODIFIED Requirements

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

#### Scenario: 顯示成本與預算

- **WHEN** 在關卡模式中
- **THEN** MUST 顯示線材成本與關卡預算

#### Scenario: 顯示剩餘時間倒數

- **WHEN** 模擬運行中且關卡有 survivalTime
- **THEN** MUST 顯示剩餘時間（survivalTime - elapsed），精確到小數點一位
- **AND** 剩餘時間 MUST 從 survivalTime 遞減至 0.0

#### Scenario: 未送電時顯示完整存活時間

- **WHEN** 模擬尚未開始（elapsed 為 0）
- **THEN** 剩餘時間 MUST 顯示完整的 survivalTime 值
