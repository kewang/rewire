# scoring-and-levels Specification

## Purpose
TBD - created by archiving change scoring-and-levels. Update Purpose after archive.
## Requirements
### Requirement: Cost calculation

系統 MUST 根據選擇的線材計算成本：成本 = 線長(10m) × 每米單價。

#### Scenario: 計算線材成本

- **WHEN** 玩家選擇 2.0mm² 線材（$5/米）
- **THEN** 成本 MUST 為 10 × 5 = $50

### Requirement: Level definition

系統 MUST 提供三個關卡，每個關卡包含目標電器、預算和通電秒數目標。

#### Scenario: L01 基礎教學

- **WHEN** 載入 L01
- **THEN** 目標電器 MUST 為吹風機（1200W/110V）
- **AND** 預算與通電目標 MUST 讓玩家學會 P/V=I 概念

#### Scenario: L02 燒線陷阱

- **WHEN** 載入 L02
- **THEN** 目標電器 MUST 為吹風機 + 快煮壺
- **AND** 使用 1.6mm² 線材 MUST 會導致燒線

#### Scenario: L03 成本取捨

- **WHEN** 載入 L03
- **THEN** 目標電器 MUST 同 L02
- **AND** 預算 MUST 收緊到無法使用最粗線材

### Requirement: Win condition

系統 MUST 在指定電器正常通電滿目標秒數時判定過關。

#### Scenario: 過關判定

- **WHEN** 模擬狀態的 elapsed 達到關卡的 survivalTime
- **AND** 狀態為 normal 或 warning
- **THEN** MUST 判定為過關

#### Scenario: 超預算失敗

- **WHEN** 過關時線材成本超過關卡預算
- **THEN** MUST 判定為超預算失敗

### Requirement: Level selection UI

系統 MUST 提供關卡選擇畫面，玩家可選擇要挑戰的關卡。

#### Scenario: 顯示關卡列表

- **WHEN** 遊戲啟動或返回選擇畫面
- **THEN** MUST 顯示所有關卡的名稱與簡述

#### Scenario: 選擇關卡進入遊戲

- **WHEN** 玩家點選一個關卡
- **THEN** MUST 進入該關卡的遊戲畫面

