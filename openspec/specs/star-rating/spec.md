### Requirement: BonusCondition type definition

系統 MUST 定義 BonusCondition 為 discriminated union，包含以下 5 種類型：

- `{ type: 'no-warning' }` — 全程無任何迴路進入 warning 狀態
- `{ type: 'under-budget-ratio', ratio: number }` — 成本 ≤ budget × ratio
- `{ type: 'time-margin', margin: number }` — 剩餘時間 ≥ margin 秒
- `{ type: 'crimp-quality', minQuality: CrimpQuality }` — 所有迴路壓接品質 ≥ 指定品質
- `{ type: 'no-trip' }` — 全程無任何 NFB/ELCB 跳脫

#### Scenario: TypeScript 型別正確定義

- **WHEN** 在 game.ts 中定義 BonusCondition
- **THEN** MUST 為 discriminated union（以 `type` 欄位區分）
- **AND** 每種類型的額外參數 MUST 有正確型別

### Requirement: Star rating calculation

系統 MUST 提供 `calcStars` 純函式，根據遊戲結果計算 1-3 星。

星等規則：
- 1 星：安全通關（survive survivalTime，worstStatus severity ≤ 2）
- 2 星：1 星條件 + finalCost ≤ budget
- 3 星：2 星條件 + bonusCondition 達成

星等為累進制：必須先達成低星條件才能獲得高星。未通關 = 0 星。

#### Scenario: 通關但超預算

- **WHEN** 玩家安全通關
- **AND** finalCost > budget
- **THEN** 星等 MUST 為 1 星

#### Scenario: 通關且成本達標

- **WHEN** 玩家安全通關
- **AND** finalCost ≤ budget
- **AND** bonusCondition 未達成
- **THEN** 星等 MUST 為 2 星

#### Scenario: 通關且達成所有條件

- **WHEN** 玩家安全通關
- **AND** finalCost ≤ budget
- **AND** bonusCondition 達成
- **THEN** 星等 MUST 為 3 星

#### Scenario: 未通關

- **WHEN** 玩家未通關（burned / neutral-burned / leakage）
- **THEN** 星等 MUST 為 0 星

#### Scenario: Level 無 bonusCondition

- **WHEN** Level 的 bonusCondition 為 undefined
- **THEN** 最高可達 2 星（3 星不可達）

### Requirement: BonusCondition no-warning judgment

`no-warning` 條件 MUST 判定全程無任何迴路曾進入 warning 狀態。

#### Scenario: 全程零預警

- **WHEN** bonusCondition 為 `{ type: 'no-warning' }`
- **AND** 送電期間所有迴路始終未達 warning 狀態
- **THEN** 條件 MUST 判定為達成

#### Scenario: 曾經出現預警

- **WHEN** bonusCondition 為 `{ type: 'no-warning' }`
- **AND** 送電期間任一迴路曾進入 warning 狀態（即使後來恢復）
- **THEN** 條件 MUST 判定為未達成

### Requirement: BonusCondition under-budget-ratio judgment

`under-budget-ratio` 條件 MUST 判定 finalCost ≤ budget × ratio。

#### Scenario: 成本低於目標比率

- **WHEN** bonusCondition 為 `{ type: 'under-budget-ratio', ratio: 0.8 }`
- **AND** budget = $180，finalCost = $130
- **THEN** $130 ≤ $180 × 0.8 = $144，條件 MUST 判定為達成

#### Scenario: 成本高於目標比率

- **WHEN** bonusCondition 為 `{ type: 'under-budget-ratio', ratio: 0.8 }`
- **AND** budget = $180，finalCost = $150
- **THEN** $150 > $144，條件 MUST 判定為未達成

### Requirement: BonusCondition time-margin judgment

`time-margin` 條件 MUST 判定剩餘時間 ≥ margin 秒。

#### Scenario: 剩餘時間充足

