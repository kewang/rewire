## MODIFIED Requirements

### Requirement: Circuit diagram visualization

系統 MUST 在遊戲畫面中顯示簡化的線路圖（NFB → 線材 → 插座），並支援拖曳接線的視覺狀態。

#### Scenario: 顯示線路圖

- **WHEN** 遊戲進入關卡
- **THEN** MUST 在中央區域顯示 SVG 線路圖，包含 NFB、線材和插座的圖示

#### Scenario: 未接線狀態

- **WHEN** 尚未接線（isWired = false）且未在拖曳中
- **THEN** NFB 到插座的路徑 MUST 顯示為灰色虛線佔位符
- **AND** MUST 顯示提示文字「拖曳線材到此處接線」

#### Scenario: 拖曳中預覽

- **WHEN** 玩家正在拖曳線材且游標在 CircuitDiagram 內
- **THEN** MUST 顯示從 NFB 底部到游標位置的彩色虛線路徑
- **AND** 插座區域 MUST 顯示高亮發光邊框

#### Scenario: 已接線狀態

- **WHEN** 接線完成（isWired = true）
- **THEN** 線段 MUST 顯示為實線，顏色對應線材線徑
- **AND** 接點圓圈 MUST 正常顯示

#### Scenario: 接線成功動畫

- **WHEN** 拖曳放置成功的瞬間
- **THEN** 線段 MUST 播放虛線到實線的轉變動畫
- **AND** 接點處 MUST 顯示短暫閃光效果
