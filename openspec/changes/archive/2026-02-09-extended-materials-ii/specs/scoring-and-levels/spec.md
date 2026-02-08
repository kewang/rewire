## MODIFIED Requirements

### Requirement: Cost calculation

系統 MUST 根據選擇的線材和 ELCB 計算成本：成本 = Σ(線長 × 每米單價) + Σ(ELCB 安裝費)。

#### Scenario: 計算純線材成本

- **WHEN** 玩家選擇 2.0mm² 線材（$5/米）且未安裝 ELCB
- **THEN** 成本 MUST 為 10 × 5 = $50

#### Scenario: 計算含 ELCB 成本

- **WHEN** 玩家選擇 2.0mm² 線材（$5/米）且安裝 ELCB（$35）
- **THEN** 成本 MUST 為 10 × 5 + 35 = $85

### Requirement: Level definition

系統 MUST 提供十個關卡，每個關卡包含目標電器、預算和通電秒數目標。L01-L05 為單迴路關卡，L06-L09 為多迴路關卡，L10 為新電器暖身關卡。

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
