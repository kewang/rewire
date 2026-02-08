# scoring-and-levels Specification

## Purpose
TBD - created by archiving change scoring-and-levels. Update Purpose after archive.
## Requirements
### Requirement: Cost calculation

系統 MUST 根據選擇的線材和 ELCB 計算成本：成本 = Σ(線長 × 每米單價) + Σ(ELCB 安裝費)。

#### Scenario: 計算純線材成本

- **WHEN** 玩家選擇 2.0mm² 線材（$5/米）且未安裝 ELCB
- **THEN** 成本 MUST 為 10 × 5 = $50

#### Scenario: 計算含 ELCB 成本

- **WHEN** 玩家選擇 2.0mm² 線材（$5/米）且安裝 ELCB（$35）
- **THEN** 成本 MUST 為 10 × 5 + 35 = $85

### Requirement: Level definition

系統 MUST 提供十二個關卡。L01-L05 單迴路，L06-L10 多迴路，L11 相位平衡入門（自動分配），L12 相位平衡進階（手動分配）。

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

#### Scenario: L04 低功率陷阱

- **WHEN** 載入 L04
- **THEN** 目標電器 MUST 為廚下加熱器 + 快煮壺
- **AND** 合計電流（20.9A）MUST 超過 1.6mm² 線材上限（15A）
- **AND** 存活時間 MUST 為 8 秒，使 1.6mm² 在約 6.4 秒燒毀而無法通關
- **AND** 預算 $85 MUST 足夠使用 2.0mm² 線材（$50）

#### Scenario: L05 長時間耐久

- **WHEN** 載入 L05
- **THEN** 目標電器 MUST 為烘衣機（2200W/220V）+ 快煮壺（1500W/110V）
- **AND** 合計電流（23.6A）MUST 超過 2.0mm² 線材上限（20A）
- **AND** 存活時間 MUST 為 15 秒，使 2.0mm² 在約 13.9 秒燒毀而無法通關
- **AND** 預算 $85 MUST 足夠使用 3.5mm² 線材（$80）

#### Scenario: L06 雙迴路入門

- **WHEN** 載入 L06
- **THEN** 關卡 MUST 為 2 迴路配置（廚房 + 客廳）
- **AND** 目標電器 MUST 為快煮壺 + 微波爐 + 吹風機
- **AND** 預算 MUST 為 $120，survivalTime MUST 為 8 秒

#### Scenario: L07 三迴路預算壓力

- **WHEN** 載入 L07
- **THEN** 關卡 MUST 為 3 迴路配置（廚房 + 臥室 + 洗衣間）
- **AND** 目標電器 MUST 為快煮壺 + 廚下加熱器 + 吹風機 + 烘衣機
- **AND** 預算 MUST 為 $130，survivalTime MUST 為 10 秒

#### Scenario: L08 三迴路高負載耐久

- **WHEN** 載入 L08
- **THEN** 關卡 MUST 為 3 迴路配置（廚房A + 廚房B + 客廳）
- **AND** 目標電器 MUST 為快煮壺 + 微波爐 + 廚下加熱器 + 吹風機 + 烘衣機
- **AND** 預算 MUST 為 $180，survivalTime MUST 為 15 秒

#### Scenario: L09 電壓區分

- **WHEN** 載入 L09
- **THEN** 關卡 MUST 包含 110V 和 220V 混合迴路
- **AND** 目標電器 MUST 包含電熱水器（4400W/220V）

#### Scenario: L10 新電器暖身

- **WHEN** 載入 L10
- **THEN** 關卡 MUST 為 2 迴路配置：
  - c1「廚房」110V / 20A NFB — 可用：冰箱、微波爐
  - c2「IH 爐」220V / 20A NFB — 可用：IH 爐
- **AND** 目標電器 MUST 為 IH 爐 + 冰箱 + 微波爐
- **AND** 預算 MUST 為 $150，survivalTime MUST 為 10 秒

#### Scenario: L11 相位平衡入門

- **WHEN** 載入 L11
- **THEN** 關卡 MUST 為 3 迴路配置：
  - c1「廚房」110V / 20A NFB / 紅相(R) — 可用：快煮壺、冰箱
  - c2「客廳」110V / 20A NFB / 黑相(T) — 可用：吹風機、冰箱
  - c3「冷氣」220V / 30A NFB — 可用：冷氣
- **AND** phaseMode MUST 為 `'auto'`
- **AND** 目標電器 MUST 為快煮壺 + 吹風機 + 冰箱 + 冷氣
- **AND** 預算 MUST 為 $200，survivalTime MUST 為 12 秒

#### Scenario: L12 相位平衡進階

- **WHEN** 載入 L12
- **THEN** 關卡 MUST 為 4 迴路配置：
  - c1「廚房A」110V / 20A NFB / 預設紅相(R) — 可用：快煮壺、微波爐、廚下加熱器
  - c2「廚房B」110V / 20A NFB / 預設紅相(R) — 可用：微波爐、廚下加熱器、吹風機
  - c3「客廳」110V / 15A NFB / 預設黑相(T) — 可用：吹風機、冰箱
  - c4「冷氣」220V / 30A NFB — 可用：冷氣
- **AND** phaseMode MUST 為 `'manual'`
- **AND** 目標電器 MUST 為快煮壺 + 微波爐 + 吹風機 + 廚下加熱器 + 冰箱 + 冷氣
- **AND** 預算 MUST 為 $250，survivalTime MUST 為 15 秒

### Requirement: Neutral-burned failure handling

系統 MUST 在 neutral-burned 失敗時正確處理遊戲結束。

#### Scenario: neutral-burned 觸發遊戲結束

- **WHEN** overallStatus 變為 `'neutral-burned'`
- **THEN** 遊戲 MUST 停止送電
- **AND** ResultPanel MUST 顯示「中性線燒毀」失敗訊息

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

