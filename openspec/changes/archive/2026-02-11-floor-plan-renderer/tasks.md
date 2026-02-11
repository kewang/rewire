## 1. FloorPlanView 元件骨架與座標系統

- [x] 1.1 建立 `src/components/FloorPlanView.tsx`，定義 Props 介面（floorPlan, circuitAssignments, candidatePaths, connectedPaths, onPanelClick），設定 SVG viewBox 響應式渲染（cellSize=80, ROOM_GAP=3, WALL_PADDING=4）
- [x] 1.2 實作 grid→pixel 座標轉換 helper 函式（gridToPixel, outletToPixel），處理 room gap 和 wall padding 的偏移

## 2. 房間渲染

- [x] 2.1 實作 RoomRect 子元件：渲染房間為 SVG `<rect rx="4">`，支援未指派（暗色 #1a1f2e + 灰色虛線邊框）和已指派（迴路色邊框 + 淺色填充）兩種狀態
- [x] 2.2 實作房間名稱 SVG text（使用 tRoomName i18n helper，textAnchor="middle" 置中）
- [x] 2.3 實作潮濕區域標記（wetArea 房間加 💧 emoji + 淺藍 tint rgba(59,130,246,0.08)）
- [x] 2.4 實作外牆邊框渲染（WALL_THICKNESS=5px，深色 #1e293b 外圍 rect）

## 3. 插座與配電箱渲染

- [x] 3.1 實作插座圓形標記（r=4，根據 FloorPlanOutlet 比例座標計算 pixel 位置，未接線灰色/已接線迴路色）
- [x] 3.2 實作配電箱圖示（rect + ⚡ text，hover glow filter，onClick 觸發 onPanelClick 回調）

## 4. 走線路徑渲染

- [x] 4.1 實作 nodeIds→pixel polyline 點陣列轉換（查詢 RoutingGraph.nodes 取座標 → gridToPixel）
- [x] 4.2 實作候選路徑渲染（半透明虛線 polyline，opacity=0.4，strokeDasharray="6 4"）
- [x] 4.3 實作已選路徑渲染（實線 polyline，opacity=0.8，wireGaugeColor 線徑色）
- [x] 4.4 實作路徑距離標籤（候選路徑中點顯示 "X.Xm" text + 半透明背景 rect）
- [x] 4.5 實作多路徑共用牆段偏移（同一 edge 的多條路徑 ±2px 偏移避免重疊）

## 5. 迴路色調色盤與樣式

- [x] 5.1 定義 8 色迴路調色盤常數（CIRCUIT_COLORS），與既有 CircuitDiagram circuit-tab 顏色一致
- [x] 5.2 新增 FloorPlanView 相關 CSS 樣式至 `src/App.css`（hover 效果、glow filter、過渡動畫）

## 6. 整合驗證

- [x] 6.1 在 App.tsx 或臨時測試頁面中渲染 FloorPlanView，載入 FLOOR_PLAN_S/M/L/XL 四種房型驗證視覺正確性
- [x] 6.2 驗證 i18n 房間名稱在 6 語系下正確顯示
- [x] 6.3 驗證響應式：桌面版（寬容器）和手機版（窄容器 <640px）的 SVG 自動縮放
