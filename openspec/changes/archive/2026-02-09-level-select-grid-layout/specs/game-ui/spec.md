## ADDED Requirements

### Requirement: Level select grid layout

關卡選擇畫面 MUST 以多欄 grid 排列關卡卡片，從左到右、從上到下依序顯示。

#### Scenario: 桌面版多欄顯示

- **WHEN** viewport 寬度 ≥ 1025px
- **THEN** 關卡卡片 MUST 以 grid 排列，自動填充為 3-4 欄
- **AND** 每張卡片最小寬度 MUST 為 260px

#### Scenario: 平板版欄數適配

- **WHEN** viewport 寬度介於 641px-1024px
- **THEN** 關卡卡片 MUST 自動排列為 2 欄

#### Scenario: 手機版排列

- **WHEN** viewport 寬度 ≤ 640px
- **THEN** 關卡卡片 MUST 排列為 1 欄（全寬）

#### Scenario: 卡片等高對齊

- **WHEN** 同一行有多張卡片
- **THEN** 同行卡片高度 MUST 一致（由最高卡片決定）

#### Scenario: 電器名稱過長截斷

- **WHEN** 卡片內電器名稱列表超出卡片寬度
- **THEN** MUST 以省略號（ellipsis）截斷，不換行
