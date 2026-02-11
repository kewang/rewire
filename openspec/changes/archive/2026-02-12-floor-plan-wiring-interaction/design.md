## Context

FloorPlanView（change 3）已完成靜態渲染，routing.ts（change 2）已提供 Dijkstra 路由和星形/串聯候選計算。現有 drag-drop-wiring 系統基於 CircuitDiagram 的 SVG 座標偵測 drop zone。此 change 需將接線互動從抽象電路圖擴展到空間平面圖，引入走線策略選擇作為新遊戲機制。

現有 GameBoard 使用 WiringState 集中管理拖曳狀態（isDragging / dragWire / targetCircuitId），CircuitDiagram 透過 SVG 座標計算偵測 row+col → circuitIndex。平面圖模式需用房間（而非迴路）作為 drop zone，並在接線後多一步走線策略選擇。

## Goals / Non-Goals

**Goals:**
- 玩家能拖曳線材到平面圖上的房間，觸發該迴路的接線
- 多房間迴路顯示星形 vs 串聯候選方案，玩家點選確認
- 單房間迴路自動使用 direct 路由，無需額外選擇
- 距離成本即時更新：走線距離 × costPerMeter
- FloorPlanView 的 candidatePaths / connectedPaths 由真實接線狀態驅動
- 與現有 crimp / ELCB / 老屋機制無縫整合

**Non-Goals:**
- 不做手動拖曳走線路徑（v0.9 用自動路由 + 候選選擇）
- 不做 CircuitDiagram 的淘汰（此 change 僅新增平面圖模式，後續 change 5 整合切換）
- 不做配電箱操作整合（change 5 scope）
- 不做關卡定義的 floorPlan 指派（change 7 scope）

## Decisions

### D1：房間作為 drop zone（而非 outlet）

**決定：** 拖曳線材到房間矩形即可觸發接線，不要求精確拖到 outlet 小圓點上。

**理由：** 房間面積大、觸控友善。outlet 僅 r=4 太小。PRD 也說「拖曳線材到平面圖上的目標房間」。outlet 作為視覺標記但不作為 hit target。

**替代方案：** 要求拖到 outlet → 觸控困難、挫折感高，否決。

### D2：房間 → 迴路映射由 circuitAssignments 驅動

**決定：** FloorPlanView 收到 `onRoomClick(roomId)` → GameBoard 查 `circuitAssignments` map 找到該房間所屬 circuitId → 觸發接線流程。

**理由：** circuitAssignments 已是 FloorPlanView 的 prop（change 3 建立），映射關係在 GameBoard 端就可以查。

### D3：走線策略選擇流程

**決定：** 拖曳放置後：
1. 若迴路只有 1 個房間 → 自動 'direct'，直接完成接線
2. 若迴路有 ≥2 個房間 → 顯示 RoutingStrategyPicker overlay（星形 + 串聯卡片），玩家選擇後完成接線
3. 選擇中，FloorPlanView 顯示兩組候選路徑（用 candidatePaths prop）
4. 選擇完成 → candidatePaths 清空、connectedPaths 更新

**理由：** PRD FR-J-E Phase 2 明確描述此流程。overlay 選擇比 inline 更明確，不佔用平面圖空間。

### D4：RoutingStrategyPicker 設計

**決定：** 兩張卡片並排，每張顯示：策略名稱 + 小型示意 SVG icon + 總距離 + 預估成本。底部有「取消」按鈕。點選卡片即確認。

**理由：** 簡潔二選一，不需要額外確認按鈕。示意圖幫助新手理解星形 vs 串聯的差異。

### D5：成本計算整合

**決定：** 新增 `circuitRouteDistances: Record<CircuitId, number>` state。成本計算時：若有 routeDistance 則用 `costPerMeter × routeDistance`，否則 fallback 到 `costPerMeter × DEFAULT_WIRE_LENGTH`。

**理由：** 漸進式整合。此 change 尚未讓所有關卡都有 floorPlan，需要 fallback。change 7 全面升級後才能移除 fallback。

### D6：FloorPlanView 新增 props 而非內部管理狀態

**決定：** hover highlight / drag active / routing strategy picking 等狀態全部由 GameBoard 透過 props 傳入，FloorPlanView 保持純渲染。

**理由：** 一致性：現有 CircuitDiagram 也是 GameBoard 透過 props 控制。單一真相來源。

## Risks / Trade-offs

- **[多房間迴路判定]** 需要在 handleDragEnd 時知道迴路包含哪些房間。→ Mitigation：從 level 定義或 plannerCircuits 中取得迴路房間列表。
- **[策略選擇時機]** crimp mini-game 和策略選擇都在接線流程中，順序需明確。→ Mitigation：先完成走線策略選擇（確定距離→確定成本），再觸發 crimp（如果 requiresCrimp）。走線策略是「選線路」，crimp 是「接端子」，邏輯上選路在前。
- **[觸控拖曳衝突]** 平面圖可能需要 pan/zoom（大房型），與拖曳接線衝突。→ Mitigation：v0.9 不做 pan/zoom，靠 responsive viewBox 縮放。大房型(XL)可能在手機上偏小，可接受。
- **[FloorPlanView 重渲染]** hover 頻繁觸發可能造成效能問題。→ Mitigation：只傳 highlightedRoomId string，用 React.memo + shallow compare 優化。
