## ADDED Requirements

### Requirement: L13 ELCB introduction level

L13 MUST 為 ELCB 入門關卡，讓玩家認識漏電保護機制。

#### Scenario: L13 關卡配置

- **WHEN** 玩家選擇 L13
- **THEN** 關卡 MUST 包含：
  - 名稱「ELCB 入門」
  - 預算 $200、存活時間 10 秒
  - 漏電模式：腳本式（浴室迴路在第 5 秒觸發漏電）
  - c1「浴室」220V / 30A NFB / wetArea — 可用：浴室暖風機、電熱水器
  - c2「臥室」110V / 20A NFB — 可用：吹風機
  - requiredAppliances：[吹風機]

#### Scenario: L13 浴室 ELCB 必裝

- **WHEN** 玩家未在 c1（浴室）安裝 ELCB
- **THEN** 送電按鈕 MUST 為 disabled

#### Scenario: L13 漏電觸發後過關

- **WHEN** 第 5 秒浴室漏電觸發
- **AND** c1 已安裝 ELCB
- **THEN** c1 ELCB 跳脫，浴室斷電
- **AND** c2（臥室）繼續運作，撐滿 10 秒即過關

### Requirement: L14 ELCB budget pressure level

L14 MUST 為 ELCB 預算壓力關卡，考驗預算分配策略。

#### Scenario: L14 關卡配置

- **WHEN** 玩家選擇 L14
- **THEN** 關卡 MUST 包含：
  - 名稱「ELCB 預算壓力」
  - 預算 $185、存活時間 12 秒
  - 漏電模式：隨機式（wetArea 迴路 5%/秒）
  - c1「浴室」220V / 20A NFB / wetArea — 可用：浴室暖風機
  - c2「廚房」110V / 20A NFB — 可用：快煮壺、微波爐、冰箱
  - c3「儲藏室」110V / 15A NFB — 可用：冰箱
  - requiredAppliances：[快煮壺, 微波爐, 冰箱]

#### Scenario: L14 預算策略

- **WHEN** 玩家使用正確策略
- **THEN** c1 ELCB($35) + 1.6mm²($30) + c2 3.5mm²($80) + c3 1.6mm²($30) = $175 ≤ $185

### Requirement: L15 comprehensive challenge level

L15 MUST 為 v0.4 綜合挑戰關卡，同時考驗相位平衡、ELCB、多迴路策略。

#### Scenario: L15 關卡配置

- **WHEN** 玩家選擇 L15
- **THEN** 關卡 MUST 包含：
  - 名稱「綜合挑戰」
  - 預算 $300、存活時間 20 秒
  - 相位模式：手動分配
  - 漏電模式：隨機式（wetArea 迴路 5%/秒）
  - c1「廚房A」110V / 20A NFB / 預設紅相(R) — 可用：快煮壺、微波爐、冰箱
  - c2「廚房B」110V / 20A NFB / 預設紅相(R) — 可用：微波爐、吹風機、冰箱
  - c3「浴室」220V / 20A NFB / wetArea — 可用：浴室暖風機
  - c4「IH 爐」220V / 30A NFB — 可用：IH 爐
  - requiredAppliances：[快煮壺, 微波爐, 吹風機, IH 爐, 冰箱]

#### Scenario: L15 需要手動切相

- **WHEN** 玩家不切換相位（全部保持紅相）
- **THEN** 中性線電流 MUST 超過 30A → neutral-burned

#### Scenario: L15 浴室 ELCB 必裝

- **WHEN** 玩家未在 c3（浴室）安裝 ELCB
- **THEN** 送電按鈕 MUST 為 disabled
