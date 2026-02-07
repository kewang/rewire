## 1. 電器運作音效

- [x] 1.1 在 `audio.ts` 新增 `startApplianceSounds(appliances)` 函式，根據每種電器名稱建立對應 Oscillator（吹風機=bandpass noise、快煮壺=低頻 sine 調變、微波爐=60Hz sine、廚下加熱器=50Hz sine、烘衣機=80Hz triangle）
- [x] 1.2 在 `audio.ts` 新增 `stopApplianceSounds()` 函式，停止並釋放所有電器音效 node
- [x] 1.3 在 `GameBoard.tsx` 送電時呼叫 `startApplianceSounds(pluggedAppliances)`
- [x] 1.4 在 `GameBoard.tsx` 所有停止路徑（斷電、handleRetry、handleBackToLevels、tick 終態）呼叫 `stopApplianceSounds()`

## 2. 電器運作動畫

- [x] 2.1 `AppliancePanel` 新增 `isPowered` prop，送電時已插入電器卡片加上 `operating` class
- [x] 2.2 在 `App.css` 新增 `.card.plugged.operating` 樣式與 `appliance-operating` keyframe 動畫（box-shadow 脈動 glow）
- [x] 2.3 `GameBoard.tsx` 傳遞 `isPowered` prop 給 `AppliancePanel`

## 3. 驗證

- [x] 3.1 執行 `npm run build` 確認編譯通過
- [x] 3.2 執行 `npm run lint` 確認無新增 lint 錯誤（既有 GameBoard.tsx tick 錯誤非本次引入）
