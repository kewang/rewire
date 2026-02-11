## Context

v0.9 平面圖模式的核心視覺元件。前兩個 change 已完成資料模型（`FloorPlan` 型別 + 4 種預設房型）和路由引擎（Dijkstra + 星形/串聯候選），現在需要 SVG 渲染層將這些資料視覺化。

目前遊戲的線路圖使用 `CircuitDiagram.tsx`（抽象電路圖），v0.9 要新增 `FloorPlanView.tsx` 作為平面圖視圖。此 change 只負責「靜態渲染 + 基本視覺互動」，不含接線拖曳邏輯和 GameBoard 整合（那些是後續 change）。

## Goals / Non-Goals

**Goals:**
- 渲染 FloorPlan 為 SVG 平面圖（房間色塊 + 名稱 + 插座標記 + 配電箱圖示）
- 渲染走線路徑（候選路徑虛線 + 已接路徑實線 + 線徑顏色）
- 路徑距離標籤顯示
- 潮濕區域視覺標記（水滴圖示 + 淺藍色調）
- 房間依迴路分配狀態著色（未指派 / 已指派迴路色邊框）
- 配電箱可點擊（onPanelClick 回調）
- 響應式 SVG（viewBox 自適應容器）
- i18n 房間名稱
- 支援所有 4 種房型（S/M/L/XL）

**Non-Goals:**
- 接線拖曳互動邏輯（floor-plan-wiring-interaction）
- GameBoard 狀態整合、送電動畫（floor-plan-game-integration）
- CircuitPlanner 整合（floor-plan-planner）
- 老屋問題視覺（floor-plan-levels 或後續）
- PanelInteriorView overlay（已存在，本 change 僅觸發 onPanelClick）

## Decisions

### D1: 單檔元件 vs 多檔拆分

**選擇**: 單檔 `FloorPlanView.tsx`，內含子元件函式（RoomRect, PanelIcon, WiringPath）

**理由**: 平面圖渲染的子元件彼此高度耦合（共享座標系統、cellSize、FloorPlan context），拆成多檔增加 import 開銷但沒有明顯的獨立復用場景。參照 `CircuitDiagram.tsx` 將 `SingleCircuitSVG` 作為同檔子元件的成功先例。若未來複雜度成長再拆分。

### D2: SVG 座標系統

**選擇**: grid 座標 × cellSize 轉 pixel，cellSize = 80px

**理由**:
- FloorPlan 資料使用 grid 座標（0~width, 0~height），需要固定的 pixel 轉換比率
- cellSize=80px 讓最小房型 S（4×4）= 320×320px，最大 XL（10×6）= 800×480px，都在合理螢幕範圍
- viewBox 設為 `0 0 {width*cellSize} {height*cellSize}`，外層 SVG width="100%" 自適應容器
- 外牆留 padding（WALL_PADDING=4px），房間間隙用 ROOM_GAP=3px 製造牆壁感

### D3: 房間著色策略

**選擇**: Props 驅動的迴路色映射

**理由**:
- 元件接收 `circuitAssignments: Map<string, { circuitIndex: number; color: string }>` props（roomId → 迴路資訊）
- 未指派房間：暗色填充 `#1a1f2e` + 灰色虛線邊框
- 已指派房間：略淺填充 + 迴路色實線邊框
- 迴路色由父元件計算（一致性），渲染器只負責繪製
- 迴路顏色調色盤：8 色循環（取自既有 CircuitDiagram 的 circuit tab 顏色）

### D4: 走線路徑渲染

**選擇**: SVG polyline + RoutingGraph 節點座標繪製路徑

**理由**:
- RoutePath.nodeIds 包含有序節點 ID，對照 RoutingGraph.nodes 取座標
- 候選路徑：半透明虛線 `strokeDasharray="6 4"` + opacity=0.4 + 距離文字標籤
- 已選路徑：實線 + 線徑對應顏色（wireGaugeColor）+ opacity=0.8
- 路徑繪製為 `<polyline>` 沿牆角節點連線
- 兩組 props：`candidatePaths` 和 `connectedPaths` 分開控制

### D5: 配電箱渲染

**選擇**: SVG rect + 閃電圖示 + hover glow + click handler

**理由**:
- 配電箱位置來自 `FloorPlan.panel`（grid 座標）
- 渲染為小方塊 + ⚡ emoji 文字
- hover 時加 SVG filter（drop-shadow glow）提供視覺回饋
- 點擊觸發 `onPanelClick` prop 回調（父元件決定開啟 PanelInteriorView）

### D6: 插座視覺

**選擇**: 小圓形標記在房間內

**理由**:
- FloorPlanOutlet 位置為相對於房間的比例座標（0~1）
- 轉換為 pixel 座標：`room.x * cellSize + outlet.x * room.width * cellSize`
- 渲染為小圓形 r=4，填充 #4a5568（未接線）或迴路色（已接線）
- 未來 wiring-interaction change 會加上拖曳 drop zone

### D7: 距離標籤

**選擇**: 路徑中點的 SVG text 標籤

**理由**:
- 候選路徑需顯示距離（如 "5.2m"）供玩家比較選擇
- 位置在路徑最長線段的中點，避免重疊
- 背景用半透明黑色 rect 確保可讀性
- 已選路徑不需距離標籤（已確定）

## Risks / Trade-offs

- **[SVG 性能]** XL 房型 12 個房間 + 多條路徑 → SVG 節點數可能偏多。**緩解**: 平面圖比 CircuitDiagram 簡單得多（無動畫粒子），<100 個 SVG 元素完全沒問題
- **[cellSize 固定]** 不同螢幕尺寸下 cellSize=80 可能太大或太小。**緩解**: 用 viewBox 讓 SVG 自適應容器寬度，實際渲染大小由容器決定
- **[走線路徑重疊]** 多條路徑共用同一牆段時視覺重疊。**緩解**: 對共用段做小幅偏移（±2px），用不同迴路色區分
- **[i18n 文字長度]** 不同語言房間名長度差異。**緩解**: 用 SVG text + textAnchor="middle"，過長截斷
