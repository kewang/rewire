## ADDED Requirements

### Requirement: Phase selector renders conditionally in CircuitCard

CircuitCard MUST 在符合條件時顯示相位選擇器（R/T toggle）。

#### Scenario: 有 phaseMode 且迴路為 110V 時顯示相位選擇器

- **WHEN** 關卡定義了 `phaseMode`（'auto' 或 'manual'）
- **AND** 迴路電壓為 110V
- **THEN** CircuitCard MUST 顯示相位選擇器

#### Scenario: 迴路為 220V 時不顯示相位選擇器

- **WHEN** 迴路電壓為 220V
- **THEN** CircuitCard MUST 不顯示相位選擇器（220V 為跨相 R-T）

#### Scenario: 關卡無 phaseMode 時不顯示相位選擇器

- **WHEN** 關卡未定義 `phaseMode`
- **THEN** CircuitCard MUST 不顯示相位選擇器

### Requirement: Phase selector allows R/T toggle

玩家 MUST 能透過相位選擇器在 R 相和 T 相之間切換。

#### Scenario: 選擇 R 相

- **WHEN** 玩家點擊「R」按鈕
- **THEN** 迴路的 phase MUST 更新為 'R'
- **AND** R 按鈕 MUST 為 active 狀態

#### Scenario: 選擇 T 相

- **WHEN** 玩家點擊「T」按鈕
- **THEN** 迴路的 phase MUST 更新為 'T'
- **AND** T 按鈕 MUST 為 active 狀態

### Requirement: New 110V circuit defaults to phase R

新建的 110V 迴路在有 phaseMode 的關卡中 MUST 預設為 R 相。

#### Scenario: 新增 110V 迴路時預設 R 相

- **WHEN** 玩家在有 phaseMode 的關卡新增一條 110V 迴路
- **THEN** 該迴路的 phase MUST 為 'R'

### Requirement: Voltage change clears phase for 220V

迴路電壓從 110V 切換為 220V 時 MUST 清除相位。

#### Scenario: 切換到 220V 時清除 phase

- **WHEN** 玩家將迴路電壓從 110V 切換為 220V
- **THEN** 該迴路的 phase MUST 變為 undefined

#### Scenario: 切換到 110V 時恢復預設 phase

- **WHEN** 玩家將迴路電壓從 220V 切換為 110V
- **AND** 關卡有 phaseMode
- **THEN** 該迴路的 phase MUST 設為 'R'（預設值）

### Requirement: Auto phaseMode disables manual toggle

`phaseMode: 'auto'` 時系統自動分配相位，玩家不可切換。

#### Scenario: auto 模式下相位按鈕為 disabled

- **WHEN** 關卡的 phaseMode 為 'auto'
- **THEN** 相位選擇器的 R/T 按鈕 MUST 為 disabled
- **AND** 系統 MUST 自動交替分配相位（第一條 R、第二條 T、第三條 R...）

#### Scenario: manual 模式下相位按鈕為 enabled

- **WHEN** 關卡的 phaseMode 為 'manual'
- **THEN** 相位選擇器的 R/T 按鈕 MUST 為 enabled
