# main-breaker Specification

## Purpose
主開關跳脫模擬——計算配電箱總電流並在超過額定容量時觸發跳脫（遊戲失敗）。

## ADDED Requirements

### Requirement: Total panel current calculation

系統 MUST 計算 totalPanelCurrent 為所有非終態迴路的 totalCurrent 之和。終態包括 burned、tripped、elcb-tripped、main-tripped、neutral-burned、leakage。

#### Scenario: 所有迴路正常運行

- **WHEN** 有 3 條迴路，totalCurrent 分別為 10A、15A、8A，皆為 normal 狀態
- **THEN** totalPanelCurrent MUST 為 33A

#### Scenario: 部分迴路已跳脫

- **WHEN** 有 3 條迴路，c1=10A(normal)、c2=15A(tripped)、c3=8A(normal)
- **THEN** totalPanelCurrent MUST 為 18A（排除 tripped 的 c2）

#### Scenario: ELCB 跳脫的迴路不計入

- **WHEN** c1=10A(normal)、c2=12A(elcb-tripped)
- **THEN** totalPanelCurrent MUST 為 10A

### Requirement: Main breaker trip condition

當 totalPanelCurrent 超過 mainBreakerRating × 1.25 持續累積 1.5 秒，系統 MUST 觸發 main-tripped。

#### Scenario: 超載持續達 1.5 秒觸發跳脫

- **GIVEN** mainBreakerRating = 50A（跳脫閾值 = 62.5A）
- **WHEN** totalPanelCurrent = 70A 持續 1.5 秒
- **THEN** overallStatus MUST 變為 `'main-tripped'`

#### Scenario: 超載未達 1.5 秒不觸發

- **GIVEN** mainBreakerRating = 50A
- **WHEN** totalPanelCurrent = 70A 持續 1.0 秒後降至 50A
- **THEN** overallStatus MUST NOT 為 `'main-tripped'`
- **AND** mainBreakerTripTimer MUST 重置為 0

#### Scenario: 低於閾值重置計時

- **GIVEN** mainBreakerTripTimer 已累積 1.2 秒
- **WHEN** totalPanelCurrent 降至 mainBreakerRating × 1.25 以下
- **THEN** mainBreakerTripTimer MUST 重置為 0

#### Scenario: 未提供 mainBreakerRating 時不啟用

- **WHEN** stepMulti 呼叫未傳入 mainBreakerRating
- **THEN** 主開關跳脫邏輯 MUST 不執行
- **AND** mainBreakerTripTimer MUST 保持不變

### Requirement: main-tripped is terminal state

`'main-tripped'` 為終態（severity=3），一旦觸發不再進行任何計算。

#### Scenario: main-tripped 後 stepMulti 直接回傳

- **WHEN** overallStatus 已為 `'main-tripped'`
- **THEN** stepMulti MUST 回傳相同狀態不做任何變更

### Requirement: main-tripped severity

`'main-tripped'` 的嚴重程度 MUST 為 3，等同 burned。

#### Scenario: main-tripped 與 burned 同等嚴重

- **WHEN** worstStatus 比較 `'main-tripped'` 和 `'warning'`
- **THEN** 結果 MUST 為 `'main-tripped'`
