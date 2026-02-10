## Context

老屋驚魂模式（L18-L20, L24-L25）讓玩家診斷並修復預接線迴路的問題。目前通關後 ResultPanel 僅顯示成績，缺乏「修復前 vs 修復後」的視覺回饋。PRD v0.8 FR-I-C 要求新增 Before/After 對比視圖。

現有架構：
- GameBoard 在 `handleSelectLevel` 中初始化老屋預接線狀態（line 586-642）
- `problemCircuits` Set 追蹤未修復問題
- `isProblemResolved()` 純函式判定各問題修復狀態
- ResultPanel 為 inline 元件，通關/失敗時顯示於遊戲板下方

## Goals / Non-Goals

**Goals:**
- 進入老屋關卡時自動擷取 Before 快照（問題清單 + 各迴路 wire/crimp/breaker/elcb）
- 通關後在 ResultPanel 下方顯示 BeforeAfterView，呈現修復前後對比
- 每個修復的問題生成摘要文字（如「✓ c1 廚房：更換 NFB 30A → 20A」）
- 響應式佈局：桌面左右並排、手機上下堆疊
- 過渡動畫：opacity transition + 問題圖示 fade out + ✓ pop in

**Non-Goals:**
- 不做可拖曳的中間分割線滑桿（PRD 標示「可選」，保持簡潔）
- 不做持久化（快照僅存於 state，關閉關卡即消失）
- 不做非老屋關卡的 Before/After
- 不做 SVG 電路圖的完整重現（用文字+圖示摘要取代）

## Decisions

### D1：快照資料結構

**選擇**：定義 `OldHouseSnapshot` 介面，per-circuit 記錄 wire/breaker/crimpQuality/elcbEnabled + 全域 problems 陣列。

```typescript
interface CircuitSnapshot {
  wire: Wire;
  breaker: Breaker;
  crimpQuality: CrimpQuality;
  elcbEnabled: boolean;
  appliances: readonly Appliance[];
}

interface OldHouseSnapshot {
  problems: readonly OldHouseProblem[];
  circuits: Record<CircuitId, CircuitSnapshot>;
}
```

**理由**：只擷取與修復相關的欄位，不需完整 clone 整個 GameBoard state。structure 足夠生成摘要文字和 Before/After 比對。

**替代方案**：deep clone 全部 GameBoard state → 太重且多數欄位用不到。

### D2：快照擷取時機

**選擇**：在 `handleSelectLevel` 中，老屋初始化完成後立即建立快照，存入 `useRef<OldHouseSnapshot | null>`。

**理由**：
- 使用 `useRef` 而非 `useState`，因為快照建立後不再變動，不需觸發 re-render
- 在初始化流程的尾部擷取，確保 preWiredCircuits 已完全展開

**替代方案**：從 `Level.oldHouse.preWiredCircuits` 直接推導 → 可行但需額外計算 ELCB 初始狀態和 breaker 解析，不如直接在初始化時快照。

### D3：BeforeAfterView 元件位置

**選擇**：作為 ResultPanel 的子元件（props 傳入），在通關結果區塊下方渲染。

**理由**：
- 與 PRD 一致（「ResultPanel 下方新增區塊」）
- BeforeAfterView 只在 `result === 'won' || result === 'over-budget'` 時顯示
- 避免 GameBoard JSX 過度膨脹

**具體做法**：GameBoard 傳遞 `oldHouseSnapshot` + 當前 `circuitWires/circuitBreakers/circuitElcb/circuitCrimps` + `circuitConfigs` 給 ResultPanel，ResultPanel 內部渲染 BeforeAfterView。

### D4：修復摘要文字生成

**選擇**：純函式 `generateRepairSummary(snapshot, currentState, configs)` 放在 BeforeAfterView 內部。

**邏輯**：遍歷 `snapshot.problems`，依問題類型生成描述：
- `bare-wire` / `oxidized-splice`：「拆除{問題描述}，重新接線 + 壓接」
- `wrong-wire-gauge`：「更換線材 {舊}mm² → {新}mm²」
- `overrated-breaker`：「更換 NFB {舊}A → {新}A」
- `missing-elcb`：「安裝漏電斷路器（ELCB）」

### D5：響應式佈局

**選擇**：CSS Grid + `@media` 斷點切換。

- 桌面（>640px）：`grid-template-columns: 1fr 1fr`，Before 左 / After 右
- 手機（≤640px）：`grid-template-columns: 1fr`，Before 上 / After 下

與現有 responsive-layout 斷點一致（640px）。

### D6：動畫策略

**選擇**：CSS-only 動畫，使用 `@keyframes` + `animation-delay` 實現入場效果。

- BeforeAfterView 整體：`fadeIn` opacity 0→1，duration 0.5s
- Before 側問題項目：紅色高亮靜態顯示
- After 側修復項目：`popIn` scale(0.8)→scale(1) + opacity，staggered delay（每項 +0.15s）

**理由**：CSS-only 無需額外依賴，效能好，與現有動畫風格一致。

## Risks / Trade-offs

- **[Risk] 快照與實際初始狀態不一致** → Mitigation：快照在初始化流程最後執行，確保已完成所有 setState
- **[Risk] useRef 快照在 retry 時未清除** → Mitigation：handleRetry 重新觸發 handleSelectLevel，快照會被覆寫
- **[Trade-off] 文字摘要 vs SVG 重現** → 選擇文字摘要，實作簡單且資訊密度更高。SVG 重現需要大量程式碼但視覺衝擊有限
- **[Trade-off] 僅通關時顯示** → 失敗時不顯示 Before/After（失敗代表修復可能不完整，對比意義不大）
