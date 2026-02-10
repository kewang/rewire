## ADDED Requirements

### Requirement: OldHouseSnapshot data structure

系統 MUST 定義快照資料結構，記錄進入老屋關卡時的初始狀態。

- `CircuitSnapshot = { wire: Wire; breaker: Breaker; crimpQuality: CrimpQuality; elcbEnabled: boolean; appliances: readonly Appliance[] }`
- `OldHouseSnapshot = { problems: readonly OldHouseProblem[]; circuits: Record<CircuitId, CircuitSnapshot> }`

#### Scenario: 型別定義完整

- **WHEN** 引入 OldHouseSnapshot 型別
- **THEN** CircuitSnapshot MUST 包含 wire、breaker、crimpQuality、elcbEnabled、appliances 欄位
- **AND** OldHouseSnapshot MUST 包含 problems 陣列和 circuits 記錄

### Requirement: Snapshot capture on old house level entry

GameBoard MUST 在進入老屋關卡時自動擷取 Before 快照。

#### Scenario: 老屋關卡初始化後擷取快照

- **WHEN** 玩家選擇一個 oldHouse 關卡且初始化完成
- **THEN** GameBoard MUST 建立 OldHouseSnapshot
- **AND** snapshot.problems MUST 等於 Level.oldHouse.problems
- **AND** snapshot.circuits MUST 包含每個迴路的初始 wire、breaker、crimpQuality、elcbEnabled、appliances

#### Scenario: 非老屋關卡不擷取

- **WHEN** 玩家選擇非老屋關卡
- **THEN** OldHouseSnapshot MUST 為 null

#### Scenario: 快照不因後續操作而改變

- **WHEN** 快照擷取後玩家進行修復操作（拆線、換線、換 NFB、裝 ELCB）
- **THEN** OldHouseSnapshot 的值 MUST NOT 改變

#### Scenario: 重試時重新擷取

- **WHEN** 玩家在老屋關卡按下「重新嘗試」
- **THEN** MUST 重新擷取新的 OldHouseSnapshot（覆蓋舊值）

### Requirement: Snapshot stores breaker from initialization

快照中的 breaker 欄位 MUST 反映初始化時的實際 NFB 規格。

#### Scenario: overrated-breaker 迴路快照

- **WHEN** 老屋關卡有 overrated-breaker 問題（如 30A NFB 保護 2.0mm² 線材）
- **THEN** snapshot.circuits[circuitId].breaker.ratedCurrent MUST 為 30（初始過大的 NFB）

#### Scenario: 正常迴路快照

- **WHEN** 迴路無 breaker 問題
- **THEN** snapshot.circuits[circuitId].breaker MUST 為 preWiredCircuit.breaker 或 CircuitConfig.breaker

### Requirement: Snapshot stores ELCB from initialization

快照中的 elcbEnabled 欄位 MUST 反映初始化時的 ELCB 狀態。

#### Scenario: missing-elcb 迴路快照

- **WHEN** 老屋關卡有 missing-elcb 問題迴路
- **THEN** snapshot.circuits[circuitId].elcbEnabled MUST 為 false

#### Scenario: 無 ELCB 問題迴路

- **WHEN** 迴路無 missing-elcb 問題
- **THEN** snapshot.circuits[circuitId].elcbEnabled MUST 為 false（老屋固定迴路預設無 ELCB，除非明確設定）
