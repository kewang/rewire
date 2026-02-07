## Why

資料模型和模擬引擎已完成，但目前無法互動測試。需要建立遊戲的核心 UI，讓玩家可以選線材、加電器、送電、觀察模擬結果。這是 PRD FR-1 到 FR-6 的前端實現，也是讓整個遊戲可玩的關鍵步驟。

## What Changes

- 建立遊戲主畫面元件，整合所有子元件與模擬引擎
- 建立材料庫面板：顯示可選線材卡片，點選切換線材（FR-1）
- 建立電器面板：顯示可用電器，點選加入/移除插座上的電器（FR-1, FR-3）
- 建立狀態顯示區：即時顯示總電流、線材熱度、模擬狀態（FR-3, FR-4）
- 建立 NFB 開關：切換送電/斷電，驅動 requestAnimationFrame 模擬迴圈（FR-4）
- 建立結果面板：失敗時顯示原因與關鍵數字（FR-5）
- 使用 React useState 管理遊戲狀態（v0.1 不引入 Zustand）

## Capabilities

### New Capabilities
- `game-ui`: 遊戲互動介面，包含材料選擇、電器管理、送電控制、狀態顯示和結果面板

### Modified Capabilities

## Impact

- 新增 `src/components/GameBoard.tsx`：遊戲主畫面
- 新增 `src/components/WireSelector.tsx`：線材選擇面板
- 新增 `src/components/AppliancePanel.tsx`：電器管理面板
- 新增 `src/components/StatusDisplay.tsx`：即時狀態顯示
- 新增 `src/components/ResultPanel.tsx`：失敗結果面板
- 修改 `src/App.tsx`：載入 GameBoard
- 新增 `src/App.css`：基本遊戲版面樣式
