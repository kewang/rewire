# visual-feedback Specification

## Purpose
TBD - created by archiving change visual-feedback. Update Purpose after archive.
## Requirements
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

### Requirement: Warning buzzing sound

過載預警狀態 MUST 播放持續性低頻電流嗡嗡聲，音量隨 wireHeat 漸增。

#### Scenario: 進入 warning 時開始播放

- **WHEN** 模擬狀態從 normal 變為 warning
- **THEN** MUST 開始播放持續性 buzzing 音效

#### Scenario: 音量隨 wireHeat 漸增

- **WHEN** buzzing 正在播放且 wireHeat 值變化
- **THEN** 音量 MUST 隨 wireHeat 線性增加（wireHeat=0 時靜音，wireHeat=1 時最大音量）

#### Scenario: 回到 normal 時停止

- **WHEN** 模擬狀態從 warning 回到 normal
- **THEN** buzzing 音效 MUST 立即停止

#### Scenario: 斷電或終態時停止

- **WHEN** 玩家斷電、或狀態變為 tripped/burned
- **THEN** buzzing 音效 MUST 立即停止

### Requirement: Warning smoke particles

wireHeat 達到閾值時 MUST 在接點處顯示淡煙粒子，密度和透明度隨 wireHeat 漸增。

#### Scenario: wireHeat ≥ 0.3 時出現淡煙

- **WHEN** wireHeat ≥ 0.3 且狀態為 warning
- **THEN** MUST 在接點處顯示淡煙粒子（透明度低、粒子小、動畫慢）

#### Scenario: wireHeat ≥ 0.7 時煙霧加濃

- **WHEN** wireHeat ≥ 0.7 且狀態為 warning
- **THEN** 煙霧粒子數量 MUST 增加，透明度 MUST 提高

#### Scenario: 與 burned 煙霧區分

- **WHEN** 狀態為 warning 的煙霧
- **THEN** MUST 與 burned 狀態的煙霧在大小、透明度、速度上有明顯區分（warning 更小、更淡、更慢）

### Requirement: Status sound effects

狀態轉換時 MUST 播放提示音。

#### Scenario: 送電提示音

- **WHEN** 玩家按下 NFB 送電
- **THEN** MUST 播放啟動提示音

#### Scenario: 失敗提示音

- **WHEN** 狀態變為 tripped 或 burned
- **THEN** MUST 播放對應的失敗提示音

