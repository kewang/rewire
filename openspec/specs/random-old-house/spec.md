## ADDED Requirements

### Requirement: Random Old House Generator

`src/engine/randomOldHouse.ts` MUST 提供純函式 `generateRandomOldHouse(difficulty: 1 | 2 | 3): FixedCircuitLevel`。

#### Scenario: 難度 1（初級）

- **WHEN** difficulty = 1
- **THEN** 生成 MUST 有 2-3 迴路、1-2 問題
- **AND** 問題池 MUST 僅限 bare-wire/wrong-wire-gauge/oxidized-splice
- **AND** 存活時間 MUST 為 13 秒

#### Scenario: 難度 2（中級）

- **WHEN** difficulty = 2
- **THEN** 生成 MUST 有 3-4 迴路、2-3 問題
- **AND** 問題池 MUST 為全 5 種
- **AND** MUST 啟用手動相位
- **AND** 存活時間 MUST 為 16 秒

#### Scenario: 難度 3（高級）

- **WHEN** difficulty = 3
- **THEN** 生成 MUST 有 4-6 迴路、3-5 問題
- **AND** 問題池 MUST 為全 5 種
- **AND** MUST 啟用相位 + 漏電 + 走線
- **AND** 存活時間 MUST 為 19 秒

#### Scenario: 預算計算

- **WHEN** 生成隨機老屋關卡
- **THEN** budget MUST 為修復成本 × 1.3（30% 彈性）

#### Scenario: 可解性驗證

- **WHEN** 生成完成
- **THEN** MUST 驗證至少存在一個合法修復方案
- **AND** 預算 MUST 足以覆蓋最低成本修復

### Requirement: Random completion tracking

系統 MUST 追蹤隨機老屋通關次數。

#### Scenario: 通關紀錄

- **WHEN** 玩家通關隨機老屋關卡
- **THEN** MUST 呼叫 saveRandomCompletion(difficulty)
- **AND** localStorage key `rewire-random-completions` MUST 更新該難度計數

#### Scenario: 不追蹤星等

- **WHEN** 隨機老屋關卡通關
- **THEN** MUST NOT 寫入 `rewire-stars` localStorage

### Requirement: LevelSelect random section

LevelSelect MUST 在固定關卡 grid 下方顯示隨機老屋挑戰區塊。

#### Scenario: 三張難度卡片

- **WHEN** 關卡選擇頁顯示
- **THEN** MUST 顯示初級/中級/高級三張卡片
- **AND** 每張 MUST 顯示難度名稱 + 說明 + 歷史通關次數

#### Scenario: 點擊卡片

- **WHEN** 玩家點擊難度卡片
- **THEN** MUST 呼叫 generateRandomOldHouse(difficulty)
- **AND** MUST 進入生成的關卡

### Requirement: randomDifficulty type extension

FixedCircuitLevel MUST 有可選 `randomDifficulty?: 1 | 2 | 3` 欄位。

#### Scenario: 隨機關卡標記

- **WHEN** generateRandomOldHouse 生成關卡
- **THEN** 生成的 Level MUST 設定 randomDifficulty
- **AND** GameBoard 通關時 MUST 據此判斷是否呼叫 saveRandomCompletion
