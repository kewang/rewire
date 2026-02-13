## Why

App.css 仍有 3693 行，包含 12+ 個元件的樣式混在一起，難以維護和追蹤變更。前三批次已成功拆分 8 個元件（LevelSelect/LanguageSwitcher/ErrorFallback/GameBoard/VolumeControl/StatusDisplay/ResultPanel/BeforeAfterView），現在要完成剩餘所有元件的 CSS 拆分。

## What Changes

- 從 App.css 抽取 12 個元件的 CSS 到獨立檔案：
  - `CircuitDiagram.css` — 電路圖 SVG 動畫（wire flash/smoke/fire/old-house visual/NFB lever）
  - `CrimpMiniGame.css` — 壓接小遊戲 overlay（crimp-overlay/bar/result）
  - `PanelInteriorView.css` — 配電箱內部 overlay（panel-overlay/step-bar/cable-tie/routing-button/aesthetics-score）
  - `CircuitPlanner.css` — 迴路規劃容器（circuit-planner grid/planner-summary/confirm-btn/phase-balance-preview）
  - `RoomPanel.css` — 房間電器面板（room-panel/room-card/room-appliance）
  - `CircuitCard.css` — 迴路卡片（circuit-card/voltage-toggle/phase-toggle/ELCB toggle）
  - `BreakerSelector.css` — NFB 更換彈出選擇器（breaker-selector-backdrop/options）
  - `FloorPlanView.css` — 平面圖 SVG 渲染（floor-plan-view/fp-*/simulation visual/fp-layout/preview）
  - `CircuitAssignmentPopover.css` — 房間迴路指派 popover（circuit-popover__*）
  - `CircuitPlannerSidebar.css` — 平面圖規劃側欄（sidebar-*/sidebar-circuit-card__*）
  - `WireToolbar.css` — 底部線材工具列（wire-toolbar__*）
  - `RoutingStrategyPicker.css` — 走線策略選擇 overlay（routing-strategy-*）
- 各元件 responsive media query 規則一併移入對應的元件 CSS 檔
- App.css 僅保留跨元件共用樣式（ELCB Panel/Phase Badge/Cards shared/circuit-tabs/voltage-badge/wire-card drag/全域 responsive layout）
- 每個元件加入 `import './ComponentName.css'`

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

- `css-split`: 完成剩餘 12 個元件的 CSS 拆分，App.css 從 3693 行降至約 400 行

## Impact

- `src/App.css` — 大幅縮減，僅保留共用樣式
- `src/components/*.css` — 新增 12 個 CSS 檔
- `src/components/*.tsx` — 12 個元件各加入 CSS import
- 無功能變更、無 API 變更、無依賴變更
