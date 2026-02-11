## Why

FloorPlanView 目前僅為靜態渲染（change 3 完成），玩家無法在平面圖上實際操作接線。需要實作 PRD FR-J-E Phase 2 的接線互動：讓玩家拖曳線材到平面圖上的房間、選擇走線策略（星形/串聯）、並即時看到距離和成本。這是將遊戲從抽象電路圖轉換到空間平面圖的核心互動步驟。

## What Changes

- FloorPlanView 新增房間點擊/拖曳放置偵測，支援 hover highlight 視覺回饋
- 新增 RoutingStrategyPicker 元件：多房間迴路時顯示星形 vs 串聯候選方案卡片（距離 + 成本）
- GameBoard 擴展 wiring state 以支援平面圖走線策略選擇（circuitRoutingStrategies / circuitRoutePaths）
- 修改 handleDragEnd 流程：單房間迴路自動 direct 路由、多房間迴路觸發策略選擇
- 成本計算改用走線距離（wire.costPerMeter × routeDistance）取代固定 DEFAULT_WIRE_LENGTH
- FloorPlanView candidatePaths / connectedPaths 由 GameBoard 驅動，反映真實接線狀態

## Capabilities

### New Capabilities
- `floor-plan-wiring`: 平面圖上的接線互動（房間點擊偵測 + hover highlight + 拖曳放置 + 走線策略選擇 + 距離成本更新）

### Modified Capabilities
- `floor-plan-renderer`: FloorPlanView 新增 onRoomClick / onRoomHover 回調 + 拖曳中房間高亮狀態
- `drag-drop-wiring`: handleDragEnd 擴展支援平面圖模式（房間為 drop zone）+ 策略選擇流程

## Impact

- `src/components/FloorPlanView.tsx` — 新增互動 props（onRoomClick, onRoomHover, highlightedRoomId, dragActive）
- `src/components/GameBoard.tsx` — 擴展 wiring state + 走線策略邏輯 + 成本計算更新
- `src/components/RoutingStrategyPicker.tsx` — 新元件
- `src/types/game.ts` — 新增 RoutingStrategy 型別、擴展 WiringState
- `src/App.css` — RoutingStrategyPicker 樣式 + 房間 hover 樣式
