# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

**PRD v0.2 完成。v0.3 全部完成。v0.4 全部完成（FR-G ✓ → FR-E ✓ → FR-F ✓）。v0.5 全部完成（crimp-terminal-system ✓ → level-select-grid-layout ✓ → star-rating-system ✓ → old-house-intro ✓）。v0.6 全部完成（routing-ux-guide ✓ → panel-visual-and-cable-tie ✓ → fix-multi-circuit-svg-sizing ✓）。v0.7 全部完成（new-appliances-and-nfb-cost ✓ → free-circuit-data-model ✓ → circuit-planner-ui ✓ → main-breaker-simulation ✓ → planner-phase-elcb ✓ → free-circuit-levels ✓ → level-balance-tuning ✓）。v0.8 全部完成（new-old-house-problems ✓ → before-after-view ✓ → old-house-routing-integration ✓ → random-old-house ✓）。i18n 中英雙語 ✓。**

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- react-i18next（中英雙語 i18n）
- SVG 視覺化（CircuitDiagram 元件）
- Web Audio API 音效（無外部音檔）
- 無狀態管理庫（useState + useRef + rAF loop）
- Google Fonts: Orbitron (display) + JetBrains Mono (mono)

## Project Structure

- `src/components/` — React 元件
  - `GameBoard.tsx` — 主遊戲控制器，rAF 驅動，多迴路狀態管理（circuitWires/circuitAppliances per-circuit）+ 老屋模式（problemCircuits/preWiredCircuitIds/handleUnwire/circuitBreakers/handleChangeBreaker）+ 自由配迴路規劃（plannerCircuits/handleChangePhase/handleChangeElcb/resolvedLeakageEvents/selectedPlannerCircuitId）
  - `CircuitPlanner.tsx` — 迴路規劃主容器（RoomPanel + CircuitCard 列表 + 配電箱摘要 + 相位平衡預估面板）
  - `CircuitCard.tsx` — 單條迴路卡片（電壓/NFB/線材選擇 + 相位 R/T toggle + ELCB toggle + 電器列表 + 成本 + 迴路選取高亮）
  - `RoomPanel.tsx` — 房間電器清單（未指派高亮 / 已指派灰化）
  - `StatusDisplay.tsx` — 即時狀態面板（單迴路詳細 / 多迴路摘要 + 相位平衡指示器 + 主開關負載指示器）
  - `ResultPanel.tsx` — 結果面板（inline + 失敗迴路標示 + 星等顯示 + main-tripped）
  - `CircuitDiagram.tsx` — SVG 線路圖，SingleCircuitSVG 子元件 + 多迴路多行排列佈局（MAX_CIRCUITS_PER_ROW=4）+ 相位標籤/切換 + 老屋問題視覺（閃爍邊框/⚠️/氧化線色/拆線按鈕/NFB 紅框+提示/💧⚠️+提示）+ BreakerSelector popup
  - `BeforeAfterView.tsx` — 老屋修復前後對比視圖（Before/After 並排面板 + 修復摘要文字 + 入場動畫）
  - `BreakerSelector.tsx` — NFB 更換彈出選擇器（15A/20A/30A 卡片、相容性標示、當前規格 disabled）
  - `WireSelector.tsx` — 線材選擇卡片，拖曳來源（Pointer Events + 觸控長按）
  - `AppliancePanel.tsx` — 電器面板，多迴路時有 circuit-tabs 選擇目標迴路
  - `LevelSelect.tsx` — 關卡選擇（CSS Grid 多欄排列 + 歷史星等 + 隨機老屋挑戰區塊）
  - `LanguageSwitcher.tsx` — 語言切換按鈕（EN/中）
- `src/types/` — TypeScript 型別定義
  - `game.ts` — CircuitId, Circuit, CircuitState, MultiCircuitState(+neutralCurrent/neutralHeat/mainBreakerTripTimer/totalPanelCurrent), WiringState, CircuitConfig(+phase/wetArea), Level(+phaseMode/leakageMode/leakageEvents/bonusCondition/oldHouse/randomDifficulty), LeakageEvent, SimulationStatus(+neutral-burned/elcb-tripped/leakage/main-tripped), BonusCondition, OldHouseProblemType(5 種), OldHouseProblem, PreWiredCircuit(+breaker?), OldHouseConfig, CircuitSnapshot, OldHouseSnapshot
  - `helpers.ts` — toLegacyState, worstStatus, createSingleCircuitLevel, isProblemResolved(+ProblemResolutionState)
