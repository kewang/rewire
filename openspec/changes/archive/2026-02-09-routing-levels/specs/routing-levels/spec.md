## ADDED Requirements

### Requirement: L21 整線入門
L21 SHALL 為 3 迴路整線入門關卡，首次啟用 requiresRouting。

#### Scenario: L21 circuit configuration
- **WHEN** 玩家選擇 L21
- **THEN** 關卡包含 3 個迴路：c1「客廳」110V/20A/R 相（吹風機）、c2「廚房」110V/20A/T 相（廚下加熱器）、c3「儲藏室」110V/15A/R 相（冰箱）
- **AND** requiresCrimp = true, requiresRouting = true
- **AND** phaseMode = auto
- **AND** budget = $150, survivalTime = 10
- **AND** bonusCondition = { type: 'aesthetics-score', minScore: 90 }

#### Scenario: L21 default lane order produces crossing
- **WHEN** 預設車道排列 [c1, c2, c3]
- **THEN** 至少存在 1 個交叉（c2-T 從右側出發在中間車道、c3-R 從左側出發在右車道）
- **AND** 重新排列為 [c1, c3, c2] 可消除所有交叉

### Requirement: L22 交叉迷宮
L22 SHALL 為 5 迴路混合電壓整線進階關卡。

#### Scenario: L22 circuit configuration
- **WHEN** 玩家選擇 L22
- **THEN** 關卡包含 5 個迴路：c1「廚房」110V/20A/R 相（快煮壺、微波爐）、c2「客廳」110V/20A/T 相（吹風機）、c3「儲藏室」110V/15A/R 相（冰箱）、c4「陽台」220V/20A（烘衣機）、c5「備用」110V/15A/T 相（冰箱）
- **AND** requiresCrimp = true, requiresRouting = true
- **AND** phaseMode = manual
- **AND** budget = $300, survivalTime = 12
- **AND** bonusCondition = { type: 'aesthetics-score', minScore: 80 }

#### Scenario: L22 phase affects routing
- **WHEN** 玩家切換迴路相位
- **THEN** 走線起點側改變，影響交叉數量
- **AND** 玩家需同時考慮相位平衡與整線效率

### Requirement: L23 完美配電箱
L23 SHALL 為 6 迴路全機制綜合 v0.6 畢業考。

#### Scenario: L23 circuit configuration
- **WHEN** 玩家選擇 L23
- **THEN** 關卡包含 6 個迴路：c1「廚房」110V/20A/R 相（快煮壺、微波爐）、c2「客廳」110V/20A/R 相（吹風機）、c3「儲藏室」110V/15A/T 相（冰箱）、c4「客廳冷氣」220V/20A（冷氣）、c5「浴室」220V/20A/wetArea/ELCB（浴室暖風機）、c6「備用」110V/15A/T 相（冰箱）
- **AND** requiresCrimp = true, requiresRouting = true
- **AND** phaseMode = manual, leakageMode = random
- **AND** budget = $400, survivalTime = 15
- **AND** bonusCondition = { type: 'aesthetics-score', minScore: 70 }

#### Scenario: L23 requires ELCB on wet area
- **WHEN** c5 為 wetArea
- **THEN** 玩家必須安裝 ELCB 才能送電

#### Scenario: L23 phase balance needed
- **WHEN** c1 和 c2 預設皆為 R 相
- **THEN** 玩家需將 c2 切換為 T 相以平衡負載

### Requirement: L21-L23 共通特徵
所有整線關卡 SHALL 具備 requiresCrimp 和 requiresRouting 為 true。

#### Scenario: Routing gate enabled
- **WHEN** 任一 L21-L23 關卡
- **THEN** 玩家必須完成壓接和整線才能送電

#### Scenario: L01-L20 unaffected
- **WHEN** 玩家選擇 L01-L20 任一關卡
- **THEN** 不出現整線按鈕，遊戲流程與 v0.5 完全相同
