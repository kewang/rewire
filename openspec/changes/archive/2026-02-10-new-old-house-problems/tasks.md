## 1. 型別與資料擴充

- [x] 1.1 擴充 `OldHouseProblemType` union 新增 `'overrated-breaker' | 'missing-elcb'`（game.ts）
- [x] 1.2 擴充 `PreWiredCircuit` 新增可選 `breaker?: Breaker` 欄位（game.ts）
- [x] 1.3 在 helpers.ts 或新增 utils 中實作 `isProblemResolved(problem, state)` 統一修復判定函式，支援全 5 種問題類型

## 2. GameBoard 狀態與邏輯

- [x] 2.1 新增 `circuitBreakers: Record<CircuitId, Breaker>` state，關卡初始化時從 CircuitConfig.breaker 載入
- [x] 2.2 老屋初始化擴充：overrated-breaker 迴路從 PreWiredCircuit.breaker 初始化 circuitBreakers；missing-elcb 迴路初始化 circuitElcb 為 false
- [x] 2.3 新增 `handleChangeBreaker(circuitId, breaker)` callback，更新 circuitBreakers 並觸發問題修復判定
- [x] 2.4 重構問題修復判定：使用 isProblemResolved 取代現有散落的 if/else 邏輯，支援 overrated-breaker（NFB 更換）和 missing-elcb（ELCB 安裝）修復路徑
- [x] 2.5 確保模擬引擎使用 circuitBreakers（而非 CircuitConfig.breaker）進行 NFB 跳脫判定，傳入 stepMulti 或 step 時覆寫 breaker

## 3. BreakerSelector UI 元件

- [x] 3.1 建立 `BreakerSelector.tsx` 元件：三張卡片（15A/20A/30A）、額定電流 + 跳脫閾值顯示、當前規格標示「目前」+ disabled、相容性標示（✓/⚠️ 依線材 maxCurrent）
- [x] 3.2 在 App.css 新增 BreakerSelector 樣式（工業深色主題，與 WireSelector 風格一致）

## 4. CircuitDiagram 視覺擴充

- [x] 4.1 overrated-breaker 迴路：NFB 紅色邊框 + ⚠️ 圖示，修復後消失
- [x] 4.2 missing-elcb 迴路：💧⚠️ 圖示，修復後消失
- [x] 4.3 overrated-breaker 迴路 NFB 區域加上 click handler，未送電時點擊開啟 BreakerSelector（避免與既有 leverTooltip 衝突）
- [x] 4.4 missing-elcb 迴路確保 ELCB toggle 可見且可操作（CircuitDiagram 或 CircuitCard 中）

## 5. L24–L25 關卡定義

- [x] 5.1 在 levels.ts 新增 L24「老屋驚魂：保護力缺失」（3 迴路、overrated-breaker + bare-wire、$120 預算、10 秒）
- [x] 5.2 在 levels.ts 新增 L25「老屋驚魂：潮濕陷阱」（3 迴路、missing-elcb + oxidized-splice、$170 預算、12 秒、random 漏電）

## 6. 整合測試與驗證

- [x] 6.1 驗證 L24：overrated-breaker 迴路可開啟 BreakerSelector → 換 NFB 30A→20A → 問題消除 → bare-wire 迴路拆線重接 → 送電通關
- [x] 6.2 驗證 L25：missing-elcb 迴路安裝 ELCB → 問題消除 → oxidized-splice 迴路拆線重接 → 隨機漏電被 ELCB 捕獲 → 送電通關
- [x] 6.3 回歸驗證 L18–L20 既有老屋關卡正常運作（3 種舊問題不受影響）
- [x] 6.4 驗證非老屋關卡不會出現 BreakerSelector 或新問題視覺
