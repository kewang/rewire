## 1. 擴充線材與電器常數

- [x] 1.1 在 `src/data/constants.ts` 的 DEFAULT_WIRES 陣列中新增 3.5mm²（25A, $8/米）和 8mm²（45A, $18/米），按線徑由小到大排列
- [x] 1.2 在 `src/data/constants.ts` 的 DEFAULT_APPLIANCES 陣列中新增廚下加熱器（800W/110V）和烘衣機（2200W/220V）

## 2. 新增關卡

- [x] 2.1 在 `src/data/levels.ts` 新增 L04 低功率陷阱：廚下加熱器 + 吹風機 + 快煮壺，預算 $55，存活 5 秒
- [x] 2.2 在 `src/data/levels.ts` 新增 L05 220V 專用迴路：烘衣機，預算 $60，存活 5 秒
- [x] 2.3 在 `src/data/levels.ts` 新增 L06 混合電壓挑戰：烘衣機 + 吹風機，預算 $80，存活 8 秒

## 3. 驗證

- [x] 3.1 執行 `npm run build` 確認編譯通過
- [x] 3.2 執行 `npm run lint` 確認無 lint 錯誤（既有 GameBoard.tsx 錯誤非本次引入）
