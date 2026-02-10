## MODIFIED Requirements

### Requirement: Level definition

系統 MUST 提供二十三個關卡。L01-L05 單迴路，L06-L10 多迴路，L11-L12 相位平衡，L13-L15 ELCB，L16-L17 壓接端子，L18-L20 老屋驚魂，L21-L23 走線整理。

每個關卡 MUST 配置 `bonusCondition` 欄位，定義第三星獎勵目標：

| 關卡群 | bonusCondition | 說明 |
|--------|---------------|------|
| L01-L05 | `{ type: 'no-warning' }` | 全程零預警 |
| L06-L10 | `{ type: 'under-budget-ratio', ratio: 0.8 }` | 成本 ≤ 預算八折 |
| L11-L12 | `{ type: 'time-margin', margin: 3 }` | 剩餘 ≥ 3 秒 |
| L13-L15 | `{ type: 'no-trip' }` | 全程無跳脫 |
| L16-L17 | `{ type: 'crimp-quality', minQuality: 'good' }` | 壓接品質達標 |
| L18-L20 | `{ type: 'no-warning' }` | 修復後完美運行 |
| L21-L23 | `{ type: 'aesthetics-score', minScore: ... }` | 整線分數達標 |

#### Scenario: L05 長時間耐久（修復版）

- **WHEN** 載入 L05
- **THEN** 關卡 MUST 為 1 迴路配置（主迴路 110V / 30A NFB）
- **AND** 目標電器 MUST 為電暖器(1800W/110V) + 快煮壺(1500W/110V)
- **AND** 描述 MUST 反映正確的電器組合（非烘衣機）
- **AND** 預算 MUST 為 $130，survivalTime MUST 為 15 秒
- **AND** bonusCondition MUST 為 `{ type: 'no-warning' }`

#### Scenario: L16 壓接端子入門

- **WHEN** 載入 L16
- **THEN** 關卡 MUST 為 1 迴路配置（客廳 110V/20A NFB）
- **AND** 目標電器 MUST 為吹風機 + 冰箱
- **AND** 預算 MUST 為 $80，survivalTime MUST 為 8 秒
- **AND** requiresCrimp MUST 為 true
- **AND** bonusCondition MUST 為 `{ type: 'crimp-quality', minQuality: 'good' }`

#### Scenario: L17 端子品質大考驗

- **WHEN** 載入 L17
- **THEN** 關卡 MUST 為 2 迴路配置（廚房 110V/20A NFB + IH 爐 220V/20A NFB）
- **AND** 目標電器 MUST 為快煮壺 + 微波爐 + IH 爐
- **AND** 預算 MUST 為 $180，survivalTime MUST 為 12 秒
- **AND** requiresCrimp MUST 為 true
- **AND** bonusCondition MUST 為 `{ type: 'crimp-quality', minQuality: 'good' }`
