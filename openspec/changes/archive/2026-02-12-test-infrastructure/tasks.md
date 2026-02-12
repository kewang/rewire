## 1. 測試框架設定

- [x] 1.1 安裝 vitest 為 devDependency（`npm install -D vitest`）
- [x] 1.2 在 `vite.config.ts` 加入 `test` 配置區塊（environment: 'node'）
- [x] 1.3 在 `package.json` 新增 `"test": "vitest run"` 和 `"test:watch": "vitest"` scripts
- [x] 1.4 建立 `src/engine/__tests__/` 和 `src/types/__tests__/` 目錄

## 2. simulation.ts 測試

- [x] 2.1 建立 `src/engine/__tests__/simulation.test.ts`，測試 calcTotalCurrent（基本加總 + 電壓過濾 + 空陣列）
- [x] 2.2 測試 step 函式（wireHeat 上升/下降、NFB 跳脫閾值 1.25x、burned 狀態、effectiveCurrent 壓接電阻影響）
- [x] 2.3 測試 stepMulti 函式（neutral current 計算、neutral-burned、main-tripped 累積 1.5s、overallStatus 衍生）

## 3. helpers.ts 測試

- [x] 3.1 建立 `src/types/__tests__/helpers.test.ts`，測試 isProblemResolved 五種問題類型（bare-wire/wrong-wire-gauge/oxidized-splice/overrated-breaker/missing-elcb）
- [x] 3.2 測試 worstStatus（severity 排序：normal < warning < tripped=elcb-tripped < burned=neutral-burned=leakage）

## 4. scoring.ts 測試

- [x] 4.1 建立 `src/engine/__tests__/scoring.test.ts`，測試 calcStars（0/1/2/3 星累進邏輯 + 5 種 bonusCondition 類型驗證）

## 5. routing.ts 測試

- [x] 5.1 建立 `src/engine/__tests__/routing.test.ts`，測試 findShortestPath（最短路徑 + 不可達回傳 null + 多路徑選最短）
- [x] 5.2 測試 calcRouteCandidates（星形/串聯候選 + 距離計算）和 calcRouteDistance

## 6. aesthetics.ts 測試

- [x] 6.1 建立 `src/engine/__tests__/aesthetics.test.ts`，測試 detectCrossings（交叉偵測）和 calcAestheticsScore（分數計算 + 束帶品質扣分）

## 7. randomOldHouse.ts 測試

- [x] 7.1 建立 `src/engine/__tests__/randomOldHouse.test.ts`，測試 generateRandomOldHouse（三級難度迴路數範圍 + 可解性驗證 + floorPlan 對應 + budget >= 修復成本）

## 8. 驗收

- [x] 8.1 執行 `npm run test` 確認所有測試通過
- [x] 8.2 執行 `npm run lint` 確認零 error/warning
- [x] 8.3 執行 `npm run build` 確認建置成功（測試不影響 production build）
