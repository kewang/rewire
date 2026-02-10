## Why

自由配迴路（FreeCircuitLevel）的型別和資料模型已在 `free-circuit-data-model` change 中完成，但目前 GameBoard 遇到 FreeCircuitLevel 時直接 return（`handleSelectLevel` 第 489 行的 TODO）。玩家無法遊玩任何自由配迴路關卡。本 change 建立**迴路規劃 UI**——讓玩家在自由配迴路關卡中自行建立迴路、指派電器、選擇 NFB 與線材，並將規劃結果轉換為既有的 Circuit[] 進入模擬階段。

## What Changes

- 新增 `CircuitPlanner` 元件：迴路規劃主容器，管理玩家自建迴路清單
- 新增 `RoomPanel` 元件：左側房間電器清單，顯示指派狀態
- 新增 `CircuitCard` 元件：單條迴路卡片（電壓/NFB 選擇器/電器列表/電流指示/刪除按鈕）
- 新增 `PanelSummary` 子元件（或整合在 CircuitPlanner 內）：配電箱狀態摘要（插槽使用量/總成本/送電前置條件）
- GameBoard 擴充：偵測 FreeCircuitLevel → 進入規劃階段 → 規劃完成後轉換為 Circuit[] + CircuitConfig[] → 沿用既有模擬/壓接/走線流程
- 成本計算擴充：自由配迴路加入 NFB 成本（$10/$15/$20）
- 電器指派：點擊指派/移除，電壓匹配檢查
- 送電前置條件：所有電器已指派 + 每條迴路已選線 + 插槽未超限

## Capabilities

### New Capabilities
- `circuit-planner`: 迴路規劃 UI 元件群（CircuitPlanner/RoomPanel/CircuitCard）、電器指派邏輯、玩家迴路 CRUD
- `planner-game-integration`: GameBoard 與迴路規劃的整合流程（FreeCircuitLevel 偵測、規劃階段切換、Circuit[] 轉換、成本計算）

### Modified Capabilities
- `game-ui`: GameBoard 需偵測 FreeCircuitLevel 並切換到規劃階段 UI，render 路徑新增 planning phase

## Impact

- 新增 3 個元件檔案：`src/components/CircuitPlanner.tsx`, `src/components/RoomPanel.tsx`, `src/components/CircuitCard.tsx`
- 修改 `src/components/GameBoard.tsx`：handleSelectLevel 支援 FreeCircuitLevel、新增規劃階段狀態管理、轉換邏輯
- 修改 `src/App.css`：新增規劃 UI 相關樣式
- 不影響既有固定迴路關卡流程
