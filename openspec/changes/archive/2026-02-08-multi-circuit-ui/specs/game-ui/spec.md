## MODIFIED Requirements

### Requirement: Real-time status display

遊戲 MUST 即時顯示迴路的模擬狀態數據。多迴路時 MUST 顯示各迴路摘要。

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

#### Scenario: 多迴路狀態摘要

- **WHEN** 有多個迴路
- **THEN** MUST 顯示各迴路的摘要（label + 狀態 + 電流）
- **AND** 最上方 MUST 保留 overall 狀態

#### Scenario: 響應式狀態面板

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 狀態面板 MUST 全寬顯示且文字大小適當

### Requirement: Failure result display

模擬結束於失敗狀態時，MUST 顯示失敗原因與關鍵數字，多迴路時 MUST 標示失敗迴路。

#### Scenario: 跳電結果

- **WHEN** 模擬狀態變為 tripped
- **THEN** MUST 顯示結果面板，包含失敗類型「跳電」、總電流、NFB 額定電流
- **AND** MUST 提供重試按鈕與返回關卡選擇按鈕

#### Scenario: 燒線結果

- **WHEN** 模擬狀態變為 burned
- **THEN** MUST 顯示結果面板，包含失敗類型「燒線」、總電流、線材安全電流上限
- **AND** MUST 提供重試按鈕與返回關卡選擇按鈕

#### Scenario: 多迴路失敗標示

- **WHEN** 多迴路中迴路 B 為跳電或燒毀
- **THEN** ResultPanel MUST 標示是哪個迴路發生問題
- **AND** MUST 顯示該迴路的相關數據

#### Scenario: 過關成功

- **WHEN** 過關判定成功且未超預算
- **THEN** MUST 顯示成功面板，包含花費與預算差額
- **AND** MUST 提供返回關卡選擇按鈕

#### Scenario: 超預算失敗

- **WHEN** 過關判定成功但超預算
- **THEN** MUST 顯示失敗面板，說明超預算原因與金額差異

#### Scenario: 結果面板自動捲入視野

- **WHEN** 結果面板渲染完成
- **THEN** 頁面 MUST 自動平滑捲動使結果面板進入 viewport
