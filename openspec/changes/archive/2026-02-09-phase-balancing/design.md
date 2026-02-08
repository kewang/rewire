## Context

v0.4 FR-E 引入台灣住宅單相三線制：紅相(R-N) 110V、黑相(T-N) 110V、跨相(R-T) 220V。中性線承載兩相不平衡的差額電流，過載會燒毀。FR-G 已完成材料擴充（10 種電器、6 種線材、NFB 多規格），提供足夠內容支撐相位平衡關卡。

現有架構：
- `CircuitConfig` 有 `voltage: 110 | 220`，但無相位資訊
- `MultiCircuitState` 只追蹤 per-circuit `CircuitState` + `elapsed` + `overallStatus`
- `stepMulti()` 迭代各迴路獨立 `step()`，無跨迴路計算
- `GameBoard.tsx` 管理 per-circuit 狀態（wires, appliances, elcb）
- `StatusDisplay.tsx` 顯示迴路摘要，`ResultPanel.tsx` 顯示失敗原因

## Goals / Non-Goals

**Goals:**
- CircuitConfig 新增 `phase?: 'R' | 'T'`（110V 迴路的相位，220V 跨相不需要）
- Level 新增 `phaseMode?: 'auto' | 'manual'`（控制玩家是否可切換相位）
- MultiCircuitState 新增 `neutralCurrent`（中性線電流）和 `neutralHeat`（中性線熱度）
- stepMulti() 計算中性線電流 `I_N = |Σ I_R − Σ I_T|` 並執行熱度步進
- 新失敗類型 `neutral-burned` 加入 overallStatus 判定
- 相位平衡指示器 UI：紅相/黑相電流、中性線電流與狀態視覺化
- 手動模式：GameBoard 管理 per-circuit phase override，CircuitDiagram 顯示 R/T 切換按鈕
- L11（自動分配入門）和 L12（手動分配進階）

**Non-Goals:**
- 三相電（只做住宅單相三線制）
- 中性線線材選擇（固定 30A）
- ELCB 漏電機制（屬於 FR-F）

## Decisions

### 1. 中性線狀態存放位置：MultiCircuitState 頂層

中性線是跨迴路的共用資源，不屬於任何單一迴路。新增兩個頂層欄位：

```ts
interface MultiCircuitState {
  // ...existing
  readonly neutralCurrent: number;  // |Σ I_R − Σ I_T|
  readonly neutralHeat: number;     // 0.0 ~ 1.0
}
```

初始值皆為 0。舊關卡（無相位）neutralCurrent 恆為 0，不影響。

**替代方案**：獨立 `NeutralState` 物件 — 只有兩個欄位，獨立物件過度設計。

### 2. 中性線容量與熱度模型：與一般線材相同

- 中性線安全容量：`NEUTRAL_MAX_CURRENT = 30`（常數，constants.ts）
- 熱度模型：同一般線材（heatRate=0.4, coolRate=0.15）
- neutralHeat 達 1.0 → `neutral-burned` 失敗

### 3. 失敗類型擴充：SimulationStatus 新增 'neutral-burned'

PRD 說「新失敗類型由 result 層面處理」，但為了 overallStatus 嚴重度排序一致，直接擴充 SimulationStatus：

```ts
type SimulationStatus = 'normal' | 'warning' | 'tripped' | 'burned' | 'neutral-burned';
```

嚴重度：`neutral-burned` = `burned`（同級，都是不可逆終態）。

`worstStatus()` 更新：neutral-burned 與 burned 同權重。

**替代方案**：在 MultiCircuitState 加獨立 `failureReason` 欄位 — 需要改更多消費端程式碼，且 overallStatus 語義不清。

### 4. 相位分配：CircuitConfig.phase + GameBoard 動態 override

- `CircuitConfig.phase?: 'R' | 'T'` — 關卡定義的初始相位
- 220V 迴路忽略 phase（跨相，不影響中性線）
- `Level.phaseMode?: 'auto' | 'manual'` — auto: 玩家不可切換；manual: 玩家可切換 110V 迴路相位
- GameBoard 維護 `circuitPhases: Record<CircuitId, 'R' | 'T'>` 狀態
- 初始值從 CircuitConfig.phase 載入
- 手動模式下，CircuitDiagram 在迴路標籤旁顯示 R/T toggle 按鈕

### 5. stepMulti 中性線計算位置：迴路步進後、overallStatus 前

```
stepMulti():
  1. 各迴路獨立 step() → newCircuitStates
  2. 計算中性線電流 I_N = |Σ I_R − Σ I_T|（只看 running 的 110V 迴路）
  3. 中性線熱度步進（同 wire heat model）
  4. neutralHeat >= 1.0 → overallStatus = 'neutral-burned'
  5. 否則 overallStatus = worstStatus(circuitStates) 加入中性線 warning 考量
```

中性線 warning 條件：neutralCurrent > NEUTRAL_MAX_CURRENT 且 neutralHeat < 1.0。

stepMulti 需要知道各迴路的 phase，所以函式簽名新增 `phases` 參數：
```ts
function stepMulti(
  circuits: readonly Circuit[],
  state: MultiCircuitState,
  dt: number,
  phases?: Record<CircuitId, 'R' | 'T'>,
  config?: SimulationConfig,
): MultiCircuitState
```

### 6. 相位平衡指示器 UI：StatusDisplay 內

在 StatusDisplay 多迴路摘要下方新增相位區塊（僅在有相位資訊的關卡顯示）：
- 紅相(R)：XX.XA — 紅色文字
- 黑相(T)：XX.XA — 深灰/黑色文字
- 中性線(N)：XX.XA / 30A — 依狀態變色（正常→綠、warning→黃、burned→紅）
- 中性線熱度條（同迴路 wireHeat 風格）

### 7. 手動切換 UI：CircuitDiagram 迴路標籤旁

每個 110V 迴路標籤旁加一個小按鈕：
- 紅底白字 "R" 或深灰底白字 "T"
- 點擊切換 R↔T
- 220V 迴路不顯示按鈕
- 只在 phaseMode === 'manual' 且未送電時可操作

## Risks / Trade-offs

- **[SimulationStatus 擴充]** → 所有消費 SimulationStatus 的地方需要處理 'neutral-burned'。影響：ResultPanel 文字、GameBoard 終態判定、buzzing/音效邏輯。可控，逐一更新。
- **[stepMulti 簽名變更]** → 新增 phases 參數為可選，舊呼叫端不傳即無中性線計算，向後相容。
- **[舊關卡無相位]** → CircuitConfig.phase 為 optional，未定義時 stepMulti 不計算中性線電流（neutralCurrent 恆為 0），完全不影響 L01-L10。
