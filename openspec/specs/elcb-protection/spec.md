# elcb-protection Specification

## Purpose

ELCB 漏電保護機制 — wetArea 迴路標記、漏電事件系統、ELCB 跳脫與漏電失敗判定。

## Requirements

### Requirement: Wet area circuit attribute

CircuitConfig MUST 支援 `wetArea?: boolean` 可選屬性，標記該迴路為潮濕區域。

#### Scenario: wetArea 迴路標記

- **WHEN** CircuitConfig 的 `wetArea` 為 `true`
- **THEN** 該迴路 MUST 被視為潮濕區域迴路

#### Scenario: 非 wetArea 迴路

- **WHEN** CircuitConfig 的 `wetArea` 為 `undefined` 或 `false`
- **THEN** 該迴路 MUST 被視為乾燥區域迴路

### Requirement: Wet area ELCB mandatory rule

wetArea 迴路 MUST 安裝 ELCB 才能送電。

#### Scenario: wetArea 未安裝 ELCB 阻止送電

- **WHEN** 存在 wetArea 迴路未安裝 ELCB
- **THEN** 送電按鈕 MUST 為 disabled
- **AND** MUST 顯示提示文字說明需要安裝 ELCB

#### Scenario: wetArea 已安裝 ELCB 允許送電

- **WHEN** 所有 wetArea 迴路都已安裝 ELCB
- **AND** 所有迴路都已接線
- **THEN** 送電按鈕 MUST 為 enabled

#### Scenario: 無 wetArea 迴路不受影響

- **WHEN** 關卡沒有任何 wetArea 迴路
- **THEN** 送電條件 MUST 與原有規則相同（所有迴路已接線）

### Requirement: Leakage event system

系統 MUST 支援兩種漏電事件觸發模式：腳本式與隨機式。

#### Scenario: 腳本式漏電事件

- **WHEN** Level 的 `leakageMode` 為 `'scripted'`
- **AND** Level 的 `leakageEvents` 定義了事件列表
- **THEN** 系統 MUST 在指定的 elapsed 時間點觸發對應 wetArea 迴路的漏電事件

#### Scenario: 隨機式漏電事件

- **WHEN** Level 的 `leakageMode` 為 `'random'`
- **THEN** 每個 wetArea 迴路 MUST 每秒有 5%（LEAKAGE_CHANCE_PER_SECOND = 0.05）機率觸發漏電事件

#### Scenario: 乾燥迴路不觸發漏電

- **WHEN** 迴路的 `wetArea` 為 false 或 undefined
- **THEN** 該迴路 MUST 永遠不會觸發漏電事件

#### Scenario: 已終態迴路不觸發漏電

- **WHEN** 迴路已處於終態（burned / tripped / elcb-tripped / leakage）
- **THEN** 該迴路 MUST 不再觸發漏電事件

### Requirement: ELCB trip on leakage

有 ELCB 的迴路在漏電發生時 MUST 跳脫，切斷該迴路電力。

#### Scenario: 有 ELCB 的迴路漏電跳脫

- **WHEN** wetArea 迴路已安裝 ELCB
- **AND** 漏電事件觸發
- **THEN** 該迴路的 CircuitState.status MUST 變為 `'elcb-tripped'`
- **AND** 該迴路電器 MUST 停止運作
- **AND** 其他迴路 MUST 不受影響

#### Scenario: elcb-tripped 為終態

- **WHEN** CircuitState.status 為 `'elcb-tripped'`
- **THEN** 後續模擬步進 MUST 維持該狀態不變

### Requirement: Leakage failure without ELCB

無 ELCB 的 wetArea 迴路漏電時 MUST 觸發即時失敗。

#### Scenario: 無 ELCB 漏電觸發 leakage 失敗

- **WHEN** wetArea 迴路未安裝 ELCB（理論上不應發生，因為送電檢查已阻止，但作為安全網）
- **AND** 漏電事件觸發
- **THEN** 該迴路的 CircuitState.status MUST 變為 `'leakage'`
- **AND** overallStatus MUST 立即變為 `'leakage'`

### Requirement: ELCB-tripped circuit simulation behavior

ELCB 跳脫後的迴路 MUST 停止電流計算。

#### Scenario: elcb-tripped 迴路電流歸零

- **WHEN** CircuitState.status 為 `'elcb-tripped'`
- **THEN** 該迴路的 totalCurrent MUST 為 0
- **AND** wireHeat MUST 停止上升（可能冷卻）

#### Scenario: elcb-tripped 迴路不計入中性線電流

- **WHEN** 一個 110V 迴路的 status 為 `'elcb-tripped'`
- **THEN** 該迴路 MUST 不計入中性線電流計算

### Requirement: Leakage event constants

系統 MUST 定義漏電相關常數。

#### Scenario: LEAKAGE_CHANCE_PER_SECOND 常數

- **WHEN** 讀取隨機漏電機率常數
- **THEN** 值 MUST 為 0.05（每秒 5% 機率）
