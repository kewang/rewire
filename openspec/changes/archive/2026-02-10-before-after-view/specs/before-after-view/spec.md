## ADDED Requirements

### Requirement: BeforeAfterView component

系統 MUST 提供 BeforeAfterView 元件，在老屋關卡通關後顯示修復前後對比。

#### Scenario: 老屋關卡通關時顯示

- **WHEN** 老屋關卡結果為 won 或 over-budget
- **AND** OldHouseSnapshot 存在
- **THEN** ResultPanel 下方 MUST 顯示 BeforeAfterView 元件

#### Scenario: 非老屋關卡不顯示

- **WHEN** 非老屋關卡通關
- **THEN** BeforeAfterView MUST NOT 顯示

#### Scenario: 失敗時不顯示

- **WHEN** 老屋關卡結果為 tripped / burned / neutral-burned / leakage / main-tripped
- **THEN** BeforeAfterView MUST NOT 顯示

### Requirement: Before panel content

Before 面板 MUST 顯示修復前的問題狀態。

#### Scenario: Before 面板標題

- **WHEN** BeforeAfterView 顯示
- **THEN** Before 面板 MUST 有「修復前」標題

#### Scenario: 問題列表紅色高亮

- **WHEN** Before 面板列出問題迴路
- **THEN** 每個問題項目 MUST 以紅色高亮顯示
- **AND** MUST 顯示問題類型圖示（⚠️）
- **AND** MUST 顯示迴路名稱和問題描述

#### Scenario: 問題描述文字

- **WHEN** 問題類型為 bare-wire
- **THEN** 描述 MUST 為「沒壓端子」
- **WHEN** 問題類型為 wrong-wire-gauge
- **THEN** 描述 MUST 包含原始線徑（如「線徑過小 (1.6mm²)」）
- **WHEN** 問題類型為 oxidized-splice
- **THEN** 描述 MUST 為「氧化接點」
- **WHEN** 問題類型為 overrated-breaker
- **THEN** 描述 MUST 包含原始 NFB 規格（如「NFB 過大 (30A)」）
- **WHEN** 問題類型為 missing-elcb
- **THEN** 描述 MUST 為「缺漏電保護」

### Requirement: After panel content

After 面板 MUST 顯示修復後的正確狀態。

#### Scenario: After 面板標題

- **WHEN** BeforeAfterView 顯示
- **THEN** After 面板 MUST 有「修復後」標題

#### Scenario: 修復摘要列表

- **WHEN** After 面板列出修復結果
- **THEN** 每個修復項目 MUST 以綠色 ✓ 標示
- **AND** MUST 顯示迴路名稱和修復方式描述

#### Scenario: 修復方式描述 — bare-wire / oxidized-splice

- **WHEN** 問題為 bare-wire 或 oxidized-splice
- **THEN** 修復描述 MUST 為「重新接線 + 壓接」

#### Scenario: 修復方式描述 — wrong-wire-gauge

- **WHEN** 問題為 wrong-wire-gauge
- **THEN** 修復描述 MUST 包含新線徑（如「更換線材 → {新}mm²」）

#### Scenario: 修復方式描述 — overrated-breaker

- **WHEN** 問題為 overrated-breaker
- **THEN** 修復描述 MUST 包含 NFB 變更（如「更換 NFB {舊}A → {新}A」）

#### Scenario: 修復方式描述 — missing-elcb

- **WHEN** 問題為 missing-elcb
- **THEN** 修復描述 MUST 為「安裝漏電斷路器（ELCB）」

### Requirement: Responsive layout

BeforeAfterView MUST 支援響應式佈局。

#### Scenario: 桌面版並排

- **WHEN** 視窗寬度 > 640px
- **THEN** Before 和 After 面板 MUST 左右並排（grid 兩欄）

#### Scenario: 手機版堆疊

- **WHEN** 視窗寬度 ≤ 640px
- **THEN** Before 和 After 面板 MUST 上下堆疊（grid 單欄）

### Requirement: Entry animations

BeforeAfterView MUST 有入場動畫效果。

#### Scenario: 整體淡入

- **WHEN** BeforeAfterView 首次顯示
- **THEN** 整個區塊 MUST 以 opacity 0→1 淡入，duration 約 0.5s

#### Scenario: After 側 ✓ 逐項出現

- **WHEN** After 面板的修復項目出現
- **THEN** 每個 ✓ 項目 MUST 有 popIn 動畫（scale + opacity）
- **AND** 各項目 MUST 有 staggered delay（每項間隔約 0.15s）

### Requirement: Visual theme consistency

BeforeAfterView MUST 與現有工業深色主題一致。

#### Scenario: 背景與邊框

- **WHEN** BeforeAfterView 顯示
- **THEN** MUST 使用 CSS variables（--surface-bg, --border-color 等）
- **AND** Before 面板 MUST 有紅色系邊框/標題色
- **AND** After 面板 MUST 有綠色系邊框/標題色
