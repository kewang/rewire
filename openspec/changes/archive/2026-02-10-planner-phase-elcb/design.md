## Context

CircuitPlanner（v0.7 change #3）已實作基本的迴路規劃 UI：建立迴路、選電壓/NFB/線材、指派電器。GameBoard（change #4）已整合 planning→wiring 轉換與主開關跳脫模擬。

但目前 CircuitPlanner 缺少兩個關鍵控制項：
1. **相位選擇器**（R/T）— L11-L12 需要玩家分配 110V 迴路的相位
2. **ELCB toggle** — L13-L15 需要玩家為 wetArea 迴路啟用 ELCB

此外，scripted leakageEvent 的 circuitId 在固定迴路關卡中是硬編碼的，但在自由配迴路中迴路由玩家建立，circuitId 是動態生成的，需要在規劃完成時解析映射。

## Goals / Non-Goals

**Goals:**
- CircuitCard 支援相位選擇（110V + phaseMode）和 ELCB toggle（wetArea 電器）
- CircuitPlanner 即時顯示相位平衡預估（R/T/N 電流）
- 確認配置時正確轉換 phase/elcb 到 simulation 狀態
- 動態解析 scripted leakageEvent circuitId
- 成本正確包含 ELCB 費用
- 送電前驗證 wetArea ELCB 需求

**Non-Goals:**
- 不修改 simulation engine（stepMulti 已支援 phases + mainBreakerRating）
- 不修改固定迴路關卡的行為
- 不新增關卡定義（free-circuit-levels 在 change #6）

## Decisions

### 1. PlannerCircuit 擴充 phase 和 elcbEnabled

**決策：** 直接在 PlannerCircuit 加 `phase?: 'R' | 'T'` 和 `elcbEnabled?: boolean`。

**理由：** PlannerCircuit 是規劃階段的暫時資料結構，phase 和 elcb 是該階段的使用者選擇。放在 PlannerCircuit 而非獨立 state 可讓 CircuitCard 直接從 circuit prop 讀取，減少 prop drilling。

**替代方案：** 維持獨立 `circuitPhases`/`circuitElcb` state 在 GameBoard — 已有這些 state 用於模擬階段，但規劃階段再多一組 prop 傳遞鏈太冗長。

### 2. wetArea 判定邏輯

**決策：** 迴路「包含 wetArea 電器」= 迴路的 assignedAppliances 中至少有一個來自 `wetArea: true` 的房間。CircuitCard 需要知道 rooms 資訊來判定。

**方式：** CircuitPlanner 傳遞 `rooms` 到 CircuitCard，或預計算 `hasWetAreaAppliance` boolean 傳下去。選擇後者（預計算 boolean），減少 CircuitCard 對 Room 型別的依賴。

### 3. 相位平衡預估計算

**決策：** 在 CircuitPlanner 層用 `useMemo` 計算。遍歷所有 PlannerCircuit，只統計有 phase 的 110V 迴路。

**公式：** R 相電流 = Σ(R 相迴路電器電流), T 相同理, N = |R - T|。

### 4. leakageEvent circuitId 動態映射

**決策：** FreeCircuitLevel 的 leakageEvents 中，circuitId 使用 `"_wetArea"` 佔位符（或根據 roomId 映射）。GameBoard `confirmPlanning` 時解析：找到包含 wetArea 電器的已建迴路 ID 替換之。

**實作：** 若關卡只有一個 wetArea 房間，直接映射到包含該房間電器的迴路。若有多個 wetArea 房間/迴路，按 leakageEvent 中的 circuitId 前綴匹配（如 `"wet-bathroom"` → 包含 bathroom 電器的迴路）。

**簡化方案：** v0.7 的 L13-L15 每關只有一個 wetArea（浴室），直接找到含 wetArea 電器的迴路即可。暫不需複雜映射。

### 5. ELCB 成本整合

**決策：** CircuitCard footer 的 circuitCost 加上 `elcbEnabled ? ELCB_COST : 0`。GameBoard 的 totalCost 計算同步更新。

### 6. 送電前置條件擴充

**決策：** canConfirm 驗證邏輯新增：有 wetArea 電器的迴路必須 `elcbEnabled === true`。confirmTooltip 顯示「潮濕區域迴路需安裝 ELCB」。

## Risks / Trade-offs

- [Risk] PlannerCircuit 越來越胖 → 後續 change 可能需要更多欄位 → **Mitigation:** 規劃階段結束後即丟棄，不影響模擬效能
- [Risk] leakageEvent circuitId 映射邏輯耦合到 wetArea 假設 → **Mitigation:** v0.7 所有 wetArea 關卡僅有浴室一個 wetArea 房間，映射簡單可靠；v0.8 若需複雜映射再擴展
- [Risk] phaseMode: 'auto' 在自由配迴路中的語意 → **Mitigation:** auto = 系統自動分配初始相位（R/T 交替），玩家不可手動切換