- `src/engine/` — 模擬引擎邏輯
  - `simulation.ts` — 純函式模擬引擎（step, stepMulti(+phases+mainBreakerRating), calcTotalCurrent）
  - `scoring.ts` — 三星評分引擎（calcStars, loadBestStars, saveBestStars）
  - `audio.ts` — Web Audio API 提示音 + buzzing 預警音 + 電器運轉音
  - `randomOldHouse.ts` — 隨機老屋生成器（3 難度等級 + 可解性驗證）
- `src/data/` — 遊戲資料
  - `levels.ts` — L01-L28 關卡定義（L01-L05 單迴路教學, L06-L10 多迴路, L11-L12 相位平衡, L13-L15 ELCB, L16-L17 壓接端子, L18-L20 老屋驚魂, L21-L23 走線整理, L24-L25 老屋新問題, L26 五毒俱全, L27 翻修+整線, L28 終極考驗）— L06-L17/L21-L23 已改為 FreeCircuitLevel 格式
  - `constants.ts` — 6 種線材、13 種電器（v0.7 新增電暖器/烤箱/除濕機）、NFB 三規格（15A/20A/30A）+ NFB 成本、ELCB_COST、NEUTRAL_MAX_CURRENT、LEAKAGE_CHANCE_PER_SECOND、OXIDIZED_CONTACT_RESISTANCE
- `src/i18n.ts` — i18next 初始化（localStorage 持久化語言偏好 key: `rewire-lang`，預設 zh-TW）
- `src/i18nHelpers.ts` — 翻譯輔助函式（tApplianceName, tRoomName, tStatus, tCrimpQuality 等）
- `src/locales/` — 翻譯檔（zh-TW.json, en.json）
- `docs/` — PRD 與設計文件
- `openspec/` — OpenSpec 工作流程（changes、specs）

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — 建置生產版本
- `npm run lint` — ESLint 檢查

## Conventions

- 語言：程式碼用英文，註解與文件可用繁體中文
- OpenSpec 工作流程管理所有 change
- PRD 參考：`docs/project-rewire-prd-v0.1.md`、`docs/project-rewire-prd-v0.2.md`、`docs/project-rewire-prd-v0.4.md`、`docs/project-rewire-prd-v0.5.md`、`docs/project-rewire-prd-v0.6.md`、`docs/project-rewire-prd-v0.7.md`、`docs/project-rewire-prd-v0.8.md`
- 「更新 memory」= 更新此 CLAUDE.md 檔案
- **前端畫面設計**：凡牽涉 UI/UX 設計、元件樣式、佈局變更等前端畫面工作，MUST 使用 `/frontend-design` skill 產出設計方案
- **Change 實作完成後 MUST 提供人工測試指引**：每個 change 的所有 task 完成後，MUST 輸出一份簡明的手動測試步驟清單，包含：
  1. 啟動方式（`npm run dev`）
  2. **正向測試**：列出具體關卡編號 + 操作步驟 + 預期結果（看到什麼）
  3. **反向測試**：列出不應出現新功能的場景（確認沒有回歸）
  4. **響應式**：桌面 vs 手機版應有的差異
  5. **動畫/視覺**：需要肉眼確認的動畫效果描述

## Key Design Decisions

