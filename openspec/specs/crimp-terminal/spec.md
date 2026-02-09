## ADDED Requirements

### Requirement: Crimp terminal type definition

系統 MUST 定義兩種壓接端子類型（O 型環、Y 型叉），各有線徑相容規則。

#### Scenario: O 型環端子相容小中線徑

- **WHEN** 選擇 O 型環端子
- **THEN** MUST 僅相容 1.6mm²、2.0mm²、3.5mm²、5.5mm² 線徑
- **AND** 不相容 8mm² 和 14mm² 線徑

#### Scenario: Y 型叉端子相容全線徑

- **WHEN** 選擇 Y 型叉端子
- **THEN** MUST 相容所有 6 種線徑（1.6/2.0/3.5/5.5/8/14mm²）

#### Scenario: 不相容端子不可選

- **WHEN** 玩家已接 8mm² 或 14mm² 線材
- **AND** 進入壓接小遊戲
- **THEN** O 型環端子 MUST 為 disabled 不可選

### Requirement: Crimp quality model

系統 MUST 定義四種壓接品質等級，各對應不同接觸電阻倍率。

#### Scenario: excellent 品質接觸電阻倍率

- **WHEN** 壓接品質為 excellent
- **THEN** contactResistance MUST 為 1.00

#### Scenario: good 品質接觸電阻倍率

- **WHEN** 壓接品質為 good
- **THEN** contactResistance MUST 為 1.05

#### Scenario: poor 品質接觸電阻倍率

- **WHEN** 壓接品質為 poor
- **THEN** contactResistance MUST 為 1.25

#### Scenario: none 品質接觸電阻倍率

- **WHEN** 壓接品質為 none（未壓端子）
- **THEN** contactResistance MUST 為 1.50

### Requirement: Crimp mini-game

拖曳接線完成後，requiresCrimp 關卡 MUST 彈出壓接小遊戲 overlay。

#### Scenario: requiresCrimp 關卡觸發壓接小遊戲

- **WHEN** 玩家在 requiresCrimp 關卡中完成拖曳接線
- **THEN** MUST 彈出壓接小遊戲 overlay
- **AND** 接線狀態 MUST 不標記為 isWired（等壓接完成）

#### Scenario: 非 requiresCrimp 關卡跳過壓接

- **WHEN** 玩家在非 requiresCrimp 關卡中完成拖曳接線
- **THEN** MUST 直接標記 isWired
- **AND** contactResistance MUST 預設為 1.0

#### Scenario: 壓接小遊戲步驟一 — 選擇端子類型

- **WHEN** 壓接小遊戲顯示
- **THEN** MUST 顯示 O 型環和 Y 型叉兩種端子選項
- **AND** 不相容當前線徑的端子 MUST 為 disabled

#### Scenario: 壓接小遊戲步驟二 — 進度條操作

- **WHEN** 玩家選好端子類型
- **THEN** MUST 顯示進度條動畫（0→1 循環）
- **AND** 玩家點擊/觸控停止進度條
- **AND** 停止位置在甜蜜區中心 ±5% = excellent
- **AND** 停止位置在甜蜜區 ±15% = good
- **AND** 其餘位置 = poor

#### Scenario: 壓接小遊戲步驟三 — 結果回饋

- **WHEN** 玩家完成壓接操作
- **THEN** MUST 顯示壓接品質等級文字
- **AND** MUST 顯示接觸電阻倍率數值
- **AND** 玩家點擊確認後關閉 overlay 並更新接線狀態為 isWired

### Requirement: Crimp state management

GameBoard MUST 管理每個迴路的壓接狀態。

#### Scenario: 壓接結果儲存

- **WHEN** 壓接小遊戲完成
- **THEN** GameBoard MUST 儲存該迴路的壓接結果（端子類型 + 品質 + contactResistance）

#### Scenario: 壓接結果注入 Circuit

- **WHEN** 建構 Circuit 物件
- **THEN** MUST 從壓接狀態取得 contactResistance 注入 Circuit

#### Scenario: 重試時重置壓接狀態

- **WHEN** 玩家點擊重試
- **THEN** 所有迴路的壓接狀態 MUST 清除

### Requirement: Crimp terminal visual in circuit diagram

電路圖 MUST 在 NFB 連接點顯示端子圖示與品質色碼。

#### Scenario: 顯示端子類型圖示

- **WHEN** 迴路已完成壓接
- **THEN** 電路圖 NFB 底部 MUST 顯示對應端子圖示（O 型環=小圓圈、Y 型叉=小叉形）

#### Scenario: 品質色碼對應

- **WHEN** 端子圖示顯示
- **THEN** 顏色 MUST 反映壓接品質：excellent=綠色、good=黃綠色、poor=橘色、none=紅色虛線

#### Scenario: 未壓接不顯示端子圖示

- **WHEN** 迴路尚未完成壓接
- **THEN** NFB 底部 MUST 不顯示端子圖示

### Requirement: Crimp terminal cost

壓接端子 MUST 為免費，不影響成本計算。

#### Scenario: 端子不增加成本

- **WHEN** 玩家完成壓接（任何品質）
- **THEN** 總成本 MUST 不因壓接端子而增加
