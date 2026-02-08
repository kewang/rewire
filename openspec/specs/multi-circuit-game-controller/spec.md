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

### Requirement: Wet area ELCB power-on check

GameBoard MUST 在送電前檢查所有 wetArea 迴路是否已安裝 ELCB。

#### Scenario: wetArea 未裝 ELCB 阻止送電

- **WHEN** 存在 wetArea 迴路未安裝 ELCB
- **THEN** NFB 開關 MUST 為 disabled
- **AND** MUST 顯示提示文字（如「浴室迴路需安裝 ELCB」）

#### Scenario: 所有 wetArea 已裝 ELCB 且已接線可送電

- **WHEN** 所有 wetArea 迴路已安裝 ELCB
- **AND** 所有迴路已接線
- **THEN** NFB 開關 MUST 為 enabled

### Requirement: Leakage event driver

GameBoard rAF loop MUST 驅動漏電事件的觸發。

#### Scenario: 腳本式漏電事件驅動

- **WHEN** Level.leakageMode 為 `'scripted'`
- **AND** elapsed 達到 leakageEvent 的觸發時間
- **THEN** GameBoard MUST 觸發對應 wetArea 迴路的漏電事件

#### Scenario: 隨機式漏電事件驅動

- **WHEN** Level.leakageMode 為 `'random'`
- **AND** 每幀更新時
- **THEN** GameBoard MUST 對每個正常運作中的 wetArea 迴路，以 `LEAKAGE_CHANCE_PER_SECOND * dt` 機率判定是否觸發漏電

#### Scenario: 漏電觸發後更新 CircuitState

- **WHEN** 漏電事件觸發
- **AND** 該迴路有 ELCB
- **THEN** GameBoard MUST 將該迴路的 CircuitState.status 設為 `'elcb-tripped'`

#### Scenario: 漏電觸發無 ELCB 即時失敗

- **WHEN** 漏電事件觸發
- **AND** 該迴路無 ELCB
- **THEN** GameBoard MUST 將該迴路的 CircuitState.status 設為 `'leakage'`

### Requirement: ELCB toggle state management

GameBoard MUST 管理每個迴路的 ELCB 安裝狀態。

#### Scenario: ELCB toggle 只在未送電時可操作

- **WHEN** 遊戲已送電（NFB on）
- **THEN** ELCB toggle MUST 為 disabled

#### Scenario: ELCB toggle 更新 hasElcb 狀態

- **WHEN** 玩家切換迴路的 ELCB toggle
- **THEN** 該迴路的 hasElcb 狀態 MUST 更新
- **AND** 成本計算 MUST 即時反映變化
