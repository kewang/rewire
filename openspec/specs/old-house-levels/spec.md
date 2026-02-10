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

### Requirement: L24 Old house protection failure

#### Scenario: L24 老屋驚魂：保護力缺失

- **WHEN** 載入 L24
- **THEN** 關卡 MUST 為老屋模式（oldHouse 存在）
- **AND** 迴路配置 MUST 為 3 迴路：c1「廚房」110V/20A NFB、c2「客廳」110V/20A NFB、c3「儲藏室」110V/15A NFB
- **AND** 預算 MUST 為 $120，survivalTime MUST 為 10 秒
- **AND** requiresCrimp MUST 為 true
- **AND** bonusCondition MUST 為 `{ type: 'no-warning' }`
- **AND** c1 預接線 MUST 為 2.0mm² + crimpQuality='good' + breaker=BREAKER_30A + [快煮壺]
- **AND** c2 預接線 MUST 為 2.0mm² + crimpQuality='none' + [吹風機]
- **AND** c3 預接線 MUST 為 1.6mm² + crimpQuality='excellent' + [冰箱]
- **AND** 問題 MUST 為 c1: overrated-breaker、c2: bare-wire
- **AND** 目標電器 MUST 為 [快煮壺, 冰箱, 吹風機, 冰箱]

#### Scenario: L24 修復策略

- **WHEN** 玩家修復 L24
- **THEN** c1 MUST 可透過更換 NFB 30A→20A 修復（免費，不需拆線）
- **AND** c2 MUST 透過拆線→重接 2.0mm²($50) + 壓接修復
- **AND** c3 正常不需修復
- **AND** 總成本 MUST ≤ $120

### Requirement: L25 Old house wet area trap

#### Scenario: L25 老屋驚魂：潮濕陷阱

- **WHEN** 載入 L25
- **THEN** 關卡 MUST 為老屋模式（oldHouse 存在）
- **AND** 迴路配置 MUST 為 3 迴路：c1「浴室」220V/20A NFB/wetArea/elcbAvailable、c2「客廳」110V/20A NFB、c3「儲藏室」110V/15A NFB
- **AND** 預算 MUST 為 $170，survivalTime MUST 為 12 秒
- **AND** requiresCrimp MUST 為 true
- **AND** leakageMode MUST 為 'random'
- **AND** bonusCondition MUST 為 `{ type: 'no-trip' }`
- **AND** c1 預接線 MUST 為 2.0mm² + crimpQuality='good' + [浴室暖風機]（缺 ELCB）
- **AND** c2 預接線 MUST 為 2.0mm² + crimpQuality='none' + [吹風機]（氧化接點）
- **AND** c3 預接線 MUST 為 1.6mm² + crimpQuality='excellent' + [冰箱]
- **AND** 問題 MUST 為 c1: missing-elcb、c2: oxidized-splice
- **AND** 目標電器 MUST 為 [浴室暖風機, 吹風機, 冰箱]

#### Scenario: L25 修復策略

- **WHEN** 玩家修復 L25
- **THEN** c1 MUST 可透過安裝 ELCB($35) 修復（不需拆線）
- **AND** c2 MUST 透過拆線→重接 2.0mm²($50) + 壓接修復
- **AND** c3 正常不需修復
- **AND** 總成本 $35+$50=$85 MUST ≤ $170
