## ADDED Requirements

### Requirement: L18 Old house beginner

#### Scenario: L18 老屋驚魂：初診

- **WHEN** 載入 L18
- **THEN** 關卡 MUST 為老屋模式（oldHouse 存在）
- **AND** 迴路配置 MUST 為 2 迴路：c1「客廳」110V/20A NFB、c2「臥室」110V/15A NFB
- **AND** 預算 MUST 為 $100，survivalTime MUST 為 10 秒
- **AND** requiresCrimp MUST 為 true
- **AND** bonusCondition MUST 為 `{ type: 'no-warning' }`
- **AND** c1 預接線 MUST 為 2.0mm² + crimpQuality='none' + [吹風機, 冰箱]
- **AND** c2 預接線 MUST 為 1.6mm² + crimpQuality='excellent' + [冰箱]
- **AND** 問題 MUST 為 c1: bare-wire
- **AND** 目標電器 MUST 為 [吹風機, 冰箱, 冰箱]

### Requirement: L19 Old house full repair

#### Scenario: L19 老屋驚魂：全面檢修

- **WHEN** 載入 L19
- **THEN** 關卡 MUST 為老屋模式
- **AND** 迴路配置 MUST 為 3 迴路：c1「廚房」110V/20A NFB、c2「客廳」110V/20A NFB、c3「儲藏室」110V/15A NFB
- **AND** 預算 MUST 為 $180，survivalTime MUST 為 12 秒
- **AND** requiresCrimp MUST 為 true
- **AND** bonusCondition MUST 為 `{ type: 'no-warning' }`
- **AND** c1 預接線 MUST 為 1.6mm² + crimpQuality='poor' + [快煮壺, 微波爐]
- **AND** c2 預接線 MUST 為 2.0mm² + crimpQuality='none' + [吹風機]
- **AND** c3 預接線 MUST 為 1.6mm² + crimpQuality='good' + []
- **AND** 問題 MUST 為 c1: wrong-wire-gauge、c2: bare-wire
- **AND** 目標電器 MUST 為 [快煮壺, 微波爐, 吹風機]

### Requirement: L20 Old house final exam

#### Scenario: L20 老屋驚魂：危機四伏

- **WHEN** 載入 L20
- **THEN** 關卡 MUST 為老屋模式
- **AND** 迴路配置 MUST 為 3 迴路：c1「廚房」110V/20A NFB 預設紅相(R)、c2「客廳」110V/20A NFB 預設紅相(R)、c3「浴室」220V/20A NFB wetArea
- **AND** 預算 MUST 為 $250，survivalTime MUST 為 15 秒
- **AND** requiresCrimp MUST 為 true
- **AND** phaseMode MUST 為 'manual'
- **AND** leakageMode MUST 為 'random'
- **AND** bonusCondition MUST 為 `{ type: 'no-warning' }`
- **AND** c1 預接線 MUST 為 2.0mm² + crimpQuality='none' + [快煮壺]（oxidized-splice 問題）
- **AND** c2 預接線 MUST 為 1.6mm² + crimpQuality='none' + [吹風機]
- **AND** c3 預接線 MUST 為 1.6mm² + crimpQuality='poor' + [浴室暖風機]（需裝 ELCB）
- **AND** 問題 MUST 為 c1: oxidized-splice、c2: bare-wire、c3: wrong-wire-gauge
- **AND** 目標電器 MUST 為 [快煮壺, 吹風機, 冰箱]
- **AND** c3 MUST 有 elcbAvailable + wetArea
