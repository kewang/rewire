# game-ui Specification

## Purpose
TBD - created by archiving change game-ui. Update Purpose after archive.
## Requirements
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

### Requirement: Status display text contrast

狀態面板中的所有文字 MUST 在深色背景上具有足夠的對比度（WCAG AA 標準，至少 4.5:1）。

#### Scenario: Label 文字可讀

- **WHEN** 狀態面板顯示時
- **THEN** label 文字（如「狀態」、「總電流」）MUST 在深色背景上清晰可讀

#### Scenario: Value 文字可讀

- **WHEN** 狀態面板顯示數值時
- **THEN** 數值文字（如電流值、時間值）MUST 在深色背景上清晰可讀，使用明確設定的亮色前景色

