## ADDED Requirements

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
