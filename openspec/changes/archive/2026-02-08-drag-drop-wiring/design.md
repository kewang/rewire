## Context

目前 v0.2 的線材選擇為點選 WireSelector 卡片即時切換，CircuitDiagram 顯示固定的 NFB → 接點 → 插座線段。玩家無法體驗「接線」操作，選線徑缺乏物理感。

現有架構：
- `WireSelector` 為卡片列表，onClick 直接更新 `selectedWire` state
- `CircuitDiagram` 為純顯示元件，接收 `SimulationState` 渲染 SVG
- `GameBoard` 管理所有狀態，送電條件僅檢查 `pluggedAppliances.length > 0`
- 單一迴路（1 NFB + 1 Wire + N Appliance），線材為全域單一選擇

## Goals / Non-Goals

**Goals:**
- 玩家能從線材捲拖曳線段，連接 NFB 到插座，獲得「接線」操作感
- 拖曳過程中即時顯示 SVG 線段預覽（虛線跟隨游標）
- 接線完成後線段固定顯示，可替換（拖入新線材覆蓋舊的）
- 未接線時 NFB 開關禁用，強制「先接線再送電」流程
- 同時支援滑鼠（desktop）和觸控（mobile/tablet）

**Non-Goals:**
- 不實作多迴路 / 多 NFB（FR-B，獨立 change）
- 不實作自由路徑繪製（線段路徑固定為 NFB → 接點 → 插座的直線）
- 不實作 110V / 220V 區分（FR-C）
- 不實作 NFB 撥桿互動（FR-D）

## Decisions

### D1：使用 Pointer Events 而非 HTML5 Drag & Drop API

**選擇**：Pointer Events（pointerdown/pointermove/pointerup）

**替代方案**：HTML5 Drag & Drop API
- 優點：原生拖曳圖示、跨元素 dragenter/dragleave
- 缺點：觸控支援差、無法自訂拖曳外觀、SVG 內 drop target 不好做

**理由**：
- Pointer Events 統一處理滑鼠 + 觸控 + 觸控筆
- 可完全控制拖曳預覽的 SVG 渲染（虛線跟隨游標）
- CircuitDiagram 已是 SVG，pointer events 直接在 SVG 座標系內計算
- 不需外部依賴

### D2：拖曳狀態管理在 GameBoard 層級

**選擇**：在 GameBoard 新增 `wiringState` 管理拖曳生命週期

**理由**：
- GameBoard 已是所有遊戲狀態的中心（wire、appliance、sim state）
- 拖曳涉及 WireSelector（來源）和 CircuitDiagram（目標）的跨元件協調
- 需在拖曳完成後更新 `selectedWire` + `isWired` 狀態

**狀態模型**：
```typescript
interface WiringState {
  isDragging: boolean;       // 是否正在拖曳
  dragWire: Wire | null;     // 正在拖曳的線材
  cursorPos: { x: number; y: number } | null;  // SVG 座標系中的游標位置
  isWired: boolean;          // 是否已完成接線
  connectedWire: Wire | null; // 已連接的線材
}
```

### D3：接線判定為「拖曳線材到 CircuitDiagram 的插座區域」

**選擇**：單步驟接線 — 從線材捲拖曳到 CircuitDiagram 任意位置即視為接線完成

**替代方案**：兩步驟接線（先拖到 NFB 端、再拖到插座端）
- 優點：更擬真
- 缺點：操作繁瑣，手機上尤其困難，對遊戲節奏有負面影響

**理由**：
- 目前為單一迴路，NFB 到插座的路徑固定，兩步驟無增加策略深度
- 未來多迴路時再考慮更複雜的接線邏輯
- 操作簡潔，保留「拖曳」的滿足感同時不增加冗餘步驟

### D4：SVG 預覽線段與接點高亮

**選擇**：拖曳中在 CircuitDiagram SVG 內渲染：
- 虛線路徑：從 NFB 底部沿固定路徑到游標位置
- 接點高亮：插座區域在拖曳靠近時顯示發光邊框
- 放置動畫：接線成功時線段從虛線變實線 + 閃光

**理由**：
- SVG 內渲染確保視覺一致性，不需處理 HTML/SVG 座標轉換
- 虛線到實線的轉變提供清晰的操作回饋

### D5：觸控裝置的拖曳體驗

**選擇**：
- 長按 150ms 線材卡片啟動拖曳（避免與捲動衝突）
- 拖曳中抑制頁面捲動（touch-action: none）
- 拖曳預覽跟隨手指位置
- 放開手指在有效區域即接線

**理由**：
- 手機上直接拖曳容易與捲動衝突，長按閾值區分意圖
- 150ms 夠短不影響操作感，夠長避免誤觸

## Risks / Trade-offs

- **[觸控精度]** 手機螢幕小，拖曳到精確位置可能困難 → 放寬接線判定區域（整個 CircuitDiagram SVG 區域都算有效 drop zone）
- **[效能]** pointermove 每幀觸發 state 更新可能影響效能 → 使用 useRef 存游標位置，只在 rAF 中讀取渲染，不觸發 React re-render
- **[可發現性]** 新玩家可能不知道要拖曳 → 未接線時在 CircuitDiagram 顯示提示文字「拖曳線材到此處接線」
- **[既有 UX 改變]** 移除點選即切換的便利性 → 接受此 trade-off，拖曳操作的沉浸感更符合遊戲定位
