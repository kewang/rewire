## ADDED Requirements

### Requirement: ELCB toggle renders when circuit has wetArea appliances

CircuitCard MUST 在迴路包含 wetArea 房間電器時顯示 ELCB toggle。

#### Scenario: 迴路有 wetArea 電器時顯示 ELCB toggle

- **WHEN** 迴路的 assignedAppliances 中有至少一個來自 wetArea 房間的電器
- **THEN** CircuitCard MUST 顯示 ELCB 開關
- **AND** MUST 顯示 ELCB 成本（$35）

#### Scenario: 迴路無 wetArea 電器時不顯示 ELCB toggle

- **WHEN** 迴路的 assignedAppliances 全部來自非 wetArea 房間
- **THEN** CircuitCard MUST 不顯示 ELCB 開關

#### Scenario: 移除 wetArea 電器後 ELCB toggle 消失

- **WHEN** 玩家移除迴路中最後一個 wetArea 電器
- **THEN** ELCB toggle MUST 消失
- **AND** elcbEnabled MUST 重設為 false

### Requirement: Player can toggle ELCB on/off

玩家 MUST 能透過 ELCB toggle 啟用或停用 ELCB。

#### Scenario: 啟用 ELCB

- **WHEN** 玩家勾選 ELCB toggle
- **THEN** 迴路的 elcbEnabled MUST 更新為 true
- **AND** 迴路成本 MUST 增加 ELCB_COST ($35)

#### Scenario: 停用 ELCB

- **WHEN** 玩家取消勾選 ELCB toggle
- **THEN** 迴路的 elcbEnabled MUST 更新為 false
- **AND** 迴路成本 MUST 減少 ELCB_COST ($35)

### Requirement: ELCB cost included in total cost

ELCB 費用 MUST 納入迴路成本計算。

#### Scenario: ELCB 成本計算

- **WHEN** 計算迴路成本
- **AND** 迴路 elcbEnabled 為 true
- **THEN** 迴路成本 MUST = wire cost + NFB cost + ELCB_COST($35)

#### Scenario: 無 ELCB 成本計算

- **WHEN** 計算迴路成本
- **AND** 迴路 elcbEnabled 為 false 或 undefined
- **THEN** 迴路成本 MUST = wire cost + NFB cost（不含 ELCB）

### Requirement: WetArea ELCB mandatory for confirmation

所有包含 wetArea 電器的迴路 MUST 啟用 ELCB 才能確認配置。

#### Scenario: wetArea 迴路未啟用 ELCB 時不可確認

- **WHEN** 存在包含 wetArea 電器的迴路且 elcbEnabled 為 false
- **THEN** 「確認配置」按鈕 MUST 為 disabled
- **AND** MUST 顯示提示「潮濕區域迴路需安裝 ELCB」

#### Scenario: 所有 wetArea 迴路已啟用 ELCB 時可確認

- **WHEN** 所有包含 wetArea 電器的迴路都 elcbEnabled 為 true
- **AND** 其他前置條件均滿足
- **THEN** 「確認配置」按鈕 MUST 為 enabled
