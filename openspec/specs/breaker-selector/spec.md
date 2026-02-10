## ADDED Requirements

### Requirement: BreakerSelector component

系統 MUST 提供 BreakerSelector 元件，讓玩家在老屋 overrated-breaker 迴路中更換 NFB 規格。

#### Scenario: 觸發顯示

- **WHEN** 老屋模式中有 overrated-breaker 問題的迴路且未送電
- **THEN** 點擊該迴路的 NFB 區域 MUST 開啟 BreakerSelector

#### Scenario: 非 overrated-breaker 迴路不可開啟

- **WHEN** 迴路不是 overrated-breaker 問題迴路
- **THEN** 點擊 NFB 區域 MUST NOT 開啟 BreakerSelector

#### Scenario: 送電中不可更換

- **WHEN** 模擬運行中
- **THEN** BreakerSelector MUST NOT 可開啟

### Requirement: BreakerSelector options display

BreakerSelector MUST 以卡片形式顯示三種 NFB 規格選項（15A / 20A / 30A）。

#### Scenario: 選項內容

- **WHEN** BreakerSelector 開啟
- **THEN** MUST 顯示三張卡片：15A、20A、30A
- **AND** 每張卡片 MUST 顯示額定電流（如 "15A"）
- **AND** 每張卡片 MUST 顯示跳脫閾值（如 "跳脫 18.75A"）

#### Scenario: 當前規格標示

- **WHEN** BreakerSelector 開啟
- **THEN** 當前安裝的 NFB 規格 MUST 標示「目前」
- **AND** 當前規格 MUST NOT 可選擇（disabled）

#### Scenario: 相容性標示

- **WHEN** BreakerSelector 開啟且迴路有線材
- **THEN** ratedCurrent ≤ 線材 maxCurrent 的選項 MUST 標示 ✓（相容）
- **AND** ratedCurrent > 線材 maxCurrent 的選項 MUST 標示 ⚠️（不相容）

### Requirement: BreakerSelector selection action

玩家選擇新 NFB 規格後，MUST 立即更換並觸發問題修復判定。

#### Scenario: 選擇新規格

- **WHEN** 玩家在 BreakerSelector 中選擇一個非當前的 NFB 規格
- **THEN** circuitBreakers[circuitId] MUST 更新為新規格
- **AND** BreakerSelector MUST 關閉
- **AND** MUST 觸發問題修復判定（isProblemResolved）

#### Scenario: NFB 更換免費

- **WHEN** 玩家更換 NFB 規格
- **THEN** MUST NOT 產生任何成本

### Requirement: BreakerSelector visual style

BreakerSelector MUST 與既有 WireSelector 風格一致，融入工業深色主題。

#### Scenario: 視覺風格

- **WHEN** BreakerSelector 顯示
- **THEN** 卡片 MUST 使用與 WireSelector 一致的工業深色主題樣式
- **AND** 相容選項 MUST 有綠色邊框/標示
- **AND** 不相容選項 MUST 有橘色/紅色邊框/標示
- **AND** 當前規格卡片 MUST 有灰色/disabled 樣式

### Requirement: circuitBreakers state

GameBoard MUST 維護 `circuitBreakers: Record<CircuitId, Breaker>` state。

#### Scenario: 初始化（非老屋）

- **WHEN** 載入非老屋關卡
- **THEN** circuitBreakers MUST 依各迴路 CircuitConfig.breaker 初始化

#### Scenario: 初始化（老屋）

- **WHEN** 載入老屋關卡
- **THEN** circuitBreakers MUST 依 preWiredCircuits 的 breaker 欄位初始化（若有）
- **AND** 未指定 breaker 的迴路 MUST 使用 CircuitConfig.breaker

#### Scenario: 更新

- **WHEN** 玩家透過 BreakerSelector 更換 NFB
- **THEN** circuitBreakers MUST 更新對應迴路的 Breaker
- **AND** simulation engine 使用 circuitBreakers（而非 CircuitConfig.breaker）進行跳脫判定
