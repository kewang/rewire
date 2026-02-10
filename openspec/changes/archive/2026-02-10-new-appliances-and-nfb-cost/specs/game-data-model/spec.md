## ADDED Requirements

### Requirement: 電暖器電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含電暖器。

#### Scenario: 電暖器規格

- **WHEN** 查詢電暖器的定義
- **THEN** name MUST 為 '電暖器'，power MUST 為 1800，voltage MUST 為 110
- **AND** 計算電流 MUST 為 1800 ÷ 110 ≈ 16.4A

### Requirement: 烤箱電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含烤箱。

#### Scenario: 烤箱規格

- **WHEN** 查詢烤箱的定義
- **THEN** name MUST 為 '烤箱'，power MUST 為 1500，voltage MUST 為 110
- **AND** 計算電流 MUST 為 1500 ÷ 110 ≈ 13.6A

### Requirement: 除濕機電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含除濕機。

#### Scenario: 除濕機規格

- **WHEN** 查詢除濕機的定義
- **THEN** name MUST 為 '除濕機'，power MUST 為 600，voltage MUST 為 110
- **AND** 計算電流 MUST 為 600 ÷ 110 ≈ 5.5A

### Requirement: DEFAULT_APPLIANCES 陣列順序

系統 MUST 將 3 種新電器附加到 DEFAULT_APPLIANCES 陣列末尾，既有電器 index 不變。

#### Scenario: 新電器在陣列末尾

- **WHEN** 查詢 DEFAULT_APPLIANCES 陣列
- **THEN** 陣列長度 MUST 為 13
- **AND** index 0–9 MUST 與既有 10 種電器一致
- **AND** index 10 MUST 為電暖器，index 11 MUST 為烤箱，index 12 MUST 為除濕機
