## 1. FloorPlanView 互動擴展

- [x] 1.1 FloorPlanView 新增 props：onRoomClick / onRoomHover / highlightedRoomId / dragActive
- [x] 1.2 為每個房間 rect 加入 pointer event handlers（onClick → onRoomClick(roomId)、onPointerEnter/Leave → onRoomHover）
- [x] 1.3 實作 highlightedRoomId + dragActive 的視覺效果（有效目標：迴路色 glow 邊框 + 亮度提升；無效目標：紅色提示）

## 2. GameBoard 走線狀態擴展

- [x] 2.1 新增 state：circuitRoutingStrategies（Record<CircuitId, 'direct'|'star'|'daisy-chain'>）、circuitRouteDistances（Record<CircuitId, number>）、circuitRoutePaths（Record<CircuitId, RoutePath[]>）
- [x] 2.2 新增 state：pendingRoutingCircuit（等待策略選擇的迴路 ID + wire）、candidateRoutes（RouteCandidate[] for RoutingStrategyPicker）
- [x] 2.3 修改 handleDragEnd：平面圖模式下透過 highlightedRoomId → circuitAssignments 查找 circuitId → 判斷單房間/多房間
- [x] 2.4 單房間迴路：自動 direct routing，算距離，直接接線（或觸發 crimp）
- [x] 2.5 多房間迴路：計算 calcRouteCandidates → 設定 pendingRoutingCircuit + candidateRoutes → 顯示 RoutingStrategyPicker
- [x] 2.6 新增 handleSelectRoutingStrategy(strategy)：儲存選擇 → 清空 pending → 接線（或觸發 crimp）
- [x] 2.7 新增 handleCancelRoutingStrategy()：清空 pending + candidateRoutes
- [x] 2.8 重試/重選關卡時清除走線相關 state

## 3. RoutingStrategyPicker 元件

- [x] 3.1 建立 RoutingStrategyPicker.tsx（props：candidates、wire、onSelect、onCancel）
- [x] 3.2 渲染兩張策略卡片：名稱（星形/串聯）+ 距離 + 預估成本 + 示意 icon
- [x] 3.3 加入 i18n 翻譯 key（星形/串聯/距離/成本/取消）
- [x] 3.4 CSS 樣式（overlay 定位、卡片 hover 效果、深色主題一致性）

## 4. 成本計算整合

- [x] 4.1 修改成本計算邏輯：有 circuitRouteDistances 時用 costPerMeter × routeDistance，否則 fallback DEFAULT_WIRE_LENGTH
- [x] 4.2 FloorPlanView connectedPaths 由 circuitWires + circuitRoutePaths 衍生（useMemo）

## 5. 線材替換與 Crimp 整合

- [x] 5.1 替換線材時清除該迴路的 routingStrategy/routeDistance/routePaths，重新觸發策略選擇（多房間）
- [x] 5.2 Crimp 流程整合：策略選擇完成後才觸發 crimp mini-game（若 requiresCrimp）
