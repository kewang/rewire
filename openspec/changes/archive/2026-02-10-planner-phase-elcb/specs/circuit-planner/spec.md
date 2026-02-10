## MODIFIED Requirements

### Requirement: CircuitCard displays circuit details

系統 MUST 提供 `CircuitCard` 元件，顯示單條迴路的詳細資訊。

#### Scenario: CircuitCard 顯示基本資訊

- **WHEN** CircuitCard 渲染
- **THEN** MUST 顯示迴路編號、電壓、NFB 規格
- **AND** MUST 顯示已指派電器列表
- **AND** MUST 顯示預估電流 vs 線材安全容量（若已選線材）

#### Scenario: CircuitCard 的電流安全指示

- **WHEN** 迴路預估電流 < 線材安全容量的 80%
- **THEN** 電流指示 MUST 為綠色

- **WHEN** 迴路預估電流 >= 線材安全容量的 80% 且 < 100%
- **THEN** 電流指示 MUST 為黃色

- **WHEN** 迴路預估電流 >= 線材安全容量
- **THEN** 電流指示 MUST 為紅色

#### Scenario: CircuitCard 顯示相位選擇器（條件顯示）

- **WHEN** 關卡有 phaseMode 且迴路電壓為 110V
- **THEN** CircuitCard MUST 在電壓控制項後方顯示相位選擇器（R/T toggle）

#### Scenario: CircuitCard 顯示 ELCB toggle（條件顯示）

- **WHEN** 迴路包含 wetArea 房間的電器
- **THEN** CircuitCard MUST 在控制項區域顯示 ELCB 開關（checkbox + 成本 $35）

#### Scenario: CircuitCard footer 顯示含 ELCB 的迴路成本

- **WHEN** CircuitCard 渲染且 elcbEnabled 為 true
- **THEN** footer 成本 MUST = wire cost + NFB cost + ELCB_COST

## ADDED Requirements

### Requirement: PlannerCircuit includes phase and elcbEnabled

PlannerCircuit MUST 支援 `phase` 和 `elcbEnabled` 可選欄位。

#### Scenario: PlannerCircuit phase 欄位

- **WHEN** 建立一個有 phaseMode 關卡中的 110V PlannerCircuit
- **THEN** 該物件 MUST 包含 `phase?: 'R' | 'T'` 欄位

#### Scenario: PlannerCircuit elcbEnabled 欄位

- **WHEN** 建立一個 PlannerCircuit
- **THEN** 該物件 MUST 包含 `elcbEnabled?: boolean` 欄位（預設 false）
