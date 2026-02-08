## MODIFIED Requirements

### Requirement: Available appliance filtering

AppliancePanel MUST 依 CircuitConfig.availableAppliances 與迴路電壓限制可分配的電器。

#### Scenario: 迴路僅顯示可用電器

- **WHEN** 迴路 A 的 availableAppliances 包含 [冷氣, 電鍋]
- **AND** 迴路 B 的 availableAppliances 包含 [烘衣機, 電熱水器]
- **THEN** 選擇迴路 A 時 MUST 只能分配冷氣和電鍋
- **AND** 選擇迴路 B 時 MUST 只能分配烘衣機和電熱水器

#### Scenario: 電壓不相容電器顯示為 disabled

- **WHEN** 目標迴路為 110V
- **AND** availableAppliances 包含烘衣機（220V）
- **THEN** 烘衣機 MUST 顯示但為 disabled 狀態
- **AND** MUST 顯示電壓不相容提示（如「需要 220V 迴路」）

#### Scenario: 電壓相容電器正常顯示

- **WHEN** 目標迴路為 220V
- **AND** availableAppliances 包含烘衣機（220V）
- **THEN** 烘衣機 MUST 以正常可選狀態顯示
