## Context

v0.4 已完成 FR-G（材料擴充 + ELCB 成本框架）和 FR-E（相位平衡）。目前 ELCB 有：
- `CircuitConfig.elcbAvailable` 控制是否顯示 toggle
- `hasElcb` per-circuit 狀態在 GameBoard 管理
- `ELCB_COST = 35` 常數
- 成本計算已包含 ELCB

缺少的是 ELCB 的**功能機制**：漏電事件、跳脫邏輯、wetArea 強制規則、leakage 失敗。

## Goals / Non-Goals

**Goals:**
- 實作 wetArea 迴路屬性與 ELCB 強制安裝規則
- 實作漏電事件系統（腳本式 + 隨機式）
- 實作 ELCB 跳脫邏輯與 leakage 失敗類型
- 新增 L13-L15 三個關卡
- UI 呈現 ELCB 跳脫狀態與漏電提示

**Non-Goals:**
- 不做 ELCB 的電氣特性模擬（如 30mA 閾值計算，簡化為事件觸發）
- 不做 ELCB 的復歸（reset）機制
- 不做漏電電流的視覺化（只有事件觸發/跳脫結果）

## Decisions

### D1: 漏電事件由 GameBoard rAF loop 驅動，非 simulation engine

**選擇**: 漏電事件邏輯在 GameBoard 的 rAF loop 中處理，不放進 simulation.ts 的 step/stepMulti。

**理由**: 漏電事件是隨機的外部事件（非基於電流/熱度的確定性物理模擬）。step/stepMulti 是純函式，注入隨機性會破壞其可預測性。GameBoard 已負責管理 elapsed、circuitPhases 等 per-simulation 狀態。

**替代方案**: 把漏電事件放進 stepMulti — 需要傳入 RNG seed 或事件佇列，增加 API 複雜度且破壞純函式語義。

### D2: ELCB 跳脫 = 將 CircuitState.status 設為 `"elcb-tripped"`

**選擇**: 新增 `"elcb-tripped"` 作為 SimulationStatus 的新值，與既有 `"tripped"`（NFB 跳脫）區分。

**理由**: ELCB 跳脫和 NFB 跳脫的語義不同（漏電保護 vs 過流保護），結果面板需要分別顯示不同訊息。`elcb-tripped` 的嚴重度與 `tripped` 相同（severity=2），不算失敗。

**替代方案**: 複用 `"tripped"` + 額外 flag — 會讓 ResultPanel 的判斷更複雜，且失去語義清晰度。

### D3: leakage 失敗 = 新的 SimulationStatus `"leakage"`

**選擇**: 新增 `"leakage"` 作為致命狀態，severity = 3（與 burned 同級）。

**理由**: 觸電是不可恢復的危險事件，應與 burned 同級。需要在 ResultPanel 顯示獨特的失敗訊息（「觸電危險」vs「線路燒毀」）。

### D4: 漏電事件僅影響 wetArea 迴路

**選擇**: 乾燥迴路永遠不會觸發漏電事件，無論是否安裝 ELCB。

**理由**: 符合 PRD 設計 — 「乾燥迴路不觸發漏電事件」。簡化遊戲策略，ELCB 的價值在 wetArea 迴路最明確。

### D5: 送電前置檢查擴展

**選擇**: 在現有的「所有迴路都已接線」檢查後，加入「所有 wetArea 迴路都已安裝 ELCB」檢查。送電按鈕同時顯示缺少的條件。

**理由**: 符合 PRD「wetArea 迴路未安裝 ELCB 時無法送電」。提前告知玩家，避免送電後才發現問題。

### D6: LeakageEvent 定義在 Level 中

**選擇**: `Level.leakageMode` 定義漏電模式（`'scripted'` 或 `'random'`），`Level.leakageEvents` 定義腳本式事件列表。

**理由**: 腳本式和隨機式是關卡級設定，不是 per-circuit 設定。隨機式由常數 `LEAKAGE_CHANCE_PER_SECOND = 0.05` 控制。

## Risks / Trade-offs

- **[Risk] 隨機漏電可能讓玩家感到不公平** → 隨機式僅用於進階關（L14/L15），且 wetArea 電器不放入 requiredAppliances，ELCB 跳脫不影響過關
- **[Risk] elcb-tripped 新增到 SimulationStatus 影響 worstStatus helper** → 嚴重度與 tripped 同級，worstStatus 已有 severity map 機制，只需加入新值
- **[Risk] L15 綜合關卡同時有相位 + ELCB + 多迴路，複雜度高** → 20 秒存活時間 + $300 寬裕預算，策略明確不至於太難
