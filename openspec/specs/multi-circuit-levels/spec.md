# multi-circuit-levels Specification

## Purpose
定義多迴路關卡 L06-L08 的配置規格，包含迴路數量、電器分配、預算與通關條件。

## Requirements
### Requirement: L06 dual-circuit introductory level

系統 MUST 提供 L06 關卡「雙迴路入門」，包含廚房和客廳兩條迴路，讓玩家首次體驗多迴路策略。

#### Scenario: L06 關卡配置

- **WHEN** 載入 L06
- **THEN** 關卡 MUST 包含 2 條迴路：
  - c1「廚房」: 20A NFB，可用電器 = [快煮壺, 微波爐]
  - c2「客廳」: 20A NFB，可用電器 = [吹風機]
- **AND** requiredAppliances MUST 為 [快煮壺, 微波爐, 吹風機]
- **AND** 預算 MUST 為 $120
- **AND** survivalTime MUST 為 8 秒

#### Scenario: L06 正確策略可通關

- **WHEN** 玩家為 c1 選擇 3.5mm² 線材、c2 選擇 1.6mm² 線材
- **AND** 將快煮壺和微波爐分配到 c1，吹風機分配到 c2
- **THEN** 總成本 MUST 為 $110（$80 + $30）
- **AND** 兩條迴路 MUST 在 8 秒內維持 normal 狀態
- **AND** MUST 判定為過關

#### Scenario: L06 錯誤策略會失敗

- **WHEN** 玩家為 c1 選擇 2.0mm² 線材
- **AND** 將快煮壺和微波爐分配到 c1（合計 23.6A，超過 20A 線材上限）
- **THEN** c1 MUST 進入 warning 狀態
- **AND** c1 線材 MUST 在 8 秒內因過載燒毀

### Requirement: L07 triple-circuit budget pressure level

系統 MUST 提供 L07 關卡「三迴路預算壓力」，三條迴路搭配緊縮預算，迫使玩家精準選擇線徑。

#### Scenario: L07 關卡配置

- **WHEN** 載入 L07
- **THEN** 關卡 MUST 包含 3 條迴路：
  - c1「廚房」: 20A NFB，可用電器 = [快煮壺, 廚下加熱器]
  - c2「臥室」: 20A NFB，可用電器 = [吹風機]
  - c3「洗衣間」: 20A NFB，可用電器 = [烘衣機]
- **AND** requiredAppliances MUST 為 [快煮壺, 廚下加熱器, 吹風機, 烘衣機]
- **AND** 預算 MUST 為 $130
- **AND** survivalTime MUST 為 10 秒

#### Scenario: L07 預算內通關策略

- **WHEN** 玩家為 c1 選擇 2.0mm²、c2 和 c3 各選 1.6mm² 線材
- **THEN** 總成本 MUST 為 $110（$50 + $30 + $30）
- **AND** c1 MUST 進入 warning 狀態（20.9A > 20A maxCurrent）但不燒毀
- **AND** c2 和 c3 MUST 維持 normal 狀態
- **AND** MUST 判定為過關

#### Scenario: L07 使用最安全線材會超預算

- **WHEN** 玩家為 c1 選擇 3.5mm²（$80）、c2 和 c3 各選 1.6mm²（$30）
- **THEN** 總成本 MUST 為 $140
- **AND** 超過預算 $130
- **AND** MUST 判定為超預算失敗

### Requirement: L08 triple-circuit high-load endurance level

系統 MUST 提供 L08 關卡「三迴路高負載耐久」，三條迴路各有高負載電器，共享電器池考驗分配策略。

#### Scenario: L08 關卡配置

- **WHEN** 載入 L08
- **THEN** 關卡 MUST 包含 3 條迴路：
  - c1「廚房A」: 20A NFB，可用電器 = [快煮壺, 微波爐, 廚下加熱器]
  - c2「廚房B」: 20A NFB，可用電器 = [快煮壺, 微波爐, 廚下加熱器]
  - c3「客廳」: 20A NFB，可用電器 = [吹風機, 烘衣機]
- **AND** requiredAppliances MUST 為 [快煮壺, 微波爐, 廚下加熱器, 吹風機, 烘衣機]
- **AND** 預算 MUST 為 $180
- **AND** survivalTime MUST 為 15 秒

#### Scenario: L08 均衡分配策略通關

- **WHEN** 玩家將快煮壺+廚下加熱器分到 c1（20.9A）、微波爐分到 c2（10.0A）、吹風機+烘衣機分到 c3（20.9A）
- **AND** c1 和 c3 選擇 2.0mm²、c2 選擇 1.6mm²
- **THEN** 總成本 MUST 為 $130（$50 + $30 + $50）
- **AND** c1 和 c3 MUST 在 15 秒內維持 warning 但不燒毀
- **AND** c2 MUST 維持 normal 狀態
- **AND** MUST 判定為過關

#### Scenario: L08 不均衡分配導致燒毀

- **WHEN** 玩家將快煮壺+微波爐分到 c1（23.6A）
- **AND** c1 使用 2.0mm² 線材（maxCurrent 20A）
- **THEN** c1 的 overloadRatio MUST 為 0.18
- **AND** 15 秒內熱度累積 MUST 超過 1.0（約 1.08）
- **AND** c1 MUST 燒毀

#### Scenario: L08 電器分配互斥

- **WHEN** 玩家將快煮壺分配到 c1
- **THEN** c2 的可用電器清單中快煮壺 MUST 消失
- **AND** 玩家不能將同一個快煮壺再分配到 c2

### Requirement: Multi-circuit level difficulty progression

多迴路關卡 MUST 按難度遞增排列在 L06-L08，形成清晰的學習曲線。

#### Scenario: 難度遞增順序

- **WHEN** 查看 L06-L08 的配置
- **THEN** L06 MUST 為 2 迴路（入門）
- **AND** L07 MUST 為 3 迴路 + 預算壓力
- **AND** L08 MUST 為 3 迴路 + 高負載 + 共享電器池 + 長存活時間
