## MODIFIED Requirements

### Requirement: L06 自由配迴路入門

LEVELS[5] SHALL 為 FreeCircuitLevel，定義如下：
- name: 'L06 自由配迴路入門'
- description: '第一次體驗自由配迴路！兩個房間、三台電器，你來決定怎麼分。'
- rooms: 客廳 [吹風機]、廚房 [快煮壺, 冰箱]
- panel: 4 slots / **35A** mainBreaker
- budget: $100, survivalTime: 8s
- bonusCondition: { type: 'under-budget-ratio', ratio: 0.85 }

#### Scenario: L06 格式正確
- **WHEN** 讀取 LEVELS[5]
- **THEN** 'rooms' in level === true，且包含 2 個 room（客廳、廚房），panel.maxSlots=4, panel.mainBreakerRating=35

### Requirement: L07 高功率初體驗

LEVELS[6] SHALL 為 FreeCircuitLevel，定義如下：
- name: 'L07 高功率初體驗'
- description: '電暖器 16.4A — 第一次遇到 1.6mm² 不夠用的電器！'
- rooms: 客廳 [電暖器, 冰箱]
- panel: 3 slots / **30A** mainBreaker
- budget: $85, survivalTime: 10s
- bonusCondition: { type: 'no-warning' }

#### Scenario: L07 電暖器強制粗線
- **WHEN** 讀取 LEVELS[6]
- **THEN** rooms[0].appliances 包含電暖器(1800W/110V)，需要 2.0mm²+ 線材

### Requirement: L08 廚房分迴路

LEVELS[7] SHALL 為 FreeCircuitLevel，定義如下：
- name: 'L08 廚房分迴路'
- description: '快煮壺、微波爐、電暖器 — 三台高功率電器，怎麼分才划算？'
- rooms: 廚房 [快煮壺, 微波爐]、客廳 [電暖器]
- panel: 4 slots / **40A** mainBreaker
- budget: $150, survivalTime: 10s
- bonusCondition: { type: 'no-warning' }

#### Scenario: L08 合併 vs 拆開取捨
- **WHEN** 讀取 LEVELS[7]
- **THEN** 廚房 room 有 2 台 110V 電器，客廳 room 有電暖器

### Requirement: L09 混合電壓

LEVELS[8] SHALL 為 FreeCircuitLevel，定義如下：
- name: 'L09 混合電壓'
- description: '廚房 110V + 洗衣間 220V。不同電壓需要不同迴路！'
- rooms: 廚房 [快煮壺, 烤箱]、洗衣間 [烘衣機(220V)]
- panel: 4 slots / **40A** mainBreaker
- budget: $140, survivalTime: 10s
- bonusCondition: { type: 'under-budget-ratio', ratio: 0.9 }

#### Scenario: L09 混合電壓房間
- **WHEN** 讀取 LEVELS[8]
- **THEN** 包含 110V 電器房間和 220V 電器房間

### Requirement: L10 全屋配電

LEVELS[9] SHALL 為 FreeCircuitLevel，定義如下：
- name: 'L10 全屋配電'
- description: '五個房間、七台電器 — 第一次全屋配電設計！'
- rooms: 廚房 [快煮壺, 微波爐]、客廳 [電暖器, 吹風機]、臥室 [除濕機]、洗衣間 [烘衣機(220V)]、儲藏室 [冰箱]
- panel: 6 slots / **60A** mainBreaker
- budget: **$280**, survivalTime: 15s
- bonusCondition: { type: 'under-budget-ratio', ratio: **0.9** }

#### Scenario: L10 五房間完整
- **WHEN** 讀取 LEVELS[9]
- **THEN** rooms.length === 5，各房間電器電壓正確

#### Scenario: L10 bonus 可行性
- **WHEN** 玩家以最優策略配線（5 迴路，最低成本 ~$240）
- **THEN** $240 ≤ $280 × 0.9 = $252，bonus MUST 可達成

### Requirement: L11 相位平衡入門（自由配）

LEVELS[10] SHALL 為 FreeCircuitLevel + phaseMode: 'auto'，定義如下：
- name: 'L11 相位平衡入門'
- description: '單相三線制登場！R 相和 T 相要均衡分配，否則中性線過載燒毀。'
- rooms: 廚房 [快煮壺, 冰箱]、客廳 [吹風機, 除濕機]、冷氣間 [冷氣(220V)]
- panel: 5 slots / **50A** mainBreaker
- budget: $200, survivalTime: 12s
- phaseMode: 'auto'
- bonusCondition: { type: 'time-margin', margin: 3 }