- NFB 跳脫閾值 = ratedCurrent × 1.25（台灣電工法規）
- 線材熱度模型: heatRate=0.4, coolRate=0.15（約 3 秒燒毀）
- 倒數計時器在 StatusDisplay 計算（remainingTime = survivalTime - elapsed），不改 SimulationState
- ResultPanel 為 inline 顯示（非 overlay），不遮蓋 SVG 燒毀特效
- ResultPanel 邊框顏色用 CSS variable `--result-border-color` 依結果類型變色
- 燒毀特效：電線斷裂缺口 14px + 銅芯 #d97706 + 絕緣皮翻開三角形 + 火焰粒子動畫
- 過載預警：buzzing 持續音（sawtooth 120Hz）+ 淡煙粒子（wireHeat ≥ 0.3）
- 電器運轉音：每種電器各有不同 Oscillator 音色，音量壓低 0.03-0.06
- 工業深色主題：CSS variable 系統（`:root` 定義 30+ variables），背景 #0a0c0f/#0f1318
- 響應式 layout：mobile ≤640px 單欄+水平滾動線材、tablet 641-1024px 兩欄、desktop ≥1025px 三欄 grid
- 關卡選擇 grid 排列：`auto-fill` + `minmax(260px, 1fr)`，容器 max-width 1200px，桌面 4 欄/平板 2 欄/手機 1 欄
- ResultPanel 自動 scrollIntoView({ behavior: 'smooth', block: 'nearest' })
- 電路圖 SVG 響應式：width="100%" maxWidth=260（單迴路），多迴路 maxWidth = min(n, MAX_CIRCUITS_PER_ROW) × 260
- 多迴路架構：CircuitDiagram 內 SingleCircuitSVG 子元件，一排最多 MAX_CIRCUITS_PER_ROW=4 個，超過自動換行（CIRCUIT_WIDTH=200, ROW_GAP=20）
- 4+ 迴路桌面版：game-board max-width 加寬至 1500px，維持三欄佈局
- 拖曳接線：Pointer Events API（非 HTML5 DnD），WiringState 集中管理於 GameBoard
- 拖曳 drop zone：SVG 座標判定 row+col→circuitIndex（支援多行），onTargetCircuitChange 回調
- 拖曳流程：pointerdown 設 capture → 移動超閾值啟動拖曳 → releaseCapture + global listeners → elementFromPoint 偵測 drop zone
- 觸控長按 150ms 啟動拖曳，移動 >10px 取消長按（避免與捲動衝突）
- 電路圖三態：未接線（灰色虛線+提示文字）→ 拖曳中預覽（彩色虛線跟隨游標）→ 已接線（實線+閃光動畫）
- 線材顏色依線徑區分：1.6mm²藍、2.0mm²綠、3.5mm²黃、5.5mm²橘、8.0mm²紅、14mm²紫
- 送電前置條件：所有迴路都已接線（isWired = 衍生值）才能啟用 NFB 開關
- 全域送電開關（非獨立 per-circuit NFB），未來可擴展
- AppliancePanel 多迴路：circuit-tabs 選擇目標迴路 + availableAppliances 過濾
- 成本計算（固定迴路）：totalCost = Σ(wire.costPerMeter × DEFAULT_WIRE_LENGTH) + Σ(hasElcb ? ELCB_COST : 0)
- 成本計算（自由配迴路）：totalCost = Σ(wire cost + NFB cost + ELCB cost)，NFB 收費 15A=$10/20A=$15/30A=$20
- ELCB 成本框架：CircuitConfig.elcbAvailable 控制顯示、per-circuit toggle、$35/迴路
- NFB 多規格：BREAKER_15A/20A/30A 命名常數，DEFAULT_BREAKER = BREAKER_20A（向後相容）
- 自由配迴路：玩家自建迴路（選電壓/NFB/相位）→ 指派電器 → 選線 → 壓接/走線 → 送電
- 自由配迴路約束：配電箱插槽上限 + 主開關額定容量（跳脫=遊戲失敗）
- 主開關跳脫：totalPanelCurrent > mainBreakerRating × 1.25 累積 1.5s → main-tripped（severity=3）
- totalPanelCurrent = Σ 非終態迴路的 totalCurrent，存於 MultiCircuitState
- 主開關負載指示器：StatusDisplay 顯示「主開關：XA / YA」，≥80% 橘色、≥100% 紅色，僅 FreeCircuitLevel 顯示
- Level union type：FixedCircuitLevel（有 circuitConfigs）| FreeCircuitLevel（有 rooms + panel）
- L01-L05 / L18-L20 / L24-L28 維持固定迴路，L06-L17 / L21-L23 改為自由配迴路
- L26 五毒俱全：4 迴路 + 全 5 種問題（c1 雙問題 wrong-wire-gauge + overrated-breaker）+ 手動相位 + 隨機漏電
- L27 翻修+整線：oldHouse + routingMode 整合，修復完才能進入走線，aesthetics-score bonus
- L28 終極考驗：5 迴路 + 4 問題 + 相位 + 漏電 + 走線 = 全機制綜合
- 老屋+走線整合：routingReady 需 !problemsRemaining，問題全修復+接線完成才能進入整線階段
- 隨機老屋生成器：generateRandomOldHouse(difficulty: 1|2|3)，budget = 修復成本 × 1.3
- 隨機老屋 3 級難度：初級 2-3 迴路/中級 3-4 迴路+全問題/高級 4-6 迴路+相位+漏電+走線
- 隨機老屋通關紀錄：localStorage key=`rewire-random-completions`，value=Record<string, number>，不追蹤星等
- CircuitCard 相位選擇器：phaseMode 存在 + 110V 時顯示 R/T toggle，auto 模式 disabled（自動交替分配），manual 模式 enabled
- CircuitCard ELCB toggle：迴路含 wetArea 房間電器時顯示，wetArea 迴路必須啟用 ELCB 才能確認配置
- PlannerCircuit 擴充：phase?: 'R' | 'T'（110V 迴路）、elcbEnabled?: boolean（wetArea 迴路）
- 相位平衡預估：CircuitPlanner 摘要區即時計算 R/T/N 電流，N 線 >= 30A 紅色警告
- 規劃→模擬轉換：confirmPlanning 提取 phase → circuitPhases、elcb → circuitElcb，生成 CircuitConfig 含 phase/wetArea/elcbAvailable
- scripted leakageEvent 動態映射：FreeCircuitLevel 的 leakageEvent circuitId 在確認配置時解析為含 wetArea 電器的實際迴路 ID（resolvedLeakageEventsRef）
- 移除 wetArea 電器時自動清除 elcbEnabled
- buzzing 音效：任一迴路 warning 時觸發，音量 = max wireHeat across all circuits
- 相位平衡：單相三線制 R-N(110V) / T-N(110V) / R-T(220V)，中性線電流 I_N = |Σ I_R − Σ I_T|
- 中性線熱度：同 wire heat model（heatRate=0.4, coolRate=0.15），NEUTRAL_MAX_CURRENT=30A
- SimulationStatus: neutral-burned 與 burned 同權重（severity=3）
- phaseMode: auto=固定不可切換、manual=玩家可切換 R↔T（未送電時）
- 220V 迴路無 phase（跨相 R-T），不計入中性線電流
- ELCB 漏電保護：wetArea 迴路強制安裝 ELCB 才能送電
- 漏電事件：腳本式（固定時間觸發）或隨機式（LEAKAGE_CHANCE_PER_SECOND=0.05，每秒 5%）
- ELCB 跳脫 = elcb-tripped（severity=2，同 tripped），迴路斷電但不算失敗
- 無 ELCB 漏電 = leakage（severity=3，同 burned），即時觸電失敗
- 漏電事件由 GameBoard rAF loop 驅動（非 simulation engine），保持純函式語義
- 乾燥迴路永不觸發漏電事件
- 三星評分：1星=安全通關、2星=成本達標(≤budget)、3星=bonusCondition達成（累進制）
- BonusCondition 5 種類型：no-warning / under-budget-ratio / time-margin / crimp-quality / no-trip
- 星等計算為純函式（scoring.ts），GameBoard 結果判定時呼叫
- warning/trip 追蹤用 useRef flag，rAF loop 中累積偵測
- 星等 localStorage 持久化：key=`rewire-stars`，value=`Record<number, 0|1|2|3>`
- 老屋模式：Level.oldHouse 可選擴展，GameBoard handleSelectLevel 偵測後初始化預接線
- 老屋 5 種問題：bare-wire（無端子）、wrong-wire-gauge（線太細）、oxidized-splice（氧化接點 contactResistance=2.0）、overrated-breaker（NFB 超過線材容量）、missing-elcb（潮濕區域缺 ELCB）
- 老屋預接線：preWiredCircuits 定義每迴路的 wire/crimpQuality/appliances，進入時自動初始化
- 拆線操作：window.confirm 確認後清除 wire/crimp/appliances，從 preWiredCircuitIds 移除
- 老屋成本規則：保留原線（preWiredCircuitIds 中）免費，僅替換的新線計成本
- 問題修復判定：isProblemResolved 統一函式，舊問題（拆線→重新接線→壓接）、overrated-breaker（換 NFB ≤ 線材 maxCurrent）、missing-elcb（啟用 ELCB）
- circuitBreakers state：per-circuit Breaker 追蹤，覆寫 CircuitConfig.breaker，用於 Circuit[] memo 建構
- BreakerSelector：NFB 點擊彈出，三卡片（15A/20A/30A），相容性標示（✓/⚠️），當前規格 disabled
- overrated-breaker 視覺：NFB 紅框 + ⚠️ + 提示文字「NFB XA > 線材 YA」
- missing-elcb 視覺：💧⚠️ + 提示文字「潮濕區域需裝 ELCB」
- 老屋送電前置：problemCircuits 為空才能送電
- 問題迴路視覺：閃爍橘色邊框 + ⚠️ 圖示，oxidized-splice 暗褐色(#6b4423)線材
- 拆線按鈕：僅 preWiredCircuitIds 中的迴路顯示（修復後不再出現）
- 電器指派迴路選取：點選 CircuitCard 高亮為「選取中」（琥珀色邊框），電器指派優先到選取迴路（驗證電壓匹配），未選取+單一匹配自動指派，未選取+多匹配不指派
- Before/After 對比：老屋關卡通關時顯示修復前後對比（ResultPanel 下方），OldHouseSnapshot useState 擷取初始狀態
- Before/After 佈局：CSS Grid 兩欄（>640px 並排、≤640px 堆疊），Before 紅色系 / After 綠色系
- Before/After 動畫：整體 fadeIn 0.5s + After 側 ✓ 逐項 popIn（staggered delay 0.15s）
- 修復摘要：generateRepairItems 純函式，依 5 種問題類型生成 before 描述和 after 修復描述
- i18n：react-i18next，zh-TW（預設）+ en 雙語，語言偏好 localStorage key=`rewire-lang`
- i18n 翻譯輔助：i18nHelpers.ts 提供 tApplianceName/tRoomName/tStatus 等便利函式
- 語言切換器：LevelSelect 標題旁 EN/中 按鈕，LanguageSwitcher 元件

## Testing Workflow

每個 change 實作完成後，正式交付人類測試前，MUST 用 agent-browser 執行 smoke test：

### agent-browser 負責驗證（自動化適合的項目）
- UI 渲染：各元件是否正確顯示、文字內容是否正確
- 頁面流程：關卡選擇 → 進入遊戲 → 操作 → 結果顯示的基本 flow
- 按鈕狀態：disabled/enabled 條件是否正確
- 響應式：截圖桌面版與手機版（viewport 640px），確認 layout 切換
- 回歸測試：既有功能未被破壞（送電、跳電、燒線、過關流程）
- 視覺狀態截圖：各關鍵狀態的截圖留存比對

### 人類負責驗證（自動化不適合的項目）
- 拖曳/手勢操作的手感與流暢度
- 觸控裝置（手機/平板）的實際操作體驗
- 音效的聽感與時機
- 動畫的視覺感受（流暢度、節奏感）
- 整體遊戲體驗與沉浸感

### 流程
1. 實作完成 → agent-browser smoke test → 修復發現的問題
2. smoke test 通過 → 人類體驗測試 → 回饋修正
3. 全部通過 → opsx:archive

## Deployment

- **GitHub Pages**: https://kewang.github.io/rewire/
- Push 到 `master` 自動透過 GitHub Actions 建置部署
- Vite `base: '/rewire/'` 確保靜態資源路徑正確
- Workflow: `.github/workflows/deploy.yml`

## Known Issues / Notes

- 電器音效目前用 Web Audio API 合成，未來可換真實音檔提升品質
- L05/L07 voltage bug 已於 v0.7 new-appliances-and-nfb-cost 修復
