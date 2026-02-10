## Purpose

CircuitPlanner 摘要區的相位平衡預估面板，在規劃階段即時顯示 R/T/N 電流分布，幫助玩家平衡相位避免中性線過載。

## Requirements

### Requirement: Phase balance preview displays in planner summary

CircuitPlanner 摘要區 MUST 在有 phaseMode 的關卡顯示相位平衡預估面板。

#### Scenario: 有 phaseMode 時顯示相位平衡預估

- **WHEN** 關卡定義了 phaseMode
- **THEN** CircuitPlanner 摘要區 MUST 顯示「相位預估」區塊
- **AND** MUST 顯示 R 相總電流、T 相總電流、N 線電流

#### Scenario: 無 phaseMode 時不顯示

- **WHEN** 關卡未定義 phaseMode
- **THEN** CircuitPlanner 摘要區 MUST 不顯示相位平衡預估

### Requirement: Phase balance preview calculates currents correctly

相位平衡預估 MUST 正確計算 R/T/N 電流。

#### Scenario: 計算 R 相電流

- **WHEN** 有兩條 R 相迴路，電器電流分別為 10.9A 和 13.6A
- **THEN** R 相預估電流 MUST 為 24.5A

#### Scenario: 計算 N 線電流

- **WHEN** R 相電流為 24.5A，T 相電流為 10.0A
- **THEN** N 線預估電流 MUST 為 |24.5 - 10.0| = 14.5A

#### Scenario: 220V 迴路不計入相位預估

- **WHEN** 存在一條 220V 迴路（12.7A）
- **THEN** 該迴路電流 MUST 不計入 R 相或 T 相電流

#### Scenario: 無相位迴路時電流為零

- **WHEN** 沒有任何迴路設定了 phase
- **THEN** R 相、T 相、N 線電流 MUST 均為 0

### Requirement: Phase balance preview updates in real-time

相位平衡預估 MUST 在迴路變更時即時更新。

#### Scenario: 新增電器後更新

- **WHEN** 玩家在 R 相迴路中新增一台電器
- **THEN** R 相電流和 N 線電流 MUST 即時重新計算

#### Scenario: 切換相位後更新

- **WHEN** 玩家將一條迴路從 R 相切換到 T 相
- **THEN** R 相和 T 相電流 MUST 即時重新計算

### Requirement: Neutral current warning color

N 線電流超過 NEUTRAL_MAX_CURRENT 時 MUST 以警告色顯示。

#### Scenario: N 線電流正常

- **WHEN** N 線預估電流 < NEUTRAL_MAX_CURRENT (30A)
- **THEN** N 線數值 MUST 以正常色顯示

#### Scenario: N 線電流超標

- **WHEN** N 線預估電流 >= NEUTRAL_MAX_CURRENT (30A)
- **THEN** N 線數值 MUST 以警告色（紅色）顯示
