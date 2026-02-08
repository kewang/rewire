## ADDED Requirements

### Requirement: New 220V appliance compatibility

新增的 220V 電器（IH 爐、冷氣、浴室暖風機）MUST 遵循既有電壓相容性規則。

#### Scenario: IH 爐分配到 220V 迴路

- **WHEN** 玩家將 IH 爐（3000W/220V）分配到 220V 迴路
- **THEN** 分配 MUST 成功
- **AND** 電流計算 MUST 為 3000 / 220 ≈ 13.6A

#### Scenario: 冷氣分配到 220V 迴路

- **WHEN** 玩家將冷氣（2800W/220V）分配到 220V 迴路
- **THEN** 分配 MUST 成功
- **AND** 電流計算 MUST 為 2800 / 220 ≈ 12.7A

#### Scenario: 浴室暖風機分配到 220V 迴路

- **WHEN** 玩家將浴室暖風機（1650W/220V）分配到 220V 迴路
- **THEN** 分配 MUST 成功
- **AND** 電流計算 MUST 為 1650 / 220 = 7.5A

#### Scenario: 新 220V 電器在 110V 迴路顯示 disabled

- **WHEN** 目標迴路為 110V
- **THEN** IH 爐、冷氣、浴室暖風機 MUST 顯示為 disabled 狀態

### Requirement: New 110V appliance compatibility

新增的 110V 電器（冰箱）MUST 遵循既有電壓相容性規則。

#### Scenario: 冰箱分配到 110V 迴路

- **WHEN** 玩家將冰箱（200W/110V）分配到 110V 迴路
- **THEN** 分配 MUST 成功
- **AND** 電流計算 MUST 為 200 / 110 ≈ 1.8A

#### Scenario: 冰箱在 220V 迴路顯示 disabled

- **WHEN** 目標迴路為 220V
- **THEN** 冰箱 MUST 顯示為 disabled 狀態
