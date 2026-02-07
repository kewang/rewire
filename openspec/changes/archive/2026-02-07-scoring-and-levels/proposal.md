## Why

目前遊戲是自由模式——沒有目標、預算或過關條件。缺少 FR-6 成本結算和第 5 節關卡系統，玩家沒有策略取捨的動機（PRD 核心目標第 4 點）。需要加入成本計算、預算限制、過關判定和三個關卡，讓遊戲有完整的 core loop。

## What Changes

- 實作成本計算：線材成本 = 線長(固定 10m) × 每米單價
- 實作過關判定：指定電器正常運作滿 N 秒即過關
- 建立三個關卡資料（L01 基礎教學、L02 燒線陷阱、L03 成本取捨）
- 建立關卡選擇 UI 和關卡目標顯示
- 在 GameBoard 整合預算顯示、過關/超預算判定
- 過關時顯示成功結算面板（花費、預算差額）

## Capabilities

### New Capabilities
- `scoring-and-levels`: 成本計算、預算系統、過關條件、關卡定義與選擇 UI

### Modified Capabilities
- `game-ui`: 在 GameBoard 加入關卡選擇、預算顯示、過關結算面板

## Impact

- 新增 `src/data/levels.ts`：三個關卡定義
- 新增 `src/components/LevelSelect.tsx`：關卡選擇畫面
- 修改 `src/components/GameBoard.tsx`：整合關卡、預算、過關判定
- 修改 `src/components/StatusDisplay.tsx`：顯示成本與預算
- 修改 `src/components/ResultPanel.tsx`：增加過關成功面板