- **WHEN** bonusCondition 為 `{ type: 'time-margin', margin: 3 }`
- **AND** 通關時剩餘時間 = 4 秒
- **THEN** 條件 MUST 判定為達成

#### Scenario: 剩餘時間不足

- **WHEN** bonusCondition 為 `{ type: 'time-margin', margin: 3 }`
- **AND** 通關時剩餘時間 = 2 秒
- **THEN** 條件 MUST 判定為未達成

### Requirement: BonusCondition crimp-quality judgment

`crimp-quality` 條件 MUST 判定所有迴路壓接品質 ≥ 指定品質。

品質排序：excellent > good > poor > none。

#### Scenario: 所有迴路壓接達標

- **WHEN** bonusCondition 為 `{ type: 'crimp-quality', minQuality: 'good' }`
- **AND** 所有迴路壓接品質為 excellent 或 good
- **THEN** 條件 MUST 判定為達成

#### Scenario: 有迴路壓接未達標

- **WHEN** bonusCondition 為 `{ type: 'crimp-quality', minQuality: 'good' }`
- **AND** 有迴路壓接品質為 poor
- **THEN** 條件 MUST 判定為未達成

#### Scenario: 非 requiresCrimp 關卡

- **WHEN** bonusCondition 為 `crimp-quality` 但 Level.requiresCrimp 為 false
- **THEN** 條件 MUST 判定為達成（無壓接 = 不適用 = 視為通過）

### Requirement: BonusCondition no-trip judgment

`no-trip` 條件 MUST 判定全程無任何 NFB 或 ELCB 跳脫。

#### Scenario: 全程無跳脫

- **WHEN** bonusCondition 為 `{ type: 'no-trip' }`
- **AND** 送電期間無任何迴路發生 tripped 或 elcb-tripped
- **THEN** 條件 MUST 判定為達成

#### Scenario: 曾發生跳脫

- **WHEN** bonusCondition 為 `{ type: 'no-trip' }`
- **AND** 送電期間任一迴路曾發生 tripped 或 elcb-tripped
- **THEN** 條件 MUST 判定為未達成

### Requirement: Warning and trip tracking in game loop

GameBoard MUST 在 rAF loop 中追蹤 warning 與 trip 事件，供星等計算使用。

#### Scenario: 追蹤 warning 事件

- **WHEN** 送電期間任一迴路 SimulationStatus 為 warning
- **THEN** GameBoard MUST 記錄「曾發生 warning」flag（不可重置）

#### Scenario: 追蹤 trip 事件

- **WHEN** 送電期間任一迴路 SimulationStatus 為 tripped 或 elcb-tripped
- **THEN** GameBoard MUST 記錄「曾發生 trip」flag（不可重置）

#### Scenario: 新一局重置追蹤

- **WHEN** 玩家重新開始或切換關卡
- **THEN** warning 和 trip 追蹤 flag MUST 重置為 false

### Requirement: Star rating localStorage persistence

系統 MUST 使用 localStorage 儲存每關歷史最佳星等。

#### Scenario: 儲存星等

- **WHEN** 玩家通關（stars ≥ 1）
- **AND** 新星等 > 歷史最佳星等（或無歷史紀錄）
- **THEN** MUST 更新 localStorage key `rewire-stars` 的對應 level index

#### Scenario: 不覆蓋更高紀錄

- **WHEN** 玩家通關但新星等 ≤ 歷史最佳星等
- **THEN** MUST NOT 覆蓋歷史紀錄

#### Scenario: localStorage 無資料

- **WHEN** localStorage 無 `rewire-stars` key
- **THEN** 所有關卡歷史星等 MUST 預設為 0

#### Scenario: localStorage 資料格式

- **WHEN** 讀寫 localStorage
- **THEN** key MUST 為 `rewire-stars`
- **AND** value MUST 為 JSON 格式 `Record<number, 0|1|2|3>`（number = level index）

### Requirement: ResultPanel star display

