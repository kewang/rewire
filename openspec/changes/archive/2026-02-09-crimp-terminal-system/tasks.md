## 1. 型別與常數

- [x] 1.1 在 `src/types/game.ts` 新增 CrimpQuality、CrimpTerminalType、CrimpResult 型別定義
- [x] 1.2 在 `src/types/game.ts` 的 Circuit 介面新增 `contactResistance?: number` 可選欄位
- [x] 1.3 在 `src/types/game.ts` 的 Level 介面新增 `requiresCrimp?: boolean` 可選欄位
- [x] 1.4 在 `src/data/constants.ts` 新增壓接端子常數（CRIMP_TERMINALS、CRIMP_QUALITY_MAP 含 contactResistance 倍率）

## 2. Simulation Engine

- [x] 2.1 修改 `src/engine/simulation.ts` step() — 計算 effectiveCurrent = totalCurrent × √(contactResistance ?? 1.0)
- [x] 2.2 step() 中 wireHeat 過載判定改用 effectiveCurrent（NFB 跳脫仍用 totalCurrent）
- [x] 2.3 step() 中 warning 狀態判定改用 effectiveCurrent

## 3. 壓接小遊戲元件

- [x] 3.1 建立 `src/components/CrimpMiniGame.tsx` — overlay 元件含端子選擇 + 進度條 + 結果回饋
- [x] 3.2 在 `src/App.css` 新增壓接小遊戲樣式（overlay、進度條動畫、品質色碼、端子選擇按鈕）

## 4. GameBoard 流程整合

- [x] 4.1 GameBoard 新增 circuitCrimps state 管理 + pendingCrimpCircuitId / pendingCrimpWire state
- [x] 4.2 修改 handleDragEnd — requiresCrimp 時設定 pending 狀態觸發壓接小遊戲，非 requiresCrimp 維持原流程
- [x] 4.3 新增 handleCrimpComplete callback — 壓接完成後更新 wiring.isWired + circuitCrimps
- [x] 4.4 建構 Circuit 時從 circuitCrimps 注入 contactResistance
- [x] 4.5 送電前置條件加入壓接檢查 — requiresCrimp 時所有迴路需已壓接
- [x] 4.6 handleRetry / handleBackToLevels / handleSelectLevel 重置 circuitCrimps 狀態
- [x] 4.7 渲染 CrimpMiniGame overlay（pendingCrimpCircuitId 不為 null 時顯示）

## 5. 電路圖端子視覺

- [x] 5.1 修改 `src/components/CircuitDiagram.tsx` SingleCircuitSVG — NFB 底部繪製端子圖示（O 型環/Y 型叉）+ 品質色碼

## 6. 關卡定義

- [x] 6.1 在 `src/data/levels.ts` 新增 L16 壓接端子入門（單迴路、吹風機+冰箱、$80、8s、requiresCrimp）
- [x] 6.2 在 `src/data/levels.ts` 新增 L17 端子品質大考驗（雙迴路、快煮壺+微波+IH爐、$180、12s、requiresCrimp）

## 7. 驗證

- [x] 7.1 手動測試 L01-L15 不受影響（無壓接流程、contactResistance 預設 1.0）
- [x] 7.2 手動測試 L16 壓接流程（教學關，任何品質都安全）
- [x] 7.3 手動測試 L17 壓接品質影響（poor→過熱、good→安全）
- [x] 7.4 agent-browser smoke test
