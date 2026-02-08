## MODIFIED Requirements

### Requirement: Level definition

系統 MUST 提供十二個關卡。L01-L05 單迴路，L06-L10 多迴路，L11 相位平衡入門（自動分配），L12 相位平衡進階（手動分配）。

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

## ADDED Requirements

### Requirement: Neutral-burned failure handling

系統 MUST 在 neutral-burned 失敗時正確處理遊戲結束。

#### Scenario: neutral-burned 觸發遊戲結束

- **WHEN** overallStatus 變為 `'neutral-burned'`
- **THEN** 遊戲 MUST 停止送電
- **AND** ResultPanel MUST 顯示「中性線燒毀」失敗訊息
