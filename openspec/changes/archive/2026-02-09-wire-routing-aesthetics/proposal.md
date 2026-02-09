## Why

Change 1 (`panel-interior-view`) 已建立配電箱內部 SVG 元件與車道拖曳互動。但目前缺少束帶工具、整線評分引擎、以及與 GameBoard 的流程整合——玩家無法在遊戲中實際使用整線功能。此 change 補齊剩餘機制，讓整線美學系統成為可玩的完整流程。

## What Changes

- 新增束帶工具 UI：PanelInteriorView 中相鄰車道間的可點擊放置點，toggle 束帶放置/移除，交叉車道 disabled
- 新增整線評分引擎 `src/engine/aesthetics.ts`：`calcAestheticsScore` 純函式（crossings × 20 + unbundledPairs × 5 扣分）
- PanelInteriorView 即時顯示整線分數（左下角）
- GameBoard 整線流程整合：新增 routing phase 狀態管理（circuitLanes, cableTies, routingCompleted, showRoutingOverlay）
- 「整線」按鈕：所有接線（+ 壓接 if requiresCrimp）完成後出現，點擊開啟 PanelInteriorView overlay
- 送電前置條件更新：`requiresRouting` 關卡需 routingCompleted = true 才能送電
- Level 型別新增 `requiresRouting?: boolean`
- ResultPanel 新增整線分數顯示區塊
- 整線評分常數新增至 `constants.ts`（CROSSING_PENALTY=20, UNBUNDLED_PENALTY=5）

## Capabilities

### New Capabilities
- `cable-tie-tool`: 束帶工具 UI 互動（放置/移除/交叉 disabled）與束帶狀態管理
- `aesthetics-scoring`: 整線評分引擎（calcAestheticsScore 純函式 + 常數定義）
- `routing-flow`: GameBoard 整線流程整合（routing phase 狀態、整線按鈕、送電前置條件、ResultPanel 分數顯示）

### Modified Capabilities
- `panel-interior-view`: 新增束帶放置點 UI + 即時整線分數顯示
- `star-rating`: calcStars 擴充支援 aestheticsScore 參數（為 Change 3 的 `aesthetics-score` BonusCondition 預留介面）

## Impact

- 修改檔案：`src/components/PanelInteriorView.tsx`（加入束帶 UI + 分數顯示）
- 修改檔案：`src/components/GameBoard.tsx`（routing phase 狀態 + 整線按鈕 + 送電條件）
- 修改檔案：`src/components/ResultPanel.tsx`（整線分數顯示）
- 修改檔案：`src/types/game.ts`（Level 新增 requiresRouting）
- 修改檔案：`src/data/constants.ts`（新增 CROSSING_PENALTY, UNBUNDLED_PENALTY）
- 修改檔案：`src/engine/scoring.ts`（calcStars 新增 aestheticsScore 參數）
- 新增檔案：`src/engine/aesthetics.ts`（整線評分引擎）
- 新增樣式：`src/App.css`（束帶視覺 + 整線按鈕 + 分數顯示）
- 不影響 L01–L20 任何功能（requiresRouting 預設 undefined/false）
