## Why

固定關卡通關後缺乏重玩動機。需要程序化生成隨機老屋關卡，提供無限重玩性。PRD v0.8 FR-I-D 定義了隨機老屋生成器的需求。

## What Changes

- 新增 `src/engine/randomOldHouse.ts` — 純函式隨機老屋生成器，3 級難度
- LevelSelect 新增「隨機老屋挑戰」區塊，三張難度卡片
- localStorage 通關次數紀錄（key: `rewire-random-completions`）
- game.ts 新增 `randomDifficulty` 屬性標記隨機關卡
- GameBoard 通關時呼叫 saveRandomCompletion()

## Capabilities

### New Capabilities

- `random-old-house`: 隨機老屋生成引擎（迴路/問題/電器/預算隨機分配 + 可解性驗證）

### Modified Capabilities

- `level-select`: 新增隨機老屋挑戰區塊（3 難度卡片 + 歷史通關次數）
- `old-house-mode`: 支援隨機生成的關卡（randomDifficulty 標記 + 通關紀錄）

## Impact

- **新增**：`src/engine/randomOldHouse.ts`
- **修改**：`game.ts`（randomDifficulty）、`LevelSelect.tsx`（隨機區塊）、`GameBoard.tsx`（saveRandomCompletion）、`App.css`（卡片樣式）
- **無 breaking changes**：固定關卡完全不受影響
