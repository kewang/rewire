## Overview

完成 App.css 的最終拆分，將剩餘 12 個元件的 CSS 抽取到各自的 per-component CSS 檔案中。這是純樣式重組，不涉及任何功能或行為變更。

## Approach

### 拆分策略

1. **逐元件抽取**：依照 App.css 中的 section 註解邊界，將每個元件的樣式完整搬移到對應的 `src/components/<ComponentName>.css`
2. **Responsive 規則跟隨元件**：各元件的 `@media` 響應式規則一併移入該元件的 CSS 檔，不留在 App.css
3. **共用樣式保留**：跨多元件使用的共用 class（`.card`, `.card-list`, `.phase-badge`, `.voltage-badge` 等）留在 App.css
4. **import 注入**：每個元件的 `.tsx` 檔加入 `import './ComponentName.css'`

### 元件與 CSS 對應表

| 元件 | CSS 檔 | App.css 原行範圍 |
|---|---|---|
| CircuitDiagram | CircuitDiagram.css | L315-452 + L268-287（NFB）+ L845-863（old-house）|
| CrimpMiniGame | CrimpMiniGame.css | L453-843 + mobile L2171-2191 |
| PanelInteriorView | PanelInteriorView.css | L864-1389 + tablet L2070-2074 + mobile L2216-2257 |
| CircuitPlanner | CircuitPlanner.css | L1391-1407 + L1889-2033 + tablet L2076-2096 + mobile L2193-2206 |
| RoomPanel | RoomPanel.css | L1409-1512 |
| CircuitCard | CircuitCard.css | L1513-1888 + mobile L2208-2214 |
| BreakerSelector | BreakerSelector.css | L2260-2428 |
| FloorPlanView | FloorPlanView.css | L2429-2586 + L3399-3431（preview）+ mobile L3602-3640 |
| CircuitAssignmentPopover | CircuitAssignmentPopover.css | L2588-2678 |
| CircuitPlannerSidebar | CircuitPlannerSidebar.css | L2679-3228 + mobile L2685-2694/L3614-3634 + tablet L3674-3692 |
| WireToolbar | WireToolbar.css | L3229-3398 + mobile L3642-3671 |
| RoutingStrategyPicker | RoutingStrategyPicker.css | L3433-3598 |

### App.css 保留內容

- ELCB Panel（`.elcb-panel*`）— StatusDisplay / CircuitCard 共用
- Phase Balance（`.phase-badge*`, `.phase-balance-indicator`, `.main-breaker-row`）— 多元件共用
- Cards shared（`.card*`, `.card-list`, `.card-title`, `.card-detail`）— WireSelector / AppliancePanel 共用
- Circuit tabs（`.circuit-tab*`）— AppliancePanel
- Voltage badges（`.voltage-badge*`, `.voltage-tab-badge`, `.voltage-hint`）— 多元件共用
- h3/h4 全域樣式
- Wire card drag（`.wire-card*`）— WireSelector
- 全域 responsive layout（`.game-main`, `.panel-left/center/right`, `.game-board` 等）

## Risks

- **風險極低**：純 CSS 搬移，Vite bundler 會合併所有 CSS，最終產出不受影響
- 驗證方式：lint + build + 142 tests + 視覺抽檢
