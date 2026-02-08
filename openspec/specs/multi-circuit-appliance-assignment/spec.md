# multi-circuit-appliance-assignment Specification

## Purpose

定義多迴路場景下電器分配到特定迴路的互動行為、各迴路電器顯示，以及依 CircuitConfig 限制可用電器的篩選規則。

## Requirements

### Requirement: Appliance assignment to circuit

玩家 MUST 能將電器分配到特定迴路。

#### Scenario: 選擇目標迴路後加入電器

- **WHEN** 玩家選擇目標迴路為迴路 B 並點擊電器
- **THEN** 該電器 MUST 加入迴路 B 的電器清單
- **AND** 其他迴路的電器清單 MUST 不受影響

#### Scenario: 從迴路移除電器

- **WHEN** 玩家點擊迴路 B 已插入的電器
- **THEN** 該電器 MUST 從迴路 B 移除

#### Scenario: 單迴路時無需選擇迴路

- **WHEN** 只有一個迴路
- **THEN** 電器面板 MUST 自動分配到唯一的迴路
- **AND** 不顯示迴路選擇 UI

### Requirement: Circuit appliance display

每個迴路 MUST 顯示已分配的電器資訊。

#### Scenario: 電路圖顯示電器數量

- **WHEN** 迴路 A 有 3 個電器
- **THEN** 迴路 A 的插座區域 MUST 顯示電器數量或圖示

#### Scenario: 面板顯示各迴路電器

- **WHEN** 多迴路且各迴路有不同電器
- **THEN** AppliancePanel MUST 分組顯示各迴路的已分配電器

### Requirement: Available appliance filtering

AppliancePanel MUST 依 CircuitConfig.availableAppliances 限制可分配的電器。

#### Scenario: 迴路僅顯示可用電器

- **WHEN** 迴路 A 的 availableAppliances 包含 [冷氣, 電鍋]
- **AND** 迴路 B 的 availableAppliances 包含 [烘衣機, 電熱水器]
- **THEN** 選擇迴路 A 時 MUST 只能分配冷氣和電鍋
- **AND** 選擇迴路 B 時 MUST 只能分配烘衣機和電熱水器
