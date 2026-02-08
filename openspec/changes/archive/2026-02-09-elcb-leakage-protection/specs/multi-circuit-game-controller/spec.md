## ADDED Requirements

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
