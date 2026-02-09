## MODIFIED Requirements

### Requirement: Level definition

系統 MUST 提供十七個關卡。L01-L05 單迴路，L06-L10 多迴路，L11-L12 相位平衡，L13-L15 ELCB，L16-L17 壓接端子。

每個關卡 MUST 配置 `bonusCondition` 欄位，定義第三星獎勵目標：

| 關卡群 | bonusCondition | 說明 |
|--------|---------------|------|
| L01-L05 | `{ type: 'no-warning' }` | 全程零預警 |
| L06-L10 | `{ type: 'under-budget-ratio', ratio: 0.8 }` | 成本 ≤ 預算八折 |
| L11-L12 | `{ type: 'time-margin', margin: 3 }` | 剩餘 ≥ 3 秒 |
| L13-L15 | `{ type: 'no-trip' }` | 全程無跳脫 |
| L16-L17 | `{ type: 'crimp-quality', minQuality: 'good' }` | 壓接品質達標 |

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

#### Scenario: L01-L15 不受壓接影響

- **WHEN** 載入 L01 至 L15 任一關卡
- **THEN** requiresCrimp MUST 為 undefined 或 false
- **AND** 遊戲行為 MUST 與 v0.4 完全一致
- **AND** 每關 MUST 有對應的 bonusCondition 配置

### Requirement: Power-on prerequisite with crimp

requiresCrimp 關卡的送電前置條件 MUST 包含所有迴路壓接完成。

#### Scenario: 壓接未完成不可送電

- **WHEN** requiresCrimp 關卡中有迴路尚未完成壓接
- **THEN** NFB 開關 MUST 為 disabled
- **AND** MUST 顯示提示「請先完成所有迴路壓接」

#### Scenario: 壓接完成可送電

- **WHEN** requiresCrimp 關卡中所有迴路已完成接線 + 壓接
- **AND** 已分配電器
- **THEN** NFB 開關 MUST 為 enabled
