## ADDED Requirements

### Requirement: L16 壓接端子入門

系統 MUST 提供 L16 關卡，首次體驗壓接端子。

#### Scenario: L16 關卡配置

- **WHEN** 載入 L16
- **THEN** 關卡 MUST 為 1 迴路配置：
  - c1「客廳」110V / 20A NFB — 可用：吹風機、冰箱
- **AND** 目標電器 MUST 為吹風機 + 冰箱
- **AND** 預算 MUST 為 $80
- **AND** survivalTime MUST 為 8 秒
- **AND** requiresCrimp MUST 為 true

#### Scenario: L16 壓接品質不影響通關

- **WHEN** 玩家在 L16 完成壓接（任何品質）
- **AND** 使用 2.0mm² 線材
- **THEN** 即使壓接品質為 none（effectiveCurrent = 12.7 × 1.22 = 15.5A），MUST 仍在 20A 安全範圍內不會燒線

### Requirement: L17 端子品質大考驗

系統 MUST 提供 L17 關卡，壓接品質真正影響結果。

#### Scenario: L17 關卡配置

- **WHEN** 載入 L17
- **THEN** 關卡 MUST 為 2 迴路配置：
  - c1「廚房」110V / 20A NFB — 可用：快煮壺、微波爐
  - c2「IH 爐」220V / 20A NFB — 可用：IH 爐
- **AND** 目標電器 MUST 為快煮壺 + 微波爐 + IH 爐
- **AND** 預算 MUST 為 $180
- **AND** survivalTime MUST 為 12 秒
- **AND** requiresCrimp MUST 為 true

#### Scenario: L17 壓接品質 poor 導致 c1 過熱

- **WHEN** 玩家在 L17 c1 使用 3.5mm²（25A）
- **AND** 壓接品質為 poor（contactResistance = 1.25）
- **THEN** effectiveCurrent = 23.6 × √1.25 ≈ 26.4A，超過 25A
- **AND** 線材 MUST 緩慢過熱

#### Scenario: L17 壓接品質 good 以上安全

- **WHEN** 玩家在 L17 c1 使用 3.5mm²（25A）
- **AND** 壓接品質為 good 或 excellent
- **THEN** effectiveCurrent ≤ 23.6 × 1.02 = 24.1A，低於 25A
- **AND** 線材 MUST 不過熱