#### Scenario: L11 auto phaseMode
- **WHEN** 讀取 LEVELS[10]
- **THEN** phaseMode === 'auto'，rooms 包含 110V 和 220V 電器

### Requirement: L13 ELCB 入門（自由配）

LEVELS[12] SHALL 為 FreeCircuitLevel + leakageMode: 'scripted'，定義如下：
- name: 'L13 ELCB 入門'
- description: '浴室潮濕區必須安裝 ELCB。不裝 = 觸電！'
- rooms: 浴室 [浴室暖風機(220V)] (wetArea)、臥室 [吹風機]
- panel: 4 slots / **30A** mainBreaker
- budget: $150, survivalTime: 10s
- leakageMode: 'scripted'
- leakageEvents: [{ time: 5, circuitId: 'wetArea' }]
- bonusCondition: { type: **'time-margin', margin: 3** }

#### Scenario: L13 scripted leakage with wetArea
- **WHEN** 讀取 LEVELS[12]
- **THEN** leakageMode === 'scripted'，leakageEvents[0].circuitId === 'wetArea'，浴室 room.wetArea === true

#### Scenario: L13 bonus 考慮 ELCB 跳脫
- **WHEN** t=5s 發生漏電，ELCB 跳脫（浴室迴路斷電）
- **THEN** 玩家仍可通關（其餘迴路正常），bonus 為 time-margin 不受 ELCB 跳脫影響

### Requirement: L14 ELCB 預算壓力（自由配）

LEVELS[13] SHALL 為 FreeCircuitLevel + leakageMode: 'random'，定義如下：
- name: 'L14 ELCB 預算壓力'
- description: '浴室 ELCB 必裝，加上廚房高功率電器，預算很緊。'
- rooms: 浴室 [浴室暖風機(220V)] (wetArea)、廚房 [快煮壺, 微波爐]、儲藏室 [冰箱]
- panel: 5 slots / **35A** mainBreaker
- budget: $185, survivalTime: 12s
- leakageMode: 'random'
- bonusCondition: { type: **'under-budget-ratio', ratio: 0.9** }

#### Scenario: L14 random leakage
- **WHEN** 讀取 LEVELS[13]
- **THEN** leakageMode === 'random'，無 leakageEvents，浴室 wetArea

#### Scenario: L14 bonus 可行性
- **WHEN** 玩家以最優策略配線（3 迴路，最低成本 ~$155）
- **THEN** $155 ≤ $185 × 0.9 = $166.5，bonus MUST 可達成

### Requirement: L15 綜合挑戰（自由配）

LEVELS[14] SHALL 為 FreeCircuitLevel + phaseMode + leakageMode，定義如下：
- name: 'L15 綜合挑戰'
- description: '相位平衡 + ELCB + 多房間。所有 v0.4 機制的自由配迴路版！'
- rooms: 廚房 [快煮壺, 微波爐]、客廳 [電暖器]、浴室 [浴室暖風機(220V)] (wetArea)、冷氣間 [冷氣(220V)]
- panel: 6 slots / **60A** mainBreaker
- budget: $300, survivalTime: 20s
- phaseMode: 'manual', leakageMode: 'random'
- bonusCondition: { type: **'time-margin', margin: 5** }

#### Scenario: L15 所有 v0.4 機制組合
- **WHEN** 讀取 LEVELS[14]
- **THEN** phaseMode === 'manual'，leakageMode === 'random'，浴室 wetArea

#### Scenario: L15 bonus 時間餘裕
- **WHEN** 玩家正確配線並存活 20 秒
- **THEN** 剩餘時間 ≥ 5 秒即達成 bonus（需提前完成所有操作在 15s 內）

### Requirement: L16 壓接端子入門（自由配）

LEVELS[15] SHALL 為 FreeCircuitLevel + requiresCrimp: true，定義如下：
- name: 'L16 壓接端子入門'
- description: '接好線後要壓接才能送電。低壓力環境學習壓接。'
- rooms: 客廳 [吹風機, 冰箱]
- panel: 3 slots / **20A** mainBreaker
- budget: $80, survivalTime: 8s
- requiresCrimp: true
- bonusCondition: { type: 'crimp-quality', minQuality: 'good' }

