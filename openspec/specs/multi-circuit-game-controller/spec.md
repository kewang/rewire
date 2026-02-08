# multi-circuit-game-controller Specification

## Purpose

定義 GameBoard 在多迴路場景下的迴路動態建立、各迴路獨立線材選擇與接線狀態管理，以及跨迴路成本計算的行為規格。

## Requirements

### Requirement: Dynamic circuit management

GameBoard MUST 依 Level.circuitConfigs 動態建立多個 Circuit，每個迴路獨立管理 Wire 和 Appliance。

#### Scenario: 從 Level 建立多迴路

- **WHEN** 玩家選擇一個有 2 個 circuitConfigs 的關卡
- **THEN** GameBoard MUST 建立 2 個 Circuit 物件
- **AND** 每個 Circuit 的 id、label、breaker MUST 對應 circuitConfig

#### Scenario: 單迴路關卡向後相容

- **WHEN** 玩家選擇 L01-L05（單迴路）
- **THEN** GameBoard 行為 MUST 與多迴路重構前完全相同

### Requirement: Per-circuit wire selection

GameBoard MUST 支援每個迴路獨立選擇線材。

#### Scenario: 拖曳接線到迴路更新該迴路 wire

- **WHEN** 玩家將 5.5mm² 線材拖曳到迴路 B
- **THEN** 迴路 B 的 wire MUST 更新為 5.5mm² 線材
- **AND** 迴路 A 的 wire MUST 不受影響

#### Scenario: 替換迴路線材

- **WHEN** 迴路 B 已接好 2.0mm² 線材，玩家再拖曳 3.5mm² 線材到迴路 B
- **THEN** 迴路 B 的 wire MUST 更新為 3.5mm² 線材

### Requirement: Per-circuit wiring state

WiringState.circuits MUST 追蹤每個迴路的接線狀態。

#### Scenario: 多迴路接線進度獨立

- **WHEN** 迴路 A 已接線、迴路 B 未接線
- **THEN** circuits['a'].isWired MUST 為 true
- **AND** circuits['b'].isWired MUST 為 false

#### Scenario: isWired 為所有迴路接線完成的衍生值

- **WHEN** 所有迴路都已完成接線
- **THEN** WiringState.isWired MUST 為 true
- **WHEN** 任一迴路未完成接線
- **THEN** WiringState.isWired MUST 為 false

### Requirement: Cost calculation across circuits

成本計算 MUST 加總所有迴路的線材成本。

#### Scenario: 多迴路成本加總

- **WHEN** 迴路 A 使用 5.5mm²（$30/m × 10m = $300）、迴路 B 使用 2.0mm²（$10/m × 10m = $100）
- **THEN** 總成本 MUST 為 $400
