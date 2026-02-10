## ADDED Requirements

### Requirement: Overrated breaker problem type

系統 MUST 支援 `overrated-breaker` 老屋問題類型，表示迴路的 NFB 額定電流大於線材安全電流（`breaker.ratedCurrent > wire.maxCurrent`），導致 NFB 無法在線材過載時跳脫保護。

#### Scenario: 問題效果

- **WHEN** 老屋迴路有 overrated-breaker 問題且未修復
- **THEN** 該迴路的 NFB 規格 MUST 為過大（ratedCurrent > 線材 maxCurrent）
- **AND** 送電後若電流超過線材容量但低於 NFB 跳脫閾值，線材 MUST 直接燒毀（NFB 不跳脫）

#### Scenario: 修復方式

- **WHEN** 玩家透過 BreakerSelector 將 NFB 更換為正確規格（ratedCurrent ≤ 線材 maxCurrent）
- **THEN** overrated-breaker 問題 MUST 標記為已修復
- **AND** 不需要拆線或重新壓接

#### Scenario: 更換後仍不正確

- **WHEN** 玩家更換 NFB 但新規格仍過大（ratedCurrent > 線材 maxCurrent）
- **THEN** overrated-breaker 問題 MUST 保持未修復狀態

### Requirement: Missing ELCB problem type

系統 MUST 支援 `missing-elcb` 老屋問題類型，表示潮濕區域（wetArea）迴路未安裝漏電斷路器（ELCB），漏電時無法保護使用者。

#### Scenario: 問題效果

- **WHEN** 老屋迴路有 missing-elcb 問題且未修復
- **THEN** 該迴路的 ELCB MUST 為未安裝狀態（circuitElcb[id] === false）
- **AND** 送電後若發生漏電事件，MUST 觸發 leakage（severity=3，即時失敗）

#### Scenario: 修復方式

- **WHEN** 玩家透過 ELCB toggle 安裝 ELCB（circuitElcb[id] === true）
- **THEN** missing-elcb 問題 MUST 標記為已修復
- **AND** 不需要拆線
- **AND** ELCB 成本 $35 MUST 計入 totalCost

#### Scenario: 卸除 ELCB 後問題恢復

- **WHEN** 玩家安裝 ELCB 後又將其卸除
- **THEN** missing-elcb 問題 MUST 恢復為未修復狀態

### Requirement: Overrated breaker visual

overrated-breaker 問題迴路 MUST 有專屬視覺標示，聚焦在 NFB 元件。

#### Scenario: NFB 紅色邊框和警告圖示

- **WHEN** 迴路有 overrated-breaker 問題且未修復
- **THEN** CircuitDiagram 中該迴路的 NFB MUST 顯示紅色邊框
- **AND** NFB 上方 MUST 顯示 ⚠️ 圖示

#### Scenario: 修復後恢復

- **WHEN** overrated-breaker 問題修復完成
- **THEN** NFB 紅色邊框 MUST 消失
- **AND** ⚠️ MUST 消失

### Requirement: Missing ELCB visual

missing-elcb 問題迴路 MUST 有專屬視覺標示，暗示潮濕危險。

#### Scenario: 水滴警告圖示

- **WHEN** 迴路有 missing-elcb 問題且未修復
- **THEN** CircuitDiagram 中該迴路 MUST 顯示 💧⚠️ 圖示

#### Scenario: 修復後恢復

- **WHEN** missing-elcb 問題修復完成
- **THEN** 💧⚠️ MUST 消失

### Requirement: Problem resolution unified check

系統 MUST 提供統一的問題修復判定函式 `isProblemResolved`，依問題類型分派不同判定邏輯。

#### Scenario: 各類型修復判定

- **WHEN** 呼叫 isProblemResolved(problem, state)
- **THEN** bare-wire MUST 檢查：已拆線 + 重接 + 壓接完成
- **AND** wrong-wire-gauge MUST 檢查：已拆線 + 重接（新線材容量足夠）+ 壓接完成
- **AND** oxidized-splice MUST 檢查：已拆線 + 重接 + 壓接完成
- **AND** overrated-breaker MUST 檢查：circuitBreakers[id].ratedCurrent ≤ 當前線材 maxCurrent
- **AND** missing-elcb MUST 檢查：circuitElcb[id] === true

#### Scenario: 同迴路多問題獨立判定

- **WHEN** 同一迴路有多個問題（如 overrated-breaker + wrong-wire-gauge）
- **THEN** 各問題 MUST 獨立判定，全部修復才從問題清單移除該迴路
