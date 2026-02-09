# responsive-layout Specification

## Purpose
RWD 響應式佈局，支援手機/平板/桌面三斷點。

## Requirements
### Requirement: Mobile layout (≤ 640px)

手機版 MUST 將三欄 layout 改為單欄堆疊，所有內容在窄螢幕上可讀且可操作。

#### Scenario: 單欄堆疊順序

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** game-main 區域 MUST 改為單欄垂直排列
- **AND** 排列順序 MUST 為：狀態面板 → 電路圖 → 線材選擇 → 電器面板 → 送電控制

#### Scenario: 線材選擇水平滾動

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 線材選擇區 MUST 改為水平滾動列表
- **AND** 每張線材卡片 MUST 維持足夠寬度以顯示完整文字（不得文字直排）

#### Scenario: 電路圖全寬

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 電路圖 MUST 佔滿容器寬度，SVG 等比縮放

### Requirement: Tablet layout (641px – 1024px)

平板版 MUST 使用兩欄 layout，左欄放選擇面板，右欄放電路圖與控制。

#### Scenario: 兩欄排列

- **WHEN** viewport 寬度在 641px 至 1024px 之間
- **THEN** game-main MUST 分為兩欄
- **AND** 左欄包含線材選擇與電器面板
- **AND** 右欄包含電路圖、送電控制

### Requirement: Desktop layout (≥ 1025px)

桌面版 MUST 維持三欄 layout，但電路圖中欄寬度 MUST ≥ 280px。迴路數 ≥ 4 時 MUST 加寬容器以容納多行電路圖。

#### Scenario: 三欄比例調整

- **WHEN** viewport 寬度 ≥ 1025px
- **THEN** game-main MUST 為三欄 layout
- **AND** 中欄（電路圖區）最小寬度 MUST 為 280px

#### Scenario: 4+ 迴路加寬容器

- **WHEN** viewport 寬度 ≥ 1025px
- **AND** 迴路數 ≥ 4
- **THEN** game-board max-width MUST 加寬至 1500px
- **AND** 三欄 layout MUST 維持不變（線材選擇左、電路圖中、電器右）

### Requirement: Result panel auto-scroll

結果面板出現時 MUST 自動捲動到可見範圍。

#### Scenario: 結果面板自動捲入視野

- **WHEN** 遊戲結束且結果面板渲染
- **THEN** 頁面 MUST 自動平滑捲動使結果面板進入 viewport
- **AND** 捲動行為 MUST 為 smooth
