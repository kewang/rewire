## 1. GameBoard 狀態擴充

- [x] 1.1 新增 gamePhase state（'planning' | 'wiring' | 'simulation'），FreeCircuitLevel 型別偵測，handleSelectLevel 支援 FreeCircuitLevel（進入 planning phase）
- [x] 1.2 新增 plannerCircuits state（PlannerCircuit[]）、plannerNextId counter、新增/刪除迴路 handlers
- [x] 1.3 新增電器指派 handlers（assignAppliance / unassignAppliance），含電壓匹配檢查
- [x] 1.4 新增迴路電壓切換 / NFB 選擇 handlers（切換電壓時自動移除不匹配電器）
- [x] 1.5 新增迴路線材選擇 handler（在 plannerCircuit 上記錄 selectedWire）

## 2. 規劃→模擬轉換

- [x] 2.1 實作 confirmPlanning 函式：PlannerCircuit[] → CircuitConfig[] + circuitWires + circuitAppliances + wiring state 轉換，gamePhase 切到 'wiring'
- [x] 2.2 自由配迴路成本計算（wire + NFB_COSTS[breaker.ratedCurrent]），即時顯示
- [x] 2.3 送電前置條件驗證（所有電器已指派 + 每迴路已選線 + 插槽未超限）
- [x] 2.4 handleRetry / handleBackToLevels 支援 FreeCircuitLevel（重試回到 planning phase）

## 3. UI 元件

- [x] 3.1 建立 RoomPanel 元件：房間列表 + 電器卡片（名稱/功率/電壓/電流）+ 指派狀態（高亮/灰化）+ wetArea 標示 + 點擊指派
- [x] 3.2 建立 CircuitCard 元件：迴路編號/電壓切換/NFB 選擇/已指派電器列表/電流 vs 安全容量指示（綠/黃/紅）/線材選擇下拉/刪除按鈕
- [x] 3.3 建立 CircuitPlanner 元件：整合 RoomPanel + CircuitCard[] + 新增迴路按鈕 + 配電箱摘要（插槽/成本/前置條件）+ 確認配置按鈕
- [x] 3.4 GameBoard render 分支：planning phase 渲染 CircuitPlanner，wiring/simulation phase 渲染既有 UI

## 4. 樣式

- [x] 4.1 使用 /frontend-design 設計 CircuitPlanner / RoomPanel / CircuitCard 的 CSS 樣式，加入 App.css
