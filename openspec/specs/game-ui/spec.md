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

### Requirement: Level select grid layout

關卡選擇畫面 MUST 以多欄 grid 排列關卡卡片，從左到右、從上到下依序顯示。

#### Scenario: 桌面版多欄顯示

- **WHEN** viewport 寬度 ≥ 1025px
- **THEN** 關卡卡片 MUST 以 grid 排列，自動填充為 3-4 欄
- **AND** 每張卡片最小寬度 MUST 為 260px

#### Scenario: 平板版欄數適配

- **WHEN** viewport 寬度介於 641px-1024px
- **THEN** 關卡卡片 MUST 自動排列為 2 欄

#### Scenario: 手機版排列

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 關卡卡片 MUST 排列為 1 欄（全寬）

#### Scenario: 卡片等高對齊

- **WHEN** 同一行有多張卡片
- **THEN** 同行卡片高度 MUST 一致（由最高卡片決定）

#### Scenario: 電器名稱過長截斷

- **WHEN** 卡片內電器名稱列表超出卡片寬度
- **THEN** MUST 以省略號（ellipsis）截斷，不換行

### Requirement: StatusDisplay main breaker load indicator

StatusDisplay MUST 在 mainBreakerRating 有值時顯示主開關負載指示器。

#### Scenario: 正常負載顯示

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 33A
- **THEN** 顯示「主開關：33A / 50A」
- **AND** 使用預設顏色

#### Scenario: 負載 ≥80% 橘色警告

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 42A（84%）
- **THEN** 顯示「主開關：42A / 50A」
- **AND** 數值文字 MUST 為橘色

#### Scenario: 負載 ≥100% 紅色危險

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 55A（110%）
- **THEN** 顯示「主開關：55A / 50A」
- **AND** 數值文字 MUST 為紅色

#### Scenario: 無 mainBreakerRating 不顯示

- **WHEN** mainBreakerRating 為 undefined
- **THEN** 主開關負載指示器 MUST 不顯示

### Requirement: ResultPanel main-tripped display

ResultPanel MUST 支援 main-tripped 結果的顯示。

#### Scenario: main-tripped 失敗顯示

- **WHEN** 結果 overallStatus 為 `'main-tripped'`
- **THEN** ResultPanel MUST 顯示失敗狀態
- **AND** MUST 包含主開關跳脫相關的失敗文案

### Requirement: GameBoard mainBreakerRating passthrough

GameBoard MUST 從 FreeCircuitLevel 的 panel.mainBreakerRating 取值，在 rAF loop 中傳入 stepMulti。

#### Scenario: FreeCircuitLevel 傳遞 mainBreakerRating

- **WHEN** currentLevel 為 FreeCircuitLevel（有 panel 屬性）
- **THEN** GameBoard MUST 將 panel.mainBreakerRating 傳入 stepMulti

#### Scenario: FixedCircuitLevel 不傳遞

- **WHEN** currentLevel 為 FixedCircuitLevel（無 panel 屬性）
- **THEN** GameBoard MUST 不傳入 mainBreakerRating（或傳 undefined）

### Requirement: Floor plan mode power button in toolbar
When a floor plan is active (`currentFloorPlan` exists), a power toggle button SHALL be rendered in the bottom toolbar area (alongside wire selectors). This button replaces the CircuitDiagram NFB lever for floor plan mode.

#### Scenario: Power button shows "送電" when not powered
- **WHEN** floor plan mode is active and isPowered is false
- **THEN** a button with text "⚡ 送電" SHALL be displayed in the toolbar
- **AND** the button SHALL be styled consistently with the existing toolbar theme

#### Scenario: Power button disabled when conditions not met
- **WHEN** canPowerOn is false (not all circuits wired, or problems unresolved, or routing incomplete)
- **THEN** the power button SHALL be disabled with reduced opacity
- **AND** a tooltip SHALL indicate what conditions are missing

#### Scenario: Power button activates simulation
- **WHEN** player clicks the enabled power button
- **THEN** `handlePowerToggle()` SHALL be invoked, starting the simulation

#### Scenario: Power button shows "斷電" when powered
- **WHEN** simulation is active (isPowered is true)
- **THEN** the button text SHALL change to "⏹ 斷電"
- **AND** clicking SHALL stop the simulation

#### Scenario: Power button only in floor plan mode
- **WHEN** currentFloorPlan is null (no floor plan for this level)
- **THEN** the power button SHALL NOT be rendered (CircuitDiagram NFB lever is used instead)

### Requirement: GameBoard passes simulation state to FloorPlanView
GameBoard SHALL compute and pass a `simulationState` object to FloorPlanView containing the current simulation status of all circuits, derived from `multiState`.

#### Scenario: Simulation state computed from multiState
- **WHEN** GameBoard renders FloorPlanView during active simulation
- **THEN** GameBoard SHALL pass simulationState with: isPowered=true, circuitStates derived from multiState.circuitStates (status, wireHeat, totalCurrent per circuit), and mainTripped from multiState overallStatus

#### Scenario: Simulation state when not powered
- **WHEN** GameBoard renders FloorPlanView before simulation starts
- **THEN** GameBoard SHALL pass simulationState with isPowered=false and empty circuitStates

### Requirement: GameBoard passes problemRooms to FloorPlanView
GameBoard SHALL compute and pass a `problemRooms` map to FloorPlanView, derived from `problemCircuits` and `roomToCircuitMap`.

#### Scenario: Problem circuits mapped to rooms
- **WHEN** an old house level has problemCircuits with unresolved problems
- **THEN** GameBoard SHALL compute which rooms belong to problem circuits and pass `problemRooms` map to FloorPlanView

#### Scenario: No problem rooms for non-old-house levels
- **WHEN** the current level has no oldHouse configuration
- **THEN** GameBoard SHALL not pass problemRooms (or pass undefined) to FloorPlanView

### Requirement: GameBoard passes roomCircuitMap to FloorPlanView
GameBoard SHALL pass the existing `roomToCircuitMap` to FloorPlanView as a prop so FloorPlanView can look up circuit states per room.

#### Scenario: roomCircuitMap derived from existing state
- **WHEN** GameBoard renders FloorPlanView
- **THEN** GameBoard SHALL pass roomCircuitMap containing the mapping from room IDs to CircuitIds

#### Scenario: roomCircuitMap updates on circuit assignment changes
- **WHEN** circuit assignments change (e.g., during planning phase)
- **THEN** the roomCircuitMap prop SHALL reflect the updated assignments

