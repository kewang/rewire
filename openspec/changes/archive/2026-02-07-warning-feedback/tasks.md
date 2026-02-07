## 1. Buzzing 音效

- [x] 1.1 在 `src/engine/audio.ts` 新增 `startBuzzing()` 函式：建立持續性 sawtooth oscillator (~120Hz) + GainNode，初始 gain=0
- [x] 1.2 在 `src/engine/audio.ts` 新增 `updateBuzzingVolume(wireHeat: number)` 函式：將 wireHeat 映射為 gain 值（0→0, 1→0.12）
- [x] 1.3 在 `src/engine/audio.ts` 新增 `stopBuzzing()` 函式：停止 oscillator 並清除參考

## 2. 預警煙霧

- [x] 2.1 在 `CircuitDiagram.tsx` 新增 warning 淡煙粒子：wireHeat ≥ 0.3 時渲染 2 個小粒子（r=2, 低透明度, 2s 動畫）
- [x] 2.2 wireHeat ≥ 0.7 時增加到 3 個粒子並提高透明度

## 3. GameBoard 整合

- [x] 3.1 在 `GameBoard.tsx` 新增 buzzing 狀態追蹤 ref，在 tick 中根據 status 呼叫 start/update/stop
- [x] 3.2 在斷電（handlePowerToggle off）和 handleRetry/handleBackToLevels 中呼叫 `stopBuzzing()`

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認編譯通過
- [x] 4.2 執行 `npm run lint` 確認無新增 lint 錯誤（既有 GameBoard.tsx 錯誤非本次引入）