#### Scenario: L16 壓接旗標
- **WHEN** 讀取 LEVELS[15]
- **THEN** requiresCrimp === true，rooms 僅 1 個低功率房間

### Requirement: L17 端子品質大考驗（自由配）

LEVELS[16] SHALL 為 FreeCircuitLevel + requiresCrimp: true，定義如下：
- name: 'L17 端子品質大考驗'
- description: '壓接品質差 = 接觸電阻高 = 線材加速過熱！廚房高功率迴路要壓好。'
- rooms: 廚房 [快煮壺, 微波爐]、冷氣間 [IH 爐(220V)]
- panel: 4 slots / **40A** mainBreaker
- budget: **$150**, survivalTime: 12s
- requiresCrimp: true
- bonusCondition: { type: 'crimp-quality', minQuality: 'good' }

#### Scenario: L17 高功率壓接
- **WHEN** 讀取 LEVELS[16]
- **THEN** requiresCrimp === true，廚房 110V 高功率 + IH 爐 220V

#### Scenario: L17 預算壓力
- **WHEN** 玩家以最優策略配線（3 迴路，最低成本 ~$120）
- **THEN** budget $150 留 20% headroom，需注意線材選擇

### Requirement: L21 整線入門（自由配）

LEVELS[20] SHALL 為 FreeCircuitLevel + requiresRouting + requiresCrimp + phaseMode: 'auto'，定義如下：
- name: 'L21 整線入門'
- description: '設計迴路後進入配電箱整理走線。學習車道排列和束帶。'
- rooms: 客廳 [吹風機]、儲藏室 [冰箱]、廚房 [廚下加熱器]
- panel: 4 slots / **30A** mainBreaker
- budget: $150, survivalTime: 10s
- phaseMode: 'auto', requiresCrimp: true, requiresRouting: true
- bonusCondition: { type: 'aesthetics-score', minScore: 90 }

#### Scenario: L21 走線旗標
- **WHEN** 讀取 LEVELS[20]
- **THEN** requiresRouting === true，requiresCrimp === true，phaseMode === 'auto'

### Requirement: L22 交叉迷宮（自由配）

LEVELS[21] SHALL 為 FreeCircuitLevel + requiresRouting + requiresCrimp + phaseMode: 'manual'，定義如下：
- name: 'L22 交叉迷宮'
- description: '5 個房間 + 混合電壓 + 手動相位。迴路規劃直接影響走線難度！'
- rooms: 廚房 [快煮壺, 微波爐]、客廳 [電暖器]、陽台 [烘衣機(220V)]、儲藏室 [冰箱]、臥室 [除濕機]
- panel: 6 slots / **60A** mainBreaker
- budget: **$250**, survivalTime: 12s
- phaseMode: 'manual', requiresCrimp: true, requiresRouting: true
- bonusCondition: { type: 'aesthetics-score', minScore: 80 }

#### Scenario: L22 五房間走線
- **WHEN** 讀取 LEVELS[21]
- **THEN** rooms.length === 5，requiresRouting === true，phaseMode === 'manual'

### Requirement: L23 完美配電箱（自由配）

LEVELS[22] SHALL 為 FreeCircuitLevel，全機制綜合，定義如下：
- name: 'L23 完美配電箱'
- description: 'v0.7 畢業考！全機制綜合 — 自由配迴路 + 相位 + ELCB + 壓接 + 走線。'
- rooms: 廚房 [快煮壺, 微波爐]、客廳 [電暖器, 吹風機]、浴室 [浴室暖風機(220V)] (wetArea)、冷氣間 [冷氣(220V)]、儲藏室 [冰箱]
- panel: 8 slots / **65A** mainBreaker
- budget: **$350**, survivalTime: 15s
- phaseMode: 'manual', leakageMode: 'random', requiresCrimp: true, requiresRouting: true
- bonusCondition: { type: 'aesthetics-score', minScore: 70 }

#### Scenario: L23 全機制綜合
- **WHEN** 讀取 LEVELS[22]
- **THEN** phaseMode === 'manual'，leakageMode === 'random'，requiresCrimp === true，requiresRouting === true，浴室 wetArea
