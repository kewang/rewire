## Context

FloorPlanView 已完成靜態渲染（Change 3）與接線互動（Change 4），GameBoard 也已有條件渲染邏輯（`currentFloorPlan ? FloorPlanView : CircuitDiagram`）。但目前平面圖模式下：
- 送電後看不到模擬狀態回饋（房間/路徑無變化）
- PanelInteriorView overlay 已連接（`showRoutingOverlay`），但送電按鈕仍在 CircuitDiagram SVG 內的 NFB lever
- 老屋問題迴路在平面圖上無 ⚠️ 指示

現有架構：GameBoard rAF loop 驅動 stepMulti → multiState 含各迴路的 CircuitState（status/wireHeat/totalCurrent）。CircuitDiagram 直接讀取這些狀態做視覺更新。FloorPlanView 需要接收相同資訊。

## Goals / Non-Goals

**Goals:**
- FloorPlanView 接收並呈現模擬狀態（房間亮度/路徑顏色/問題指示）
- 送電動畫：電流流動亮點沿走線路徑移動
- 平面圖模式下的送電控制（底部工具列按鈕，非 SVG 內 lever）
- 老屋問題在平面圖房間上顯示 ⚠️
- FloorPlanView 成為平面圖關卡的完整遊戲主視圖

**Non-Goals:**
- 不重構 CircuitDiagram（保持向後相容，無 floorPlan 的關卡仍用）
- 不做平面圖上的迴路規劃互動（Change 6: floor-plan-planner）
- 不做關卡 floorPlan 分配與 budget 重新校準（Change 7: floor-plan-levels）
- 不做送電動畫的精緻微調（Change 9: floor-plan-polish）
- 不做 3D 效果或粒子系統
- 不做響應式佈局大改（Change 9）

## Decisions

### D1: 模擬狀態傳遞方式 — Props 注入（非 context）

FloorPlanView 新增 `simulationState` prop，型別為：
```typescript
interface FloorPlanSimulationState {
  isPowered: boolean;
  circuitStates: Record<CircuitId, {
    status: SimulationStatus;
    wireHeat: number;      // 0-1
    totalCurrent: number;
  }>;
  mainTripped: boolean;
}
```

**理由**：保持 FloorPlanView 為純展示元件，不依賴 context。GameBoard 已掌握所有 multiState 資料，組裝一個 prop 物件傳下去即可。

**替代方案**：React Context → 過度設計，只有一個消費者。

### D2: 房間狀態映射 — 由迴路狀態推導

每個房間的視覺狀態由其所屬迴路的 SimulationStatus 決定：
- `normal` → 房間 glow 亮起（淡暖色光暈）
- `warning` → 房間邊框橘色脈動
- `tripped` / `elcb-tripped` → 房間暗掉（降低 opacity 至 0.3）
- `burned` / `leakage` → 房間閃紅（紅色脈動動畫）
- `main-tripped` → 所有房間暗掉
- 未送電 → 維持原有狀態（assigned/unassigned 顏色）

FloorPlanView 內部用 `roomToCircuitMap` + `circuitStates` 推導每個房間的狀態，不需外部預計算。

### D3: 走線路徑狀態色 — 基於 wireHeat 連續漸變

走線路徑顏色在送電後依 wireHeat 連續變化：
- wireHeat < 0.3 → 原線徑色（正常）
- 0.3 ≤ wireHeat < 0.7 → 原色 → 橘色漸變（warning）
- wireHeat ≥ 0.7 → 橘色 → 紅色漸變（danger）
- status=burned → 路徑 opacity 降至 0.2 + 紅色（熄滅感）
- status=tripped/elcb-tripped → 路徑 opacity 降至 0.3 + 灰色

用 CSS `transition: stroke 0.3s, opacity 0.3s` 確保過渡順暢。wireHeat 值透過 `simulationState.circuitStates[id].wireHeat` 取得。

