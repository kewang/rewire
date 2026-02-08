# voltage-circuit Specification

## Purpose

定義迴路的電壓屬性（110V/220V）、電壓相容性驗證規則，以及 1P/2P NFB 極數區分。

## Requirements

### Requirement: Circuit voltage property

每個迴路 MUST 具有 `voltage` 屬性（110 或 220），定義該迴路的電壓等級。

#### Scenario: CircuitConfig 包含 voltage 欄位

- **WHEN** 定義 CircuitConfig
- **THEN** MUST 包含 `voltage: 110 | 220` 必填欄位
- **AND** Circuit interface MUST 從 CircuitConfig 繼承 voltage 欄位

#### Scenario: 單迴路預設 110V

- **WHEN** 使用 `createSingleCircuitLevel` 建立單迴路關卡
- **THEN** 產生的 CircuitConfig.voltage MUST 為 110

### Requirement: Voltage compatibility enforcement

系統 MUST 確保電器只能被分配到電壓相符的迴路。

#### Scenario: 110V 電器分配到 110V 迴路

- **WHEN** 玩家將吹風機（110V）分配到 110V 迴路
- **THEN** 分配 MUST 成功

#### Scenario: 220V 電器分配到 220V 迴路

- **WHEN** 玩家將烘衣機（220V）分配到 220V 迴路
- **THEN** 分配 MUST 成功

#### Scenario: 電壓不匹配時 UI 阻擋

- **WHEN** 目標迴路為 110V
- **THEN** AppliancePanel MUST 不允許選擇 220V 電器
- **AND** 220V 電器 MUST 顯示為 disabled 狀態

#### Scenario: 引擎防禦性檢查

- **WHEN** simulation step() 執行時發現電器 voltage 與迴路 voltage 不匹配
- **THEN** 該電器 MUST 被忽略（不計入 totalCurrent 計算）

### Requirement: NFB pole type distinction

220V 迴路 MUST 使用 2P NFB，110V 迴路 MUST 使用 1P NFB。

#### Scenario: 110V 迴路 NFB 類型

- **WHEN** 迴路 voltage 為 110
- **THEN** NFB MUST 為 1P（單極）型式

#### Scenario: 220V 迴路 NFB 類型

- **WHEN** 迴路 voltage 為 220
- **THEN** NFB MUST 為 2P（雙極）型式

#### Scenario: NFB 跳脫行為不受極數影響

- **WHEN** 2P NFB 觸發跳脫
- **THEN** 跳脫閾值計算邏輯 MUST 與 1P 相同（ratedCurrent × 1.25）
