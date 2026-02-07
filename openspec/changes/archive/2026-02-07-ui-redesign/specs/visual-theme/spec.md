## ADDED Requirements

### Requirement: CSS variable theme system

系統 MUST 使用 CSS variables 定義主題色彩、字體、間距，所有元件 MUST 引用 variables 而非 hardcoded 值。

#### Scenario: Root variables 定義

- **WHEN** 應用程式載入
- **THEN** `:root` MUST 定義色彩、字體、間距、圓角等 CSS variables
- **AND** 所有元件樣式 MUST 使用這些 variables

### Requirement: Display font

標題與關鍵 UI 元素 MUST 使用具辨識度的 display 字體，與系統字體有明顯區隔。

#### Scenario: 字體載入

- **WHEN** 應用程式載入
- **THEN** MUST 載入外部 display 字體（Google Fonts 或自託管）
- **AND** MUST 設定 `font-display: swap` 確保 fallback

#### Scenario: 字體應用範圍

- **WHEN** 頁面渲染
- **THEN** h1、h2、h3 標題 MUST 使用 display 字體
- **AND** body 文字 MUST 使用可讀性高的字體（可為系統字體）

### Requirement: Industrial visual atmosphere

遊戲 MUST 呈現配電盤/電力工業主題的視覺氛圍，不得為素樸的純黑底白字。

#### Scenario: 背景與紋理

- **WHEN** 遊戲頁面顯示
- **THEN** 背景 MUST 具有視覺深度（紋理、漸層、或 pattern）
- **AND** 整體色彩 MUST 具有電力/工業主題的統一感

#### Scenario: 卡片設計

- **WHEN** 線材卡片或電器卡片顯示
- **THEN** 卡片 MUST 具有深度感（shadow、gradient、或 border 層次）
- **AND** hover 狀態 MUST 有明顯的視覺回饋

#### Scenario: 關卡選擇頁面

- **WHEN** 關卡選擇頁面顯示
- **THEN** 關卡卡片 MUST 有 hover 動效
- **AND** 整體視覺 MUST 與遊戲內畫面風格一致

### Requirement: WCAG AA contrast

所有文字 MUST 在其背景上達到 WCAG AA 對比度標準（普通文字 ≥ 4.5:1，大文字 ≥ 3:1）。

#### Scenario: 主題變更後對比度

- **WHEN** 視覺主題應用後
- **THEN** 所有 label 文字對比度 MUST ≥ 4.5:1
- **AND** 所有 value 文字對比度 MUST ≥ 4.5:1