### D4: 電流流動動畫 — SVG strokeDashoffset 動畫

送電後在每條已接線路徑上疊加一層「電流流動」效果：
- 複製一份路徑 `<path>` 作為動畫層
- stroke = 明亮的淡藍/白色（`rgba(200, 230, 255, 0.6)`）
- strokeDasharray = "6 20"（短亮點 + 長間隔）
- CSS `@keyframes current-flow { to { stroke-dashoffset: -26; } }` 迴圈播放
- animation-duration 依路徑長度縮放（pathLength / 100 秒，最短 1s 最長 4s）
- tripped/burned 時停止動畫（opacity → 0）

**理由**：純 CSS 動畫性能好，不需 JS rAF 驅動額外動畫。SVG strokeDashoffset 是成熟的「沿路徑移動」技巧。

**替代方案**：Canvas overlay → 與 SVG 混合增加複雜度。JS 驅動粒子 → 效能負擔大。

### D5: 送電按鈕 — 底部工具列整合

平面圖模式下，送電按鈕放在底部工具列（線材選擇區旁），而非 SVG 內 lever：
- 按鈕外觀：「⚡ 送電」文字按鈕，與工具列風格一致
- disabled 條件：與現有 `canPowerOn` 完全一致（isWired + problems resolved + routing done 等）
- 點擊 → 觸發 `handlePowerToggle()`（同 NFB lever 邏輯）
- 送電後按鈕變為「⏹ 斷電」

**理由**：平面圖上沒有 CircuitDiagram 的 NFB lever SVG，需要替代控制。底部工具列是最自然的位置。

### D6: 老屋問題指示 — 房間 ⚠️ badge

問題迴路的房間顯示浮動 ⚠️ badge：
- 位置：房間右上角
- 橘色閃爍動畫（reuse 現有 `@keyframes problem-flash`）
- hover/點擊顯示問題類型 tooltip（bare-wire / wrong-wire-gauge / oxidized-splice / overrated-breaker / missing-elcb）
- 問題修復後 ⚠️ 消失

FloorPlanView 新增 `problemRooms` prop：`Map<roomId, OldHouseProblemType[]>`，由 GameBoard 從 `problemCircuits` + `roomToCircuitMap` 計算。

### D7: FloorPlanView 模擬狀態依賴 roomToCircuitMap

FloorPlanView 不需要知道「哪個房間屬於哪個迴路」— 這個映射已在 GameBoard 中計算。新增 `roomCircuitMap` prop（`Record<roomId, CircuitId>`）讓 FloorPlanView 可以查找每個房間的迴路狀態。

**替代方案**：FloorPlanView 內部從 circuitAssignments 反推 → 但 circuitAssignments 用的是 circuitIndex（顯示用），不是 CircuitId（狀態查找用）。分開傳遞更清晰。

## Risks / Trade-offs

1. **效能風險：大量 SVG 動畫** — XL 房型（10×6）最多 8 條走線路徑同時動畫。
   → 緩解：用 CSS animation 而非 JS 驅動，瀏覽器可 GPU 加速 SVG 動畫。若卡頓可降級為靜態色變。

2. **視覺複雜度** — 房間亮/暗 + 路徑變色 + 電流流動同時呈現可能過於雜亂。
   → 緩解：電流流動效果保持低 opacity（0.4-0.6），不搶房間/路徑的視覺主導權。Change 9 可進一步微調。

3. **CircuitDiagram 回歸** — 新增平面圖送電按鈕不應影響 CircuitDiagram 的 lever 功能。
   → 緩解：送電按鈕為條件渲染（僅 `currentFloorPlan` 時顯示），CircuitDiagram 路徑完全不變。

4. **roomToCircuitMap 重複計算** — GameBoard 已計算一次，FloorPlanView 不該重複。
   → 緩解：由 GameBoard 傳入 `roomCircuitMap` prop，避免重複。
