## 1. 資料模型與常數

- [x] 1.1 在 `constants.ts` 新增 14mm² 線材 (70A, $28/米) 到 `DEFAULT_WIRES`
- [x] 1.2 在 `constants.ts` 新增 4 種電器 (IH 爐/冰箱/冷氣/浴室暖風機) 到 `DEFAULT_APPLIANCES`
- [x] 1.3 在 `constants.ts` 新增 `BREAKER_15A`、`BREAKER_20A`、`BREAKER_30A` 命名常數，保留 `DEFAULT_BREAKER` 指向 `BREAKER_20A`
- [x] 1.4 在 `constants.ts` 新增 `ELCB_COST = 35` 常數
- [x] 1.5 在 `game.ts` 的 `CircuitConfig` 新增 `elcbAvailable?: boolean` 可選欄位

## 2. 關卡定義

- [x] 2.1 在 `levels.ts` 新增 L10「新電器暖身」關卡：2 迴路（廚房 110V/20A + IH 爐 220V/20A），預算 $150，存活 10 秒

## 3. UI 元件更新

- [x] 3.1 在 `CircuitDiagram.tsx` 的 `getWireColor()` 新增 14mm² → 紫色 (#a855f7) 映射
- [x] 3.2 在 `audio.ts` 的 `playApplianceSound()` 新增 IH 爐/冰箱/冷氣/浴室暖風機音效
- [x] 3.3 在 `GameBoard.tsx` 更新成本計算，加入 ELCB 成本：新增 per-circuit `hasElcb` 狀態與 ELCB 開關 UI（僅在 `elcbAvailable` 為 true 時顯示）

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認無 TypeScript 編譯錯誤
- [x] 4.2 執行 `npm run lint` 確認無 ESLint 錯誤（排除既有 known issues）
- [x] 4.3 手動驗證：L10 關卡可選擇、進入遊戲、接線、送電、過關流程正常
