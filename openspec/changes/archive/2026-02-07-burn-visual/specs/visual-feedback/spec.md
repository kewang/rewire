## MODIFIED Requirements

### Requirement: Smoke and glow effects

過載或燒毀時 MUST 顯示視覺動畫效果。

#### Scenario: 過載發光

- **WHEN** 狀態為 warning
- **THEN** 線材 MUST 顯示發光或脈動效果

#### Scenario: 燒毀冒煙

- **WHEN** 狀態為 burned
- **THEN** MUST 顯示煙霧或焦黑視覺效果

#### Scenario: 燒毀明火

- **WHEN** 狀態為 burned
- **THEN** MUST 在斷裂處顯示橘紅色火焰粒子，向上飄散後消失

#### Scenario: 電線斷裂

- **WHEN** 狀態為 burned
- **THEN** SVG 線段 MUST 在接點處斷開，形成可見缺口

#### Scenario: 絕緣皮剝落

- **WHEN** 狀態為 burned
- **THEN** 斷裂處 MUST 顯示絕緣皮翻開和銅色內芯的視覺效果

#### Scenario: 結果面板不遮住特效

- **WHEN** 遊戲結束顯示結果面板
- **THEN** 結果面板 MUST 以 inline 方式顯示於遊戲區域下方，不得遮蓋 SVG 線路圖
