## 1. WireToolbar 元件

- [x] 1.1 建立 `src/components/WireToolbar.tsx`：橫向排列線材卡片（gauge + 色塊 + costPerMeter + maxCurrent）+ 右側送電按鈕，接受與 WireSelector 相同的 drag 回調 props + power button 回調
- [x] 1.2 WireToolbar CSS 樣式：固定底部工具列 layout、線材卡片 flex 橫排、hover/active 狀態、disabled 灰化、送電按鈕樣式（複用 fp-power-button）
- [x] 1.3 WireToolbar Pointer Events 拖曳邏輯：從 WireSelector 移植 pointerdown/move/up + 觸控長按 150ms，確保與 FloorPlanView drop zone 配合

## 2. CircuitPlannerSidebar 元件

- [x] 2.1 建立 `src/components/CircuitPlannerSidebar.tsx`：可收合側欄（展開 280px / 收合 48px），包含配電箱摘要（slots + 主開關負載 + 相位平衡）+ 精簡版 CircuitCard 列表 + 確認按鈕
- [x] 2.2 CircuitPlannerSidebar 精簡版 CircuitCard：色塊 + 電壓 badge + NFB 選擇 + 相位 toggle + ELCB toggle + 電器數量 + 負載百分比條，卡片可展開顯示房間電器指派
- [x] 2.3 CircuitPlannerSidebar CSS 樣式：側欄 layout + 展開/收合 transition + 卡片堆疊 + 配電箱摘要顏色（green/orange/red）+ 確認按鈕 + 滾動容器
- [x] 2.4 CircuitPlannerSidebar 回調串接：onAddCircuit / onDeleteCircuit / onChangeVoltage / onChangeBreaker / onSelectWire / onAssignAppliance / onUnassignAppliance / onChangePhase / onChangeElcb / onSelectCircuit / onConfirm，與 GameBoard 既有邏輯對接

## 3. 平面圖迴路指派互動

- [x] 3.1 CircuitAssignmentPopover 元件：點擊房間彈出 popover（迴路列表 + 新增迴路 + 取消指派），定位於點擊座標附近，click-outside 關閉
- [x] 3.2 FloorPlanView 擴展：新增 applianceCounts prop 顯示房間電器數量 badge（SVG text "N⚡"）、hover tooltip 顯示電器名稱/功率
- [x] 3.3 GameBoard 整合迴路指派邏輯：onRoomClick → 判斷 planning phase → 有 selectedCircuit 直接指派 / 無則開 popover；維護 roomToCircuitMap state

## 4. GameBoard layout 切換

- [x] 4.1 GameBoard 條件渲染新 layout：currentFloorPlan 存在時渲染 FloorPlanView + CircuitPlannerSidebar + WireToolbar 組合，否則保持現有三欄 layout
- [x] 4.2 移除 FloorPlanView 內部送電按鈕（fp-power-button），改由 WireToolbar 負責
- [x] 4.3 平面圖 layout CSS：desktop 左側欄 + 中間 FloorPlanView + 底部 WireToolbar 的 grid/flex 佈局
- [x] 4.4 規劃/接線 phase 狀態管理：FreeCircuitLevel + floorPlan 時管理 planningPhase 狀態，控制 sidebar 展開/收合 + WireToolbar disabled/enabled

## 5. 固定迴路關卡整合

- [x] 5.1 FixedCircuitLevel + floorPlan 時自動生成 circuitAssignments（從 circuitConfigs 映射房間→迴路），跳過規劃階段，sidebar 預設收合
- [x] 5.2 確保老屋關卡（L18-L28）在平面圖模式下問題 badge + 拆線/修復流程正常運作

## 6. i18n 翻譯

- [x] 6.1 新增 i18n keys：sidebar 標題/按鈕、toolbar 標籤、popover 選項文字、phase 狀態文字，六語翻譯（zh-TW/en/ja/ko/fr/th）

## 7. Smoke Test 修復

- [x] 7.1 修復 stale closure bug：handleDragEnd 中 floorPlanHighlightedRoom 改用 ref 追蹤，避免 React 批次更新導致閉包值過時
- [x] 7.2 修復電器 tooltip 翻譯：floorPlanApplianceDetails 中 tRoomName → tApplianceName
- [x] 7.3 L06 加上 floorPlan: FLOOR_PLAN_S + room ID 對齊（living → living-room）
- [x] 7.4 Popover「新增迴路」自動指派房間：新增 handleAddCircuitAndAssignRoom，建立迴路同時指派房間電器
- [x] 7.5 無電器房間不可點擊：handleFloorPlanRoomClick 檢查 level data 中是否有電器
- [x] 7.6 平面圖關卡確認配置後需接線：floorPlan 關卡設 isWired: false，強制拖曳線材流程
