## ADDED Requirements

### Requirement: Appliance operation sounds

送電後每種已插入電器 MUST 播放對應的合成環境音效。

#### Scenario: 送電時開始播放

- **WHEN** 玩家按下 NFB 送電
- **THEN** 所有已插入電器 MUST 各自播放對應的運作音效

#### Scenario: 每種電器有不同音色

- **WHEN** 電器音效播放中
- **THEN** 吹風機、快煮壺、微波爐、廚下加熱器、烘衣機 MUST 各有可區分的音色

#### Scenario: 斷電時停止

- **WHEN** 玩家手動斷電、或狀態變為 tripped/burned
- **THEN** 所有電器運作音效 MUST 立即停止

### Requirement: Appliance operation animation

送電後已插入電器的卡片 MUST 顯示運作中的視覺動畫。

#### Scenario: 送電時顯示動畫

- **WHEN** 玩家按下 NFB 送電
- **THEN** 所有已插入電器卡片 MUST 顯示運作中動畫（脈動或發光效果）

#### Scenario: 斷電時停止動畫

- **WHEN** 玩家手動斷電、或狀態變為 tripped/burned
- **THEN** 所有電器卡片 MUST 立即停止運作動畫
