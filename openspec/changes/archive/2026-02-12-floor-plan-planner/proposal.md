## Why

v0.9 的平面圖模式已完成渲染、走線互動和模擬視覺整合，但迴路規劃仍使用獨立的 CircuitPlanner 畫面，與平面圖視圖脫節。玩家需要在平面圖上直接點擊房間來規劃迴路分配，並透過底部工具列選線、側欄管理迴路設定，才能實現 PRD 定義的整合式平面圖體驗。

## What Changes

- 新增 `CircuitPlannerSidebar` 元件：從 CircuitPlanner 重構為可收合側欄，精簡版 CircuitCard 顯示迴路清單（NFB/相位/ELCB 設定）、配電箱摘要（插槽使用量 + 主開關預估負載 + 相位平衡）
- 新增 `WireToolbar` 元件：從 WireSelector 重構為固定底部工具列，橫向排列 6 種線材 + 送電按鈕
- FloorPlanView 擴展迴路規劃互動：點擊房間指派迴路、同迴路房間同色邊框、電器圖示顯示在房間內
- GameBoard 整合：平面圖關卡使用新 layout（FloorPlanView + CircuitPlannerSidebar + WireToolbar），非平面圖關卡保持現有 layout
- 固定迴路關卡在平面圖上直接顯示已分配的房間和電器，跳過規劃階段

## Capabilities

### New Capabilities
- `circuit-planner-sidebar`: 迴路規劃側欄元件，精簡版迴路卡片 + 配電箱摘要 + 收合/展開
- `wire-toolbar`: 底部線材工具列元件，橫向線材選擇 + 送電按鈕整合
- `floor-plan-circuit-assignment`: 平面圖上的迴路指派互動（點擊房間→選擇迴路/新增迴路→電器分配視覺）

### Modified Capabilities
- `floor-plan-renderer`: 新增房間內電器圖示渲染、迴路指派互動回調
- `floor-plan-wiring`: 走線流程整合 WireToolbar 拖曳源
- `circuit-planner`: 重構為側欄模式，精簡 CircuitCard

## Impact

- 新增檔案：`src/components/CircuitPlannerSidebar.tsx`、`src/components/WireToolbar.tsx`
- 修改檔案：`src/components/GameBoard.tsx`（layout 切換 + 規劃狀態管理）、`src/components/FloorPlanView.tsx`（電器圖示 + 迴路指派回調）、`src/App.css`（側欄 + 工具列樣式）
- 現有 CircuitPlanner/WireSelector 保留不刪除，非平面圖關卡繼續使用
