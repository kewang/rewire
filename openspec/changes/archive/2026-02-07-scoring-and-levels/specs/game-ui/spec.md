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

### Requirement: Failure result display

模擬結束於失敗狀態時，MUST 顯示失敗原因與關鍵數字。

#### Scenario: 跳電結果

- **WHEN** 模擬狀態變為 tripped
- **THEN** MUST 顯示結果面板，包含失敗類型「跳電」、總電流、NFB 額定電流
- **AND** MUST 提供重試按鈕與返回關卡選擇按鈕

#### Scenario: 燒線結果

- **WHEN** 模擬狀態變為 burned
- **THEN** MUST 顯示結果面板，包含失敗類型「燒線」、總電流、線材安全電流上限
- **AND** MUST 提供重試按鈕與返回關卡選擇按鈕

#### Scenario: 過關成功

- **WHEN** 過關判定成功且未超預算
- **THEN** MUST 顯示成功面板，包含花費與預算差額
- **AND** MUST 提供返回關卡選擇按鈕

#### Scenario: 超預算失敗

- **WHEN** 過關判定成功但超預算
- **THEN** MUST 顯示失敗面板，說明超預算原因與金額差異
