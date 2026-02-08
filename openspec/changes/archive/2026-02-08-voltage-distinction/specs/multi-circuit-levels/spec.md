## MODIFIED Requirements

### Requirement: L08 triple-circuit high-load endurance level

系統 MUST 提供 L08 關卡「三迴路高負載耐久」，三條迴路各有高負載電器，共享電器池考驗分配策略。c3 MUST 為 220V 專用迴路。

#### Scenario: L08 關卡配置

- **WHEN** 載入 L08
- **THEN** 關卡 MUST 包含 3 條迴路：
  - c1「廚房A」: 20A NFB, 110V，可用電器 = [快煮壺, 微波爐, 廚下加熱器, 吹風機]
  - c2「廚房B」: 20A NFB, 110V，可用電器 = [快煮壺, 微波爐, 廚下加熱器, 吹風機]
  - c3「洗衣間」: 20A NFB, 220V，可用電器 = [烘衣機]
- **AND** requiredAppliances MUST 為 [快煮壺, 微波爐, 廚下加熱器, 吹風機, 烘衣機]
- **AND** 預算 MUST 為 $180
- **AND** survivalTime MUST 為 15 秒

#### Scenario: L08 均衡分配策略通關

- **WHEN** 玩家將快煮壺+廚下加熱器分到 c1（20.9A）、微波爐分到 c2（10.0A）、烘衣機分到 c3（10.0A）
- **AND** c1 選擇 2.0mm²、c2 選擇 1.6mm²、c3 選擇 1.6mm²
- **THEN** 總成本 MUST 為 $110（$50 + $30 + $30）
- **AND** c1 MUST 在 15 秒內維持 warning 但不燒毀
- **AND** c2 和 c3 MUST 維持 normal 狀態
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

#### Scenario: L08 電壓相容性限制

- **WHEN** 玩家選擇 c3（220V）迴路
- **THEN** 只有烘衣機（220V）MUST 可被分配
- **AND** 110V 電器（快煮壺、微波爐、廚下加熱器）MUST 顯示為 disabled

## ADDED Requirements

### Requirement: L09 voltage-trap level

系統 MUST 提供 L09 關卡「220V 的陷阱」，利用高瓦數 220V 電器（電熱水器 4400W/220V=20A）打破「220V=低電流」的迷思。

#### Scenario: L09 關卡配置

- **WHEN** 載入 L09
- **THEN** 關卡 MUST 包含 3 條迴路：
  - c1「廚房」: 20A NFB, 110V，可用電器 = [快煮壺, 廚下加熱器]
  - c2「浴室」: 20A NFB, 220V，可用電器 = [電熱水器]
  - c3「洗衣間」: 20A NFB, 220V，可用電器 = [烘衣機]
- **AND** requiredAppliances MUST 為 [快煮壺, 廚下加熱器, 電熱水器, 烘衣機]
- **AND** 預算 MUST 為 $130
- **AND** survivalTime MUST 為 10 秒

#### Scenario: L09 正確策略通關

- **WHEN** 玩家為 c1 選擇 2.0mm²、c2 選擇 2.0mm²、c3 選擇 1.6mm²
- **THEN** 總成本 MUST 為 $130（$50 + $50 + $30）
- **AND** c1 MUST 在 10 秒內維持 warning 但不燒毀（20.9A > 20A，overloadRatio=0.045）
- **AND** c2 MUST 維持 normal 狀態（20.0A = 20A maxCurrent）
- **AND** c3 MUST 維持 normal 狀態（10.0A < 15A）
- **AND** MUST 判定為過關

#### Scenario: L09 低估 220V 電流導致燒毀

- **WHEN** 玩家為 c2 選擇 1.6mm²（15A maxCurrent）
- **AND** 電熱水器 20A 接在 c2
- **THEN** c2 overloadRatio MUST 為 0.333（20/15-1）
- **AND** c2 MUST 在數秒內燒毀
- **AND** 玩家 MUST 學到「220V ≠ 低電流」

#### Scenario: L09 過度安全會超預算

- **WHEN** 玩家為 c1 選擇 3.5mm²（$80）
- **THEN** 總成本 MUST 為 $160（$80 + $50 + $30）
- **AND** MUST 超過預算 $130 判定為失敗

### Requirement: Multi-circuit level difficulty progression with voltage

多迴路關卡 MUST 按難度遞增排列在 L06-L09，電壓概念在後半段引入。

#### Scenario: 難度遞增順序含電壓

- **WHEN** 查看 L06-L09 的配置
- **THEN** L06 MUST 為 2 迴路全 110V（入門）
- **AND** L07 MUST 為 3 迴路全 110V + 預算壓力
- **AND** L08 MUST 為 3 迴路混合電壓（110V+220V）+ 負載均衡
- **AND** L09 MUST 為 3 迴路雙 220V + 高瓦數陷阱 + 極限預算