ResultPanel 通關時 MUST 顯示星等視覺。

#### Scenario: 通關顯示星星

- **WHEN** 玩家通關（stars ≥ 1）
- **THEN** ResultPanel MUST 顯示 3 顆星圖示，其中前 N 顆亮、其餘暗（N = stars）
- **AND** MUST 顯示每顆星的達成條件文字（已達成/未達成標示）

#### Scenario: 未通關不顯示星星

- **WHEN** 玩家未通關（stars = 0）
- **THEN** ResultPanel MUST NOT 顯示星等區域

#### Scenario: 星等條件文字

- **WHEN** 顯示星等
- **THEN** 1 星條件文字 MUST 為「安全通關」
- **AND** 2 星條件文字 MUST 為「成本達標」
- **AND** 3 星條件文字 MUST 依 bonusCondition 類型顯示對應描述

### Requirement: LevelSelect star display

LevelSelect 關卡卡片 MUST 顯示歷史最佳星等。

#### Scenario: 有歷史紀錄

- **WHEN** 某關卡 localStorage 有歷史星等 N（1-3）
- **THEN** LevelSelect 該關卡卡片 MUST 顯示 3 顆小星圖示，前 N 顆亮、其餘暗

#### Scenario: 無歷史紀錄

- **WHEN** 某關卡 localStorage 無歷史星等（或為 0）
- **THEN** LevelSelect 該關卡卡片 MUST 顯示 3 顆暗星（或不顯示星星）

#### Scenario: 更新即時反映

- **WHEN** 玩家通關獲得新星等後返回 LevelSelect
- **THEN** 該關卡卡片的星等 MUST 立即反映最新紀錄

### Requirement: CalcStarsInput Aesthetics Score Parameter
CalcStarsInput 介面 SHALL 新增可選欄位 `aestheticsScore?: number`。目前不影響計算邏輯，為 `aesthetics-score` BonusCondition 預留介面。

#### Scenario: Existing behavior unchanged
- **WHEN** calcStars 被呼叫且未提供 aestheticsScore
- **THEN** 計算結果與原本完全相同

#### Scenario: Aesthetics score passed but unused
- **WHEN** calcStars 被呼叫且 aestheticsScore = 85
- **THEN** 計算結果與未提供 aestheticsScore 時相同（啟用 aesthetics-score BonusCondition 後才使用）

#### Scenario: Interface compatibility
- **WHEN** GameBoard 呼叫 calcStars 並傳入 aestheticsScore
- **THEN** TypeScript 型別檢查通過，無編譯錯誤

### Requirement: BonusCondition aesthetics-score type
BonusCondition discriminated union SHALL 包含第 6 種類型：

- `{ type: 'aesthetics-score', minScore: number }` — 整線分數 ≥ 指定分數

#### Scenario: TypeScript 型別正確定義
- **WHEN** 在 game.ts 中定義 BonusCondition
- **THEN** MUST 包含 `{ type: 'aesthetics-score'; minScore: number }` member
- **AND** 現有 5 種類型保持不變

### Requirement: BonusCondition aesthetics-score judgment
`aesthetics-score` 條件 MUST 判定整線分數 ≥ minScore。

#### Scenario: 分數達標
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore = 90
- **THEN** 條件 MUST 判定為達成

#### Scenario: 分數未達標
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore = 70
- **THEN** 條件 MUST 判定為未達成

#### Scenario: aestheticsScore 未提供
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **AND** aestheticsScore 為 undefined
- **THEN** 條件 MUST 判定為未達成

### Requirement: Star rating calculation (aesthetics-score label)
`bonusLabel` 函式 MUST 為 `aesthetics-score` 類型回傳描述文字。

#### Scenario: Label text
- **WHEN** bonusCondition 為 `{ type: 'aesthetics-score', minScore: 80 }`
- **THEN** bonusLabel MUST 回傳「整線分數 ≥ 80」
