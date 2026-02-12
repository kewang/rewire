## Context

專案使用 Vite 7 + React 19 + TypeScript strict，目前無任何測試框架。純函式引擎模組（simulation, scoring, aesthetics, routing, randomOldHouse）和型別輔助函式（helpers.ts）共約 1291 行，是最適合且最有價值的測試目標。

## Goals / Non-Goals

**Goals:**
- 建立 Vitest 測試框架，與現有 Vite 工具鏈無縫整合
- 為所有純函式引擎模組建立單元測試
- 建立測試慣例（檔案位置、命名、pattern）
- 確保 CI 可執行測試（npm run test）

**Non-Goals:**
- 不測試 React 元件（需要 @testing-library/react，工作量大，後續再做）
- 不測試 audio.ts（Web Audio API 需要瀏覽器環境 mock）
- 不追求 100% 覆蓋率，聚焦關鍵路徑和邊界條件
- 不設定 CI 自動執行（GitHub Actions 修改，後續再做）

## Decisions

### D1: 測試框架選擇 — Vitest

**選擇：Vitest**

Vitest 是 Vite 原生測試框架，共享 Vite 的 transform pipeline 和設定，零額外配置即可處理 TypeScript。

替代方案：
- Jest — 需要額外的 ts-jest 或 @swc/jest transform 配置，與 Vite 不共享設定
- node:test — 不支援 TypeScript 直接執行

### D2: 測試檔案位置 — co-located `__tests__/` 目錄

**選擇：`src/engine/__tests__/*.test.ts` 和 `src/types/__tests__/*.test.ts`**

將測試放在被測模組旁的 `__tests__/` 目錄，方便定位且不混入 `src/` 根目錄。

替代方案：
- 頂層 `tests/` 目錄 — 離原始碼太遠，不利維護
- 同目錄 `.test.ts` — 可行但會讓 `src/engine/` 檔案數翻倍

### D3: 測試範圍優先序

依重要性排序：

1. **simulation.ts**（最關鍵）— calcTotalCurrent 電壓過濾、step 熱度模型/NFB 跳脫、stepMulti 中性線/主開關跳脫
2. **helpers.ts** — isProblemResolved 五種問題類型、worstStatus severity 排序
3. **scoring.ts** — calcStars 三星累進邏輯 + bonusCondition 五種類型
4. **routing.ts** — findShortestPath Dijkstra 正確性、calcRouteCandidates 星形/串聯
5. **aesthetics.ts** — detectCrossings 交叉偵測、calcAestheticsScore 分數計算
6. **randomOldHouse.ts** — generateRandomOldHouse 可解性驗證（隨機性導致不易精確測試，驗證約束條件）

### D4: Vitest 配置方式

**選擇：在 `vite.config.ts` 中加入 `test` 區塊**

Vitest 可直接讀取 `vite.config.ts` 的 `test` 設定，不需獨立的 `vitest.config.ts`。保持單一設定檔。

```typescript
// vite.config.ts
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'node',  // 純函式不需 DOM
  },
});
```

## Risks / Trade-offs

- **[風險] randomOldHouse 的隨機性** → 緩解：測試約束條件（迴路數量在範圍內、問題可解、budget 合理）而非精確輸出
- **[取捨] 不測元件意味著 UI 回歸仍需 agent-browser** → 接受：元件測試工作量大，先用 smoke test 補足
- **[風險] Vitest globals 可能與某些庫衝突** → 緩解：如有問題可關閉 globals，改用 explicit import
