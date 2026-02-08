## ADDED Requirements

### Requirement: Neutral current calculation

系統 MUST 在每次 stepMulti 步進時計算中性線電流：`I_N = |Σ I_R − Σ I_T|`。

#### Scenario: 平衡負載中性線電流低

- **WHEN** 紅相迴路總電流 13.6A，黑相迴路總電流 10.9A
- **THEN** 中性線電流 MUST 為 |13.6 − 10.9| = 2.7A

#### Scenario: 不平衡負載中性線電流高

- **WHEN** 紅相迴路總電流 36.3A，黑相迴路總電流 0A
- **THEN** 中性線電流 MUST 為 36.3A

#### Scenario: 220V 迴路不影響中性線

- **WHEN** 220V 迴路有 12.7A 負載
- **THEN** 該電流 MUST 不計入紅相或黑相總電流

#### Scenario: 無相位資訊時中性線電流為零

- **WHEN** 關卡未定義任何迴路的 phase 屬性
- **THEN** 中性線電流 MUST 恆為 0

### Requirement: Neutral wire heat model

中性線 MUST 使用與一般線材相同的熱度模型（heatRate=0.4, coolRate=0.15），安全容量為 30A。

#### Scenario: 中性線過載時熱度上升

- **WHEN** 中性線電流超過 30A
- **THEN** neutralHeat MUST 隨時間增加

#### Scenario: 中性線正常時熱度下降

- **WHEN** 中性線電流未超過 30A 且 neutralHeat > 0
- **THEN** neutralHeat MUST 隨時間減少

#### Scenario: 中性線燒毀

- **WHEN** neutralHeat 達到 1.0
- **THEN** overallStatus MUST 變為 `'neutral-burned'`

### Requirement: Neutral burned failure type

系統 MUST 支援 `'neutral-burned'` 作為新的失敗類型。

#### Scenario: neutral-burned 為終態

- **WHEN** overallStatus 為 `'neutral-burned'`
- **THEN** 後續 stepMulti 呼叫 MUST 維持該狀態不變

#### Scenario: neutral-burned 顯示失敗原因

- **WHEN** 遊戲因 neutral-burned 結束
- **THEN** ResultPanel MUST 顯示中性線燒毀的失敗訊息

### Requirement: Phase assignment mode

關卡 MUST 可透過 `phaseMode` 定義相位分配模式。

#### Scenario: 自動分配模式

- **WHEN** Level 的 `phaseMode` 為 `'auto'` 或未定義
- **THEN** 玩家 MUST 不能切換迴路相位
- **AND** 相位由 CircuitConfig.phase 固定

#### Scenario: 手動分配模式

- **WHEN** Level 的 `phaseMode` 為 `'manual'`
- **THEN** 110V 迴路 MUST 顯示 R/T 切換按鈕
- **AND** 玩家可在未送電時切換相位

#### Scenario: 220V 迴路無相位切換

- **WHEN** 迴路 voltage 為 220
- **THEN** MUST 不顯示相位切換按鈕（220V 為跨相 R-T）

### Requirement: Phase balance indicator UI

系統 MUST 在有相位資訊的關卡顯示相位平衡指示器。

#### Scenario: 顯示三相電流

- **WHEN** 關卡有迴路定義了 phase 屬性
- **THEN** StatusDisplay MUST 顯示紅相(R)總電流、黑相(T)總電流、中性線(N)電流

#### Scenario: 中性線狀態顏色

- **WHEN** 中性線電流未超過 30A
- **THEN** 中性線數值 MUST 顯示正常色

- **WHEN** 中性線電流超過 30A 且 neutralHeat < 1.0
- **THEN** 中性線數值 MUST 顯示警告色

- **WHEN** neutralHeat 達到 1.0
- **THEN** 中性線數值 MUST 顯示燒毀色

#### Scenario: 無相位關卡不顯示

- **WHEN** 關卡未定義任何迴路的 phase 屬性
- **THEN** 相位平衡指示器 MUST 不顯示

### Requirement: Neutral max current constant

系統 MUST 定義中性線安全容量常數 `NEUTRAL_MAX_CURRENT = 30`。

#### Scenario: 中性線容量值

- **WHEN** 讀取中性線容量常數
- **THEN** 值 MUST 為 30
