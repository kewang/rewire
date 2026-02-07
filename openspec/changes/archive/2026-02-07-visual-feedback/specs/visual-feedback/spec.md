## ADDED Requirements

### Requirement: Circuit diagram visualization

系統 MUST 在遊戲畫面中顯示簡化的線路圖（NFB → 線材 → 插座）。

#### Scenario: 顯示線路圖

- **WHEN** 遊戲進入關卡
- **THEN** MUST 在中央區域顯示 SVG 線路圖，包含 NFB、線材和插座的圖示

### Requirement: Wire color change

線材顏色 MUST 根據 wireHeat 值動態變化：白色(正常) → 黃色(預警) → 紅色(高溫) → 黑色(燒毀)。

#### Scenario: 正常時為白色

- **WHEN** wireHeat 接近 0
- **THEN** 線材顏色 MUST 為白色或淺灰色

#### Scenario: 過載時漸變為黃紅色

- **WHEN** wireHeat 在 0.3 到 0.7 之間
- **THEN** 線材顏色 MUST 從黃色漸變為紅色

#### Scenario: 燒毀時為黑色

- **WHEN** wireHeat 達到 1.0
- **THEN** 線材顏色 MUST 為黑色或深灰色

### Requirement: Smoke and glow effects

過載或燒毀時 MUST 顯示視覺動畫效果。

#### Scenario: 過載發光

- **WHEN** 狀態為 warning
- **THEN** 線材 MUST 顯示發光或脈動效果

#### Scenario: 燒毀冒煙

- **WHEN** 狀態為 burned
- **THEN** MUST 顯示煙霧或焦黑視覺效果

### Requirement: Status sound effects

狀態轉換時 MUST 播放提示音。

#### Scenario: 送電提示音

- **WHEN** 玩家按下 NFB 送電
- **THEN** MUST 播放啟動提示音

#### Scenario: 失敗提示音

- **WHEN** 狀態變為 tripped 或 burned
- **THEN** MUST 播放對應的失敗提示音
