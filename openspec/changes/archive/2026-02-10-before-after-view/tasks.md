## 1. 資料結構與快照機制

- [x] 1.1 在 game.ts 定義 CircuitSnapshot 和 OldHouseSnapshot 介面
- [x] 1.2 在 GameBoard 新增 `oldHouseSnapshotRef = useRef<OldHouseSnapshot | null>(null)`
- [x] 1.3 在 handleSelectLevel 的老屋初始化流程尾部，擷取 OldHouseSnapshot（從已初始化的 state 建構 snapshot）
- [x] 1.4 非老屋關卡和 retry 時正確處理 snapshot（非老屋設 null、retry 重新擷取）

## 2. BeforeAfterView 元件

- [x] 2.1 建立 `src/components/BeforeAfterView.tsx`，定義 props 介面（snapshot、currentWires、currentBreakers、currentElcb、circuitConfigs）
- [x] 2.2 實作修復摘要生成函式：遍歷 snapshot.problems，依問題類型生成 before 描述和 after 修復描述
- [x] 2.3 實作 Before 面板：「修復前」標題 + 問題列表（紅色 ⚠️ + 迴路名稱 + 問題描述 + 舊狀態值）
- [x] 2.4 實作 After 面板：「修復後」標題 + 修復列表（綠色 ✓ + 迴路名稱 + 修復方式描述）
- [x] 2.5 實作響應式 CSS Grid 佈局（>640px 兩欄並排、≤640px 單欄堆疊）
- [x] 2.6 實作入場動畫（整體 fadeIn + After 側 ✓ 逐項 popIn + staggered delay）
- [x] 2.7 套用工業深色主題 CSS variables，Before 紅色系 / After 綠色系邊框

## 3. ResultPanel 整合

- [x] 3.1 擴充 ResultPanelProps：新增 oldHouseSnapshot? 和修復狀態相關 props（circuitConfigs、currentWires、currentBreakers、currentElcb）
- [x] 3.2 在 ResultPanel 的 won/over-budget 區塊中，result-details 之後、result-actions 之前渲染 BeforeAfterView（條件：snapshot 存在）
- [x] 3.3 GameBoard 傳遞 snapshot 和當前修復狀態給 ResultPanel

## 4. 驗證與測試

- [x] 4.1 驗證 L18-L20 老屋關卡通關後顯示 Before/After 對比
- [x] 4.2 驗證 L24-L25 新老屋問題（overrated-breaker / missing-elcb）的摘要文字正確
- [x] 4.3 驗證非老屋關卡（L01-L17, L21-L23）不顯示 BeforeAfterView
- [x] 4.4 驗證失敗（tripped/burned/leakage）時不顯示 BeforeAfterView
- [x] 4.5 驗證響應式佈局（桌面並排 / 手機堆疊）
- [x] 4.6 驗證動畫效果（fadeIn + popIn）
