## Context

v0.7 自由配迴路模式允許玩家自由建立迴路。前面 changes 已完成型別定義（`mainBreakerTripTimer`、`'main-tripped'`、`PanelConfig.mainBreakerRating`）和 CircuitPlanner UI。本 change 實作核心模擬邏輯和 UI 顯示。

現有 `stepMulti` 函式已在 `simulation.ts` 中處理多迴路步進、中性線電流計算、neutral-burned 判定。主開關跳脫邏輯需嵌入相同函式，在所有個別迴路計算完成後、回傳前執行。

## Goals / Non-Goals

**Goals:**
- stepMulti 支援 mainBreakerRating 參數，計算總面板電流並判定主開關跳脫
- tripTimer 累積模型（1.5s 延遲），與 NFB 跳脫體驗一致
- StatusDisplay 顯示主開關負載即時指示
- ResultPanel 顯示 main-tripped 失敗文案
- GameBoard 從 FreeCircuitLevel.panel.mainBreakerRating 取值傳入

**Non-Goals:**
- 主開關 UI 互動（開/關切換）——主開關永遠開啟
- 主開關視覺在 CircuitDiagram 或 PanelInteriorView 中的呈現
- 固定迴路關卡的主開關支援（FixedCircuitLevel 無 mainBreakerRating）

## Decisions

1. **stepMulti 參數位置**：`mainBreakerRating` 加在 `phases` 之後、`config` 之前，作為 optional number。未傳入時不啟用主開關邏輯（向後相容）。

2. **totalPanelCurrent 計算**：Σ 所有非終態（非 burned/tripped/elcb-tripped/main-tripped/neutral-burned/leakage）迴路的 `calcTotalCurrent`。與中性線電流計算同一迴圈。

3. **tripTimer 累積邏輯**：
   - `totalPanelCurrent > mainBreakerRating × 1.25` → `mainBreakerTripTimer += dt`
   - 否則 → `mainBreakerTripTimer = 0`（重置）
   - `mainBreakerTripTimer >= 1.5` → `overallStatus = 'main-tripped'`

4. **main-tripped 為終態**：一旦觸發，stepMulti 直接回傳不做計算（與 burned/neutral-burned 同行為）。

5. **StatusDisplay 主開關指示器**：僅當 `mainBreakerRating` 有值時顯示。負載比 = totalPanelCurrent / mainBreakerRating。格式「主開關：{current}A / {rating}A」。

6. **GameBoard 整合**：從 `currentLevel` 判斷是否為 FreeCircuitLevel（有 `panel` 屬性），取 `panel.mainBreakerRating` 傳入 stepMulti。

## Risks / Trade-offs

- **totalPanelCurrent 含 effectiveCurrent 嗎？** 否，主開關量測真實電流（totalCurrent），與 NFB 一致。effectiveCurrent 僅影響線材發熱。
- **tripTimer 重置策略**：選擇瞬間低於閾值即重置（非累積式），避免邊界震盪時累積假跳脫。這與現實中 NFB 的熱-磁跳脫行為略有差異，但遊戲性較佳。
