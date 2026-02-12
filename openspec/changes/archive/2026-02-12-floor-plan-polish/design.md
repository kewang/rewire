## Context

v0.9 平面圖模式共 8 個核心 changes 已全部完成，功能面齊備（FloorPlanView 渲染、走線互動、模擬視覺、規劃側欄、線材工具列、迴路指派、關卡配置、隨機老屋整合）。

目前的問題：
- fp-layout 缺乏 mobile/tablet 響應式斷點，小螢幕下 sidebar 佔滿空間、FloorPlanView 被擠壓
- CircuitPlannerSidebar 展開/收合無動畫過渡，切換突兀
- WireToolbar 在窄螢幕 6 張卡片溢出
- CircuitAssignmentPopover 無入場動畫、小螢幕 viewport clamping 不完善
- 部分 UI 字串可能尚未抽取至 i18n

## Goals / Non-Goals

**Goals:**
- fp-layout 在 mobile(≤640px) / tablet(641-1024px) / desktop(≥1025px) 三段自適應
- 所有 state transition 有平滑動畫（sidebar、popover、power button）
- 平面圖元件 i18n 零遺漏
- FloorPlanView 在小螢幕可讀可操作

**Non-Goals:**
- 不實作 pinch-to-zoom / 雙指平移（複雜度高，留待 v1.0）
- 不改動模擬引擎或遊戲邏輯
- 不新增功能，僅打磨既有功能的 UI/UX
- 不調整關卡數值（budget/bonusCondition），那屬 playtest 範疇由人工判斷

## Decisions

### D1: 響應式策略 — 純 CSS @media + 既有斷點

沿用專案既有的三段斷點（640px / 1024px），不引入新斷點或容器查詢。fp-layout 在 mobile 轉為垂直堆疊（sidebar 全寬收合條 + FloorPlan 滿版 + WireToolbar 底部固定）。

**替代方案**：CSS Container Queries — 瀏覽器支援已廣，但現有程式碼全用 @media，保持一致性更優先。

### D2: Sidebar mobile 行為 — 預設收合 + overlay 展開

mobile 下 sidebar 預設收合為 48px 窄條（僅顯示展開箭頭）。點擊展開時使用 absolute/overlay 覆蓋在 FloorPlan 上方，不推擠 layout。

**替代方案**：Bottom sheet 彈出 — 實作成本高且與現有 sidebar 元件結構差異大。

### D3: WireToolbar mobile — overflow-x scroll

mobile 下 wire-toolbar-cards 設 overflow-x: auto + scrollbar-width: none，卡片維持 min-width 不壓縮，使用者水平滑動選線材。

### D4: Sidebar 收合 CSS transition

width transition 用 CSS `transition: width 0.25s ease`，搭配 `overflow: hidden` 避免內容溢出。不用 JS 動畫庫。

### D5: Popover 入場動畫

CircuitAssignmentPopover 加 CSS `@keyframes popover-enter`（opacity 0→1 + translateY 8px→0，0.15s ease-out）。

### D6: i18n 審計策略

用 Grep 掃描 FloorPlanView/CircuitPlannerSidebar/WireToolbar/CircuitAssignmentPopover/RoutingStrategyPicker 中的裸字串（非 t() 包裹的中文/英文文字），逐一抽取到 i18n keys。

## Risks / Trade-offs

- **[Sidebar overlay 遮蓋]** → 加半透明背景 backdrop，點擊 backdrop 收合 sidebar
- **[WireToolbar 水平滾動不明顯]** → 加 scroll-snap 或漸層遮罩提示可滾動
- **[CSS transition 造成 layout shift]** → 使用 will-change: width 提示瀏覽器，且 transition 期間不動態計算依賴 sidebar 寬度的值
