## 1. 型別系統擴充

- [x] 1.1 在 `game.ts` 的 SimulationStatus 新增 `'neutral-burned'` 值
- [x] 1.2 在 `game.ts` 的 CircuitConfig 新增 `phase?: 'R' | 'T'` 可選欄位
- [x] 1.3 在 `game.ts` 的 Level 新增 `phaseMode?: 'auto' | 'manual'` 可選欄位
- [x] 1.4 在 `game.ts` 的 MultiCircuitState 新增 `neutralCurrent: number` 和 `neutralHeat: number` 欄位
- [x] 1.5 在 `constants.ts` 新增 `NEUTRAL_MAX_CURRENT = 30` 常數
- [x] 1.6 更新 `helpers.ts` 的 `worstStatus()` 支援 `'neutral-burned'`（與 burned 同權重）
- [x] 1.7 更新 `simulation.ts` 的 `createInitialMultiState()` 初始化 neutralCurrent=0、neutralHeat=0

## 2. 模擬引擎

- [x] 2.1 更新 `stepMulti()` 簽名新增可選 `phases?: Record<CircuitId, 'R' | 'T'>` 參數
- [x] 2.2 在 `stepMulti()` 迴路步進後計算中性線電流 `I_N = |Σ I_R − Σ I_T|`（220V 迴路不計入，無 phases 時為 0）
- [x] 2.3 在 `stepMulti()` 實作中性線熱度步進（同 wire heat model: heatRate=0.4, coolRate=0.15）
- [x] 2.4 在 `stepMulti()` 加入 neutral-burned 判定：neutralHeat >= 1.0 → overallStatus = 'neutral-burned'
- [x] 2.5 在 `stepMulti()` 加入 neutral-burned 終態保護：已 neutral-burned 時直接返回不變

## 3. 關卡定義

- [x] 3.1 在 `levels.ts` 新增 L11「相位平衡入門」：3 迴路（廚房 R + 客廳 T + 冷氣 220V），phaseMode='auto'，預算 $200，存活 12 秒
- [x] 3.2 在 `levels.ts` 新增 L12「相位平衡進階」：4 迴路（廚房A R + 廚房B R + 客廳 T + 冷氣 220V），phaseMode='manual'，預算 $250，存活 15 秒

## 4. GameBoard 狀態管理

- [x] 4.1 在 `GameBoard.tsx` 新增 `circuitPhases: Record<CircuitId, 'R' | 'T'>` 狀態，初始化從 CircuitConfig.phase 載入
- [x] 4.2 在 `GameBoard.tsx` 新增 `handleTogglePhase(circuitId)` 回調（僅 phaseMode='manual' 且未送電時生效）
- [x] 4.3 將 circuitPhases 傳入 stepMulti() 的 phases 參數
- [x] 4.4 處理 neutral-burned 終態：停止送電、停止音效、設定 result

## 5. UI 元件更新

- [x] 5.1 在 `StatusDisplay.tsx` 新增相位平衡指示器：紅相(R)電流、黑相(T)電流、中性線(N)電流與狀態（僅在有相位的關卡顯示）— 使用 `/frontend-design` skill 設計
- [x] 5.2 在 `CircuitDiagram.tsx` 新增相位標籤與 R/T 切換按鈕（phaseMode='manual' 時顯示，未送電時可操作）— 使用 `/frontend-design` skill 設計
- [x] 5.3 在 `ResultPanel.tsx` 新增 neutral-burned 失敗訊息文字

## 6. 驗證

- [x] 6.1 執行 `npm run build` 確認無 TypeScript 編譯錯誤
- [x] 6.2 執行 `npm run lint` 確認無 ESLint 錯誤
- [ ] 6.3 手動驗證：L11 自動分配模式、L12 手動切換模式、中性線過載→燒毀流程
