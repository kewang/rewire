## 1. FloorPlanView 型別與 Props 擴充

- [x] 1.1 定義 `FloorPlanSimulationState` 介面（isPowered, circuitStates, mainTripped）於 FloorPlanView.tsx 或 types/floorPlan.ts
- [x] 1.2 擴充 `FloorPlanViewProps`：新增 `simulationState?`, `problemRooms?`, `roomCircuitMap?` 三個 optional props
- [x] 1.3 確認新 props 為 optional，不傳時行為與先前完全一致（backward compat）

## 2. 房間模擬狀態視覺

- [x] 2.1 實作房間 powered-normal 效果：送電中 + status=normal 的房間顯示暖色 glow（SVG filter 或 fill 亮度提升）
- [x] 2.2 實作房間 warning 效果：wireHeat >= 0.3 的迴路房間邊框橘色脈動動畫
- [x] 2.3 實作房間 tripped/elcb-tripped 效果：房間 opacity 降至 0.3（暗掉）
- [x] 2.4 實作房間 burned/leakage 效果：房間紅色脈動閃爍動畫
- [x] 2.5 實作 mainTripped 效果：所有房間統一暗掉（opacity 0.3）
- [x] 2.6 新增相關 CSS keyframes（`fp-room-warning-pulse`, `fp-room-burned-flash`）到 App.css

## 3. 走線路徑模擬狀態色

- [x] 3.1 實作路徑 wireHeat → 顏色映射函式（< 0.3 原色 / 0.3-0.7 橘漸變 / ≥ 0.7 紅漸變）
- [x] 3.2 實作路徑 burned 狀態：紅色 + opacity 0.2
- [x] 3.3 實作路徑 tripped/elcb-tripped 狀態：灰色(#6b7280) + opacity 0.3
- [x] 3.4 為路徑 stroke/opacity 加上 CSS transition（0.3s ease）

## 4. 電流流動動畫

- [x] 4.1 在 FloorPlanView 中新增 current-flow animation layer：每條 connectedPath 複製一份 overlay path
- [x] 4.2 設定 overlay path 樣式：stroke=rgba(200,230,255,0.6), strokeDasharray="6 20"
- [x] 4.3 新增 CSS `@keyframes fp-current-flow` 動畫（strokeDashoffset 循環）
- [x] 4.4 動畫僅在 isPowered=true 且迴路 status 為 normal/warning 時顯示
- [x] 4.5 迴路 tripped/burned/mainTripped 時 animation layer opacity → 0（fade out）

## 5. 老屋問題房間指示

- [x] 5.1 實作 ⚠️ badge 渲染：在 problemRooms 中的房間右上角顯示 ⚠️ SVG text
- [x] 5.2 實作 badge 橘色閃爍動畫（reuse 或新建 keyframes）
- [x] 5.3 實作 hover tooltip 顯示問題類型描述（用 `<title>` SVG 元素或 CSS tooltip）
- [x] 5.4 確認問題修復後 badge 自動消失（problemRooms 更新即可）

## 6. 送電按鈕（底部工具列）

- [x] 6.1 在 GameBoard 中新增平面圖模式送電按鈕（條件渲染：`currentFloorPlan` 存在時）
- [x] 6.2 按鈕樣式：未送電「⚡ 送電」/ 已送電「⏹ 斷電」，與工具列主題一致
- [x] 6.3 disabled 條件：綁定現有 `canPowerOn` 邏輯
- [x] 6.4 點擊事件：呼叫現有 `handlePowerToggle()`
- [x] 6.5 為按鈕加上 i18n 翻譯 key（power.on / power.off）並更新 6 語翻譯檔
- [x] 6.6 按鈕 disabled 時顯示 tooltip 說明缺少什麼條件

## 7. GameBoard 狀態傳遞

- [x] 7.1 在 GameBoard 中計算 `floorPlanSimulationState` memo（從 multiState 萃取 isPowered + circuitStates + mainTripped）
- [x] 7.2 在 GameBoard 中計算 `problemRooms` memo（從 problemCircuits + roomToCircuitMap 推導）
- [x] 7.3 將 simulationState / problemRooms / roomCircuitMap 三個 props 傳入 FloorPlanView
- [x] 7.4 確認 CircuitDiagram 路徑不受影響（條件渲染隔離）

## 8. 整合測試與驗證

- [x] 8.1 npm run build 無 TypeScript 錯誤
- [x] 8.2 npm run lint 無 ESLint 錯誤（pre-existing setProblemCircuits warning 與本次變更無關）
- [x] 8.3 手動驗證：無 floorPlan 的關卡（如 L01-L05）行為不變（回歸測試）— CircuitDiagram 路徑完全隔離，條件渲染
- [x] 8.4 手動驗證：FloorPlanPreview 頁面渲染正常（不傳 simulationState 時無動畫效果）— 所有新 props 為 optional
