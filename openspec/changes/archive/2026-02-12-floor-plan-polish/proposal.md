## Why

v0.9 平面圖模式的 8 個核心 changes 已全部完成，功能面齊備。但在響應式佈局、動畫細節、i18n 完整性方面還需要收尾打磨，確保平面圖模式在各裝置上都有良好的使用體驗。

## What Changes

- **響應式佈局**：為 fp-layout（sidebar + FloorPlanView + WireToolbar）補齊 mobile/tablet 斷點樣式，確保手機版可操作
- **Sidebar 收合動畫**：CircuitPlannerSidebar 展開/收合加入 CSS transition，mobile 預設收合
- **WireToolbar 手機適配**：小螢幕橫向捲動、卡片尺寸調整
- **Popover 定位優化**：CircuitAssignmentPopover 在小螢幕不超出 viewport
- **FloorPlanView 響應式**：viewBox 縮放適配小螢幕、距離標籤可讀性
- **動畫細節**：popover 入場動畫、送電按鈕狀態轉場、sidebar 展開過渡
- **i18n 審計**：掃描所有平面圖元件，確認無硬編碼字串遺漏
- **視覺微調**：路徑重疊可讀性、距離標籤字體、room badge 清晰度

## Capabilities

### New Capabilities
- `floor-plan-responsive`: 平面圖模式的響應式佈局（mobile/tablet/desktop 三段適配）
- `floor-plan-animation-polish`: 平面圖 UI 動畫細節打磨（transition、entrance animation、hover feedback）

### Modified Capabilities
- `floor-plan-renderer`: FloorPlanView viewBox 響應式縮放 + 距離標籤可讀性改善
- `circuit-planner-sidebar`: 收合動畫 transition + mobile 預設收合邏輯
- `wire-toolbar`: 小螢幕橫向捲動 + 卡片尺寸適配
- `floor-plan-circuit-assignment`: Popover 入場動畫 + 小螢幕 viewport clamping 優化
- `i18n`: 平面圖元件硬編碼字串審計修復

## Impact

- `src/App.css` — 新增 fp-layout 響應式 @media 規則
- `src/components/CircuitPlannerSidebar.tsx` — 收合 transition + mobile auto-collapse
- `src/components/WireToolbar.tsx` — 橫向捲動容器 + mobile 卡片尺寸
- `src/components/CircuitAssignmentPopover.tsx` — 入場動畫 + viewport clamping
- `src/components/FloorPlanView.tsx` — viewBox 響應式 + 標籤可讀性
- `src/locales/*.json` — 補齊遺漏的 i18n keys（6 語）
