## MODIFIED Requirements

### Requirement: CircuitConfig type definition

系統 MUST 定義 `CircuitConfig` 型別，描述關卡中每個迴路的硬體配置。

#### Scenario: CircuitConfig 包含必要屬性

- **WHEN** 建立一個 CircuitConfig 物件
- **THEN** 該物件 MUST 包含：
  - `id`（CircuitId）— 迴路唯一識別符
  - `label`（string）— 迴路顯示名稱（如「廚房迴路」）
  - `breaker`（Breaker）— 該迴路的 NFB 配置
  - `availableAppliances`（readonly Appliance[]）— 可分配到此迴路的電器清單

#### Scenario: CircuitConfig 包含相位屬性

- **WHEN** 建立一個 110V 迴路的 CircuitConfig
- **THEN** 該物件 MUST 可包含 `phase?: 'R' | 'T'` 可選欄位
- **AND** 220V 迴路可省略 phase（跨相不適用）

#### Scenario: CircuitConfig 包含 wetArea 屬性

- **WHEN** 建立一個潮濕區域迴路的 CircuitConfig
- **THEN** 該物件 MUST 可包含 `wetArea?: boolean` 可選欄位

#### Scenario: 所有屬性為 readonly

- **WHEN** 建立 CircuitConfig 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: SimulationStatus neutral-burned extension

SimulationStatus MUST 支援 `'neutral-burned'`、`'elcb-tripped'`、`'leakage'` 值。

#### Scenario: SimulationStatus 包含所有狀態

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 可為 `'normal'`、`'warning'`、`'tripped'`、`'burned'`、`'neutral-burned'`、`'elcb-tripped'`、`'leakage'` 之一

#### Scenario: neutral-burned 與 burned 與 leakage 同權重

- **WHEN** 比較嚴重度
- **THEN** `'neutral-burned'`、`'burned'`、`'leakage'` MUST 同級（severity=3）

#### Scenario: elcb-tripped 與 tripped 同權重

- **WHEN** 比較嚴重度
- **THEN** `'elcb-tripped'` MUST 與 `'tripped'` 同級（severity=2）

## ADDED Requirements

### Requirement: Level leakage configuration

Level 型別 MUST 支援漏電事件配置。

#### Scenario: Level 包含 leakageMode 可選欄位

- **WHEN** 定義 Level
- **THEN** MUST 可包含 `leakageMode?: 'scripted' | 'random'` 可選欄位
- **AND** 未指定時視為無漏電機制

#### Scenario: Level 包含 leakageEvents 可選欄位

- **WHEN** Level 的 leakageMode 為 `'scripted'`
- **THEN** MUST 可包含 `leakageEvents?: LeakageEvent[]`
- **AND** 每個 LeakageEvent MUST 包含 `time`（number，觸發時間秒數）和 `circuitId`（CircuitId，目標迴路）

### Requirement: LeakageEvent type definition

系統 MUST 定義 `LeakageEvent` 型別。

#### Scenario: LeakageEvent 包含必要屬性

- **WHEN** 建立一個 LeakageEvent 物件
- **THEN** 該物件 MUST 包含：
  - `time`（number）— 漏電觸發時間（秒）
  - `circuitId`（CircuitId）— 漏電發生的目標迴路 ID

### Requirement: CircuitState elcb-tripped status

CircuitState MUST 能表示 ELCB 跳脫狀態。

#### Scenario: elcb-tripped 迴路狀態

- **WHEN** CircuitState.status 為 `'elcb-tripped'`
- **THEN** 該迴路 MUST 被視為已跳脫，電流為 0，不可恢復
