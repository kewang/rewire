## 1. 型別擴充

- [x] 1.1 PlannerCircuit 新增 `phase?: 'R' | 'T'` 和 `elcbEnabled?: boolean` 欄位（`src/types/game.ts`）

## 2. CircuitCard 相位選擇器

- [x] 2.1 CircuitCard props 新增 `phaseMode`、`onChangePhase` 和 `hasWetAreaAppliance`、`onChangeElcb`
- [x] 2.2 CircuitCard 條件渲染相位選擇器（R/T toggle）：phaseMode 存在 + 110V
- [x] 2.3 phaseMode 'auto' 時按鈕 disabled，'manual' 時 enabled

## 3. CircuitCard ELCB toggle

- [x] 3.1 CircuitCard 條件渲染 ELCB checkbox（hasWetAreaAppliance 為 true 時）
- [x] 3.2 ELCB toggle 啟用/停用更新 elcbEnabled + 成本即時反映（footer 加 ELCB_COST）

## 4. CircuitPlanner 整合

- [x] 4.1 CircuitPlanner props 新增 `phaseMode`、`onChangePhase`、`onChangeElcb`，傳遞至 CircuitCard
- [x] 4.2 CircuitPlanner 預計算每條迴路的 hasWetAreaAppliance（比對 rooms wetArea）
- [x] 4.3 CircuitPlanner 摘要區新增相位平衡預估面板（R/T/N 電流，僅 phaseMode 時顯示）

## 5. GameBoard 狀態管理

- [x] 5.1 handleAddCircuit：有 phaseMode 的 110V 迴路預設 phase='R'
- [x] 5.2 handleChangeVoltage：切 220V 清 phase，切 110V 恢復 'R'
- [x] 5.3 新增 handleChangePhase 回調更新 PlannerCircuit phase
- [x] 5.4 新增 handleChangeElcb 回調更新 PlannerCircuit elcbEnabled
- [x] 5.5 handleUnassignAppliance：移除 wetArea 電器後若無剩餘 wetArea 電器，重設 elcbEnabled=false
- [x] 5.6 totalCost 計算加入 ELCB_COST（elcbEnabled 時）
- [x] 5.7 canConfirm 驗證新增：wetArea 迴路必須 elcbEnabled
- [x] 5.8 confirmTooltip 包含 ELCB 相關提示文字

## 6. 規劃→模擬轉換

- [x] 6.1 confirmPlanning 從 PlannerCircuit 提取 phase → circuitPhases state
- [x] 6.2 confirmPlanning 從 PlannerCircuit 提取 elcbEnabled → circuitElcb state
- [x] 6.3 confirmPlanning 生成 CircuitConfig 包含 phase / wetArea / elcbAvailable
- [x] 6.4 confirmPlanning 動態解析 scripted leakageEvent circuitId（找含 wetArea 電器的迴路替換）

## 7. CSS 樣式

- [x] 7.1 相位選擇器樣式（R/T toggle，compact inline，R=紅底/T=藍底）
- [x] 7.2 ELCB toggle 樣式（checkbox + label，highlight 黃色提示）
- [x] 7.3 相位平衡預估面板樣式（三行 R/T/N，N 超標紅色警告）
