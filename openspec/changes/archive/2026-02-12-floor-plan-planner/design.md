## Context

v0.9 平面圖模式已完成 5 個 changes（data model → routing engine → renderer → wiring interaction → game integration）。目前平面圖關卡的迴路規劃仍使用獨立的 CircuitPlanner 全畫面元件，與平面圖視覺脫節。PRD FR-J-E 要求將規劃體驗整合到平面圖上：玩家在平面圖上點擊房間指派迴路，側欄管理迴路設定，底部工具列選線。

現有元件：
- `CircuitPlanner.tsx` — 全畫面迴路規劃（RoomPanel + CircuitCard 列表 + 配電箱摘要）
- `WireSelector.tsx` — 線材卡片拖曳源（垂直排列）
- `FloorPlanView.tsx` — 平面圖 SVG（已有 onRoomClick/onRoomHover/dragActive 互動 props）

## Goals / Non-Goals

**Goals:**
- 在平面圖關卡中，迴路規劃直接在平面圖上操作（點擊房間→指派迴路）
- CircuitPlannerSidebar 作為可收合側欄，精簡顯示迴路清單和配電箱摘要
- WireToolbar 作為固定底部工具列，橫向排列線材 + 送電按鈕
- 固定迴路關卡在平面圖上直接顯示已分配結果（跳過規劃階段）
- 非平面圖關卡保持現有 layout 不變

**Non-Goals:**
- 不刪除現有 CircuitPlanner / WireSelector（非平面圖關卡繼續使用）
- 不修改 PanelInteriorView overlay 行為
- 不新增關卡或調整 budget 數值（那是 floor-plan-levels change 的範圍）
- 不處理手機版雙指縮放平移（那是 floor-plan-polish 的範圍）

## Decisions

### 1. CircuitPlannerSidebar 為新元件，非修改 CircuitPlanner

**選擇：** 新建 `CircuitPlannerSidebar.tsx`，從 CircuitPlanner 提取邏輯但重新設計 layout。

**理由：** CircuitPlanner 是全畫面元件（RoomPanel 佔大面積），側欄需要精簡版 UI（迴路卡片堆疊 + 配電箱摘要在頂部）。保留原元件確保非平面圖關卡不受影響。

**替代方案：** 修改 CircuitPlanner 加 `mode` prop — 但兩種 layout 差異太大，共用元件會增加複雜度。

### 2. WireToolbar 為新元件，橫向排列

**選擇：** 新建 `WireToolbar.tsx`，底部固定工具列，線材卡片橫向排列 + 送電按鈕在右側。

**理由：** WireSelector 是垂直排列的側欄元件，工具列需要完全不同的 layout。送電按鈕從 FloorPlanView 內部移到工具列，統一操作區域。

### 3. 房間迴路指派流程

**選擇：** 點擊房間 → 彈出迴路選擇 popover（現有迴路列表 + 新增迴路按鈕）→ 選擇後房間標色。

**理由：** 比「先選迴路再點房間」更直覺。Popover 比 modal 輕量，不遮蓋平面圖全貌。

**互動細節：**
- 彈出 popover 顯示：現有迴路（色塊 + 名稱 + 電壓）+ 「新增迴路」按鈕
- 已指派到其他迴路的房間：顯示「取消指派」選項
- 指派後：房間邊框變為迴路色，FloorPlanView circuitAssignments 更新

### 4. 電器分配在側欄 CircuitCard 中操作

**選擇：** 電器分配保持在 CircuitPlannerSidebar 的 CircuitCard 內操作（展開卡片→從房間電器列表拖/點擊指派），不在平面圖上直接操作。

**理由：** 電器分配需要顯示詳細資訊（名稱、功率、電壓），在 SVG 房間格子裡空間不足。側欄操作更精確。

### 5. GameBoard layout 切換策略

**選擇：** `currentFloorPlan` 存在時使用新 layout（FloorPlanView 居中 + CircuitPlannerSidebar 左側 + WireToolbar 底部），否則保持現有三欄 layout。

**理由：** 條件渲染已有先例（floor-plan-game-integration 已用 currentFloorPlan 切換 FloorPlanView vs CircuitDiagram）。

**Layout 結構（桌面）：**
```
┌──────────────┬──────────────────────────┐
│ Sidebar      │                          │
│ (迴路清單)    │     FloorPlanView        │
│ (配電箱摘要)  │     (主視圖)              │
│              │                          │
├──────────────┴──────────────────────────┤
│  WireToolbar [1.6][2.0][3.5]...[送電⚡]  │
└─────────────────────────────────────────┘
```

### 6. 規劃階段 vs 接線階段 狀態機

**選擇：** FreeCircuitLevel 平面圖關卡有明確的兩階段：
1. **規劃中（planning）**：CircuitPlannerSidebar 展開，玩家指派房間到迴路、配置 NFB/相位/ELCB。WireToolbar 的線材區 disabled。確認按鈕在側欄底部。
2. **接線中（wiring）**：CircuitPlannerSidebar 收合為窄摘要列，WireToolbar 啟用，玩家選線拖曳到房間。

**理由：** 分階段避免同時操作規劃和接線造成混亂，也與現有 CircuitPlanner → 確認 → GameBoard 的流程語義一致。

## Risks / Trade-offs

- **側欄寬度 vs 平面圖空間** → 側欄預設 280px，可收合為 48px icon strip，確保平面圖有足夠渲染空間
- **觸控裝置側欄體驗** → 手機版側欄改為底部抽屜（向上滑出），但細節留給 floor-plan-polish
- **電器圖示在房間格子裡太擠** → 僅顯示電器數量 badge（如 "3⚡"），不顯示個別圖示；hover 顯示電器清單 tooltip
- **既有 CircuitPlanner 回調全部需要在 GameBoard 中保持** → CircuitPlannerSidebar 使用相同的回調 props，GameBoard 無需重複邏輯
