# multi-circuit-simulation Delta Spec

## MODIFIED Requirements

### Requirement: Multi-circuit step function

系統 MUST 提供 `stepMulti` 函式，接收多個 Circuit、當前 MultiCircuitState、dt、可選的 phases 映射、**可選的 mainBreakerRating**、可選的 config，迭代各迴路呼叫 step()，計算中性線電流與熱度，**計算主開關跳脫**，回傳新的 MultiCircuitState。

#### Scenario: stepMulti 函式簽名

- **WHEN** 呼叫 stepMulti
- **THEN** 函式簽名 MUST 為：
  ```typescript
  function stepMulti(
    circuits: readonly Circuit[],
    state: MultiCircuitState,
    dt: number,
    phases?: Record<CircuitId, 'R' | 'T'>,
    mainBreakerRating?: number,
    config?: SimulationConfig,
  ): MultiCircuitState
  ```

#### Scenario: mainBreakerRating 啟用主開關邏輯

- **WHEN** 傳入 mainBreakerRating = 50
- **AND** totalPanelCurrent > 62.5A 持續 1.5s
- **THEN** 回傳的 overallStatus MUST 為 `'main-tripped'`
- **AND** mainBreakerTripTimer MUST >= 1.5

#### Scenario: 主開關跳脫優先於 overallStatus

- **WHEN** main-tripped 觸發
- **THEN** overallStatus MUST 為 `'main-tripped'`，無論個別迴路狀態為何
