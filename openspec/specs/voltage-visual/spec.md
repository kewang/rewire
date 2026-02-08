# voltage-visual Specification

## Purpose

定義電壓相關的視覺表現，包含 220V 雙線迴路圖、T 型插座、2P NFB 外觀、電壓標籤，以及電器卡片電壓 badge。

## Requirements

### Requirement: Voltage label on circuit

多迴路關卡中，每個迴路 MUST 顯示電壓標籤以供辨識。

#### Scenario: 多迴路顯示電壓標籤

- **WHEN** 關卡有多個迴路且包含不同電壓
- **THEN** 每個迴路名稱旁 MUST 顯示 "110V" 或 "220V" 標籤

#### Scenario: 全同電壓時不顯示標籤

- **WHEN** 關卡所有迴路電壓相同（如全部 110V）
- **THEN** 電壓標籤 MAY 省略（無區分必要）

#### Scenario: 單迴路不顯示電壓標籤

- **WHEN** 關卡只有一個迴路
- **THEN** MUST 不顯示電壓標籤

### Requirement: 220V circuit dual-line rendering

220V 迴路的線路 MUST 以雙平行線渲染，區別於 110V 的單線。

#### Scenario: 110V 迴路線路外觀

- **WHEN** 渲染 110V 迴路的電線
- **THEN** MUST 使用單線繪製（維持現有外觀）

#### Scenario: 220V 迴路線路外觀

- **WHEN** 渲染 220V 迴路的電線
- **THEN** MUST 使用雙平行線繪製（間距約 4px）
- **AND** 兩條線 MUST 使用紅色與黑色表示雙相

#### Scenario: 220V 線路狀態變化

- **WHEN** 220V 迴路進入 warning 或 burned 狀態
- **THEN** 雙線 MUST 同步顯示對應的熱度/燒毀特效

### Requirement: Outlet shape distinction

電路圖的插座形狀 MUST 依電壓類型不同。

#### Scenario: 110V 插座外觀

- **WHEN** 渲染 110V 迴路的插座
- **THEN** MUST 顯示標準雙扁插座圖示（維持現有外觀）

#### Scenario: 220V 插座外觀

- **WHEN** 渲染 220V 迴路的插座
- **THEN** MUST 顯示 T 型插座圖示（台灣 220V 標準）

### Requirement: NFB visual distinction

2P NFB 和 1P NFB 在電路圖上 MUST 有視覺區分。

#### Scenario: 1P NFB 外觀

- **WHEN** 渲染 110V 迴路的 NFB
- **THEN** MUST 顯示 "1P" 標示
- **AND** 維持現有寬度

#### Scenario: 2P NFB 外觀

- **WHEN** 渲染 220V 迴路的 NFB
- **THEN** MUST 顯示 "2P" 標示
- **AND** 寬度 MUST 較 1P 寬（視覺上佔兩格）

### Requirement: Voltage badge on appliance cards

電器卡片 MUST 標示其所需電壓。

#### Scenario: 電器卡片顯示電壓

- **WHEN** 渲染電器卡片
- **THEN** 每張卡片 MUST 顯示電壓 badge（"110V" 或 "220V"）

#### Scenario: 不相容電器的禁用提示

- **WHEN** 目標迴路為 110V 且電器為 220V
- **THEN** 電器卡片 MUST 顯示為 disabled
- **AND** MUST 顯示提示文字說明電壓不相容（如「需要 220V 迴路」）
