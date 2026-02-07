## Why

過關條件要求通電存活指定秒數（如 5 秒），但 UI 只顯示「通電時間」（已經過時間），玩家無法直覺得知還需撐多久。需要新增倒數計時器顯示剩餘時間，提升遊戲緊張感和可讀性。

## What Changes

- StatusDisplay 新增 `survivalTime` prop，計算並顯示剩餘時間倒數
- 將「通電時間」改為「剩餘時間」倒數顯示（從 survivalTime 遞減至 0）
- GameBoard 傳遞 `currentLevel.survivalTime` 給 StatusDisplay

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-ui`: Real-time status display 新增剩餘時間倒數顯示

## Impact

- 修改 `src/components/StatusDisplay.tsx`：新增 prop 和倒數顯示邏輯
- 修改 `src/components/GameBoard.tsx`：傳遞 survivalTime prop
