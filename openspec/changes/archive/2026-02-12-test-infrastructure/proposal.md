## Why

專案目前完全沒有測試基礎設施（無 vitest/jest、無任何 test 檔案）。即將進行 GameBoard 大型重構（1958 行拆分為 5 個 hooks），需要測試安全網保護純函式引擎不因重構而改變行為。同時為專案建立可持續的測試慣例。

## What Changes

- 安裝 Vitest 作為測試框架（Vite 原生整合，零額外配置）
- 新增 `npm run test` 指令
- 為 6 個純函式模組撰寫單元測試：
  - `src/engine/simulation.ts` — calcTotalCurrent, step, stepMulti, createInitialMultiState
  - `src/engine/scoring.ts` — calcStars
  - `src/engine/aesthetics.ts` — detectCrossings, countUnbundledPairs, calcAestheticsScore
  - `src/engine/routing.ts` — findShortestPath, calcRouteCandidates, calcRouteDistance
  - `src/engine/randomOldHouse.ts` — generateRandomOldHouse（可解性驗證）
  - `src/types/helpers.ts` — isProblemResolved, worstStatus, toLegacyState

## Capabilities

### New Capabilities
- `test-setup`: Vitest 安裝與配置、npm script、測試檔案慣例
- `engine-tests`: 純函式引擎模組的單元測試覆蓋

### Modified Capabilities
（無需求層級變更）

## Impact

- 新增 devDependency：`vitest`
- 新增 `vitest.config.ts`（或 `vite.config.ts` 內嵌）
- 新增 `src/engine/__tests__/` 測試檔案
- 新增 `src/types/__tests__/` 測試檔案
- `package.json` 新增 `test` script
- 不影響任何生產程式碼
