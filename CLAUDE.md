# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

**PRD v0.2 完成。v0.3 全部完成。v0.4 全部完成（FR-G ✓ → FR-E ✓ → FR-F ✓）。v0.5 全部完成（crimp-terminal-system ✓ → level-select-grid-layout ✓ → star-rating-system ✓ → old-house-intro ✓）。v0.6 全部完成（routing-ux-guide ✓ → panel-visual-and-cable-tie ✓ → fix-multi-circuit-svg-sizing ✓）。v0.7 全部完成（new-appliances-and-nfb-cost ✓ → free-circuit-data-model ✓ → circuit-planner-ui ✓ → main-breaker-simulation ✓ → planner-phase-elcb ✓ → free-circuit-levels ✓ → level-balance-tuning ✓）。v0.8 全部完成（new-old-house-problems ✓ → before-after-view ✓ → old-house-routing-integration ✓ → random-old-house ✓）。i18n 六語 ✓（zh-TW/en/ja/ko/fr/th）。v0.9 全部完成（平面圖模式 9/9 changes ✓）。CSS polish ✓（未定義變數修復 + focus-visible + 硬編碼顏色統一）。**

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- react-i18next（六語 i18n：zh-TW/en/ja/ko/fr/th）
- SVG 視覺化（CircuitDiagram 元件）
- Web Audio API 音效（無外部音檔）
- 無狀態管理庫（useState + useRef + rAF loop）
- Google Fonts: Orbitron (display) + JetBrains Mono (mono)

## Project Structure

- `src/components/` — React 元件
  - `GameBoard.tsx` — 主遊戲控制器，rAF 驅動，多迴路狀態管理（circuitWires/circuitAppliances per-circuit）+ 老屋模式（problemCircuits/preWiredCircuitIds/handleUnwire/circuitBreakers/handleChangeBreaker）+ 自由配迴路規劃（plannerCircuits/handleChangePhase/handleChangeElcb/resolvedLeakageEvents/selectedPlannerCircuitId）+ 平面圖走線互動（circuitRoutingStrategies/circuitRouteDistances/circuitRoutePaths/pendingRoutingCircuit/candidateRoutes/floorPlanHighlightedRoomRef）+ 平面圖模擬狀態傳遞（floorPlanSimulationState/floorPlanProblemRooms/floorPlanRoomCircuitMap useMemo）+ 平面圖 layout 切換（fp-layout: CircuitPlannerSidebar + FloorPlanView + WireToolbar / legacy: 三欄 layout）+ 迴路指派互動（handleFloorPlanRoomClick/handleAssignRoomToCircuit/handleAddCircuitAndAssignRoom/roomPopover/CircuitAssignmentPopover）
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
  - `LanguageSwitcher.tsx` — 語言切換下拉選單（6 語：zh-TW/en/ja/ko/fr/th）
  - `FloorPlanView.tsx` — 平面圖 SVG 渲染元件（房間色塊+名稱+💧潮濕標記+插座圓形+⚡配電箱+走線路徑+距離標籤+共用牆段偏移+響應式 viewBox+互動 props: onRoomClick/onRoomHover/highlightedRoomId/dragActive+模擬狀態視覺: 房間 glow/warning/tripped/burned+路徑 wireHeat 色彩+電流流動動畫+老屋問題 badge）
  - `FloorPlanPreview.tsx` — 開發驗證用平面圖預覽（4 種房型 + mock 迴路分配 + 走線路徑展示）
  - `RoutingStrategyPicker.tsx` — 走線策略選擇 overlay（星形/串聯雙卡片 + 距離/成本 + SVG 示意圖標 + i18n 六語）
  - `CircuitPlannerSidebar.tsx` — 平面圖規劃側欄（可收合 280px/48px + 精簡版迴路卡片 + 配電箱摘要 + 確認按鈕）
  - `WireToolbar.tsx` — 平面圖底部線材工具列（6 張線材卡片橫排 + 送電按鈕 + Pointer Events 拖曳）
  - `CircuitAssignmentPopover.tsx` — 房間迴路指派 popover（迴路列表 + 新增迴路 + 取消指派 + click-outside 關閉）
- `src/types/` — TypeScript 型別定義
  - `game.ts` — CircuitId, Circuit, CircuitState, MultiCircuitState(+neutralCurrent/neutralHeat/mainBreakerTripTimer/totalPanelCurrent), WiringState, CircuitConfig(+phase/wetArea), Level(+phaseMode/leakageMode/leakageEvents/bonusCondition/oldHouse/randomDifficulty), LeakageEvent, SimulationStatus(+neutral-burned/elcb-tripped/leakage/main-tripped), BonusCondition, OldHouseProblemType(5 種), OldHouseProblem, PreWiredCircuit(+breaker?), OldHouseConfig, CircuitSnapshot, OldHouseSnapshot
  - `helpers.ts` — toLegacyState, worstStatus, createSingleCircuitLevel, isProblemResolved(+ProblemResolutionState)
  - `floorPlan.ts` — FloorPlanOutlet, FloorPlanRoom, RoutingNode, RoutingEdge, RoutingGraph, FloorPlan 型別定義
- `src/engine/` — 模擬引擎邏輯
  - `simulation.ts` — 純函式模擬引擎（step, stepMulti(+phases+mainBreakerRating), calcTotalCurrent）
  - `scoring.ts` — 三星評分引擎（calcStars, loadBestStars, saveBestStars）
  - `audio.ts` — Web Audio API 提示音 + buzzing 預警音 + 電器運轉音
  - `routing.ts` — 走線路由引擎（Dijkstra 最短路徑 + 星形/串聯候選方案 + 距離成本計算）
  - `randomOldHouse.ts` — 隨機老屋生成器（3 難度等級 + 可解性驗證 + FloorPlan 整合 + Dijkstra 距離成本）
- `src/data/` — 遊戲資料
  - `levels.ts` — L01-L31 關卡定義（L01-L05 單迴路教學+FLOOR_PLAN_S, L06-L10 多迴路+FLOOR_PLAN_M, L11-L12 相位平衡+M, L13-L15 ELCB+M, L16-L17 壓接端子+M, L18-L20 老屋驚魂+FLOOR_PLAN_L, L21-L23 走線整理+M, L24-L25 老屋新問題+L, L26 五毒俱全+L, L27 翻修+整線+L, L28 終極考驗+L, L29 豪宅配電+FLOOR_PLAN_XL, L30 豪宅翻修+XL, L31 終極豪宅+XL）— L06-L17/L21-L23 已改為 FreeCircuitLevel 格式
  - `constants.ts` — 6 種線材、13 種電器（v0.7 新增電暖器/烤箱/除濕機）、NFB 三規格（15A/20A/30A）+ NFB 成本、ELCB_COST、NEUTRAL_MAX_CURRENT、LEAKAGE_CHANCE_PER_SECOND、OXIDIZED_CONTACT_RESISTANCE
  - `floorPlans.ts` — 4 種預設房型常數（FLOOR_PLAN_S/M/L/XL）+ RoutingGraph 定義
- `src/i18n.ts` — i18next 初始化 + SUPPORTED_LANGUAGES export（localStorage 持久化語言偏好 key: `rewire-lang`，預設 zh-TW）
- `src/i18nHelpers.ts` — 翻譯輔助函式（tApplianceName, tRoomName, tStatus, tCrimpQuality 等）
- `src/locales/` — 翻譯檔（zh-TW.json, en.json, ja.json, ko.json, fr.json, th.json）
- `docs/` — PRD 與設計文件
- `openspec/` — OpenSpec 工作流程（changes、specs）

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — 建置生產版本
- `npm run lint` — ESLint 檢查

## Conventions

- 語言：程式碼用英文，註解與文件可用繁體中文
- OpenSpec 工作流程管理所有 change
- PRD 參考：`docs/project-rewire-prd-v0.1.md`、`docs/project-rewire-prd-v0.2.md`、`docs/project-rewire-prd-v0.4.md`、`docs/project-rewire-prd-v0.5.md`、`docs/project-rewire-prd-v0.6.md`、`docs/project-rewire-prd-v0.7.md`、`docs/project-rewire-prd-v0.8.md`、`docs/project-rewire-prd-v0.9.md`
- 「更新 memory」= 更新此 CLAUDE.md 檔案
- **前端畫面設計**：凡牽涉 UI/UX 設計、元件樣式、佈局變更等前端畫面工作，MUST 使用 `/frontend-design` skill 產出設計方案
- **Archive 後 MUST 更新相關文件並 commit**：每次 `opsx:archive` 完成後，MUST 執行以下步驟：
  1. 更新 `CLAUDE.md`（版本進度、Project Structure、Key Design Decisions 等相關段落）
  2. 更新 `MEMORY.md`（同步專案概覽、已完成的 Changes、關鍵架構等）
  3. 將所有變更（程式碼 + archive + 文件更新）一起 commit
- **Change 實作完成後 MUST 提供人工測試指引**：每個 change 的所有 task 完成後，MUST 輸出一份簡明的手動測試步驟清單，包含：
  1. 啟動方式（`npm run dev`）
  2. **正向測試**：列出具體關卡編號 + 操作步驟 + 預期結果（看到什麼）
  3. **反向測試**：列出不應出現新功能的場景（確認沒有回歸）
  4. **響應式**：桌面 vs 手機版應有的差異
  5. **動畫/視覺**：需要肉眼確認的動畫效果描述

- **Lint 零容忍**：每次 `npm run lint` 出現任何 error/warning，不論是否為自己引入的，都 MUST 當場修復。不可跳過或標註「既有問題」。

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
- i18n：react-i18next，zh-TW（預設）+ en/ja/ko/fr/th 六語，語言偏好 localStorage key=`rewire-lang`
- i18n 翻譯輔助：i18nHelpers.ts 提供 tApplianceName/tRoomName/tStatus 等便利函式
- 語言切換器：LevelSelect 標題旁下拉選單（SUPPORTED_LANGUAGES 驅動，點擊外部收合）
- v0.9 平面圖模式：FloorPlanView 取代 CircuitDiagram 作為主視圖
- 平面圖房型：S(4×4套房)/M(6×4兩房)/L(8×6三房)/XL(10×6豪宅)，色塊方格渲染
- 空間走線：RoutingGraph 沿牆路徑圖 + Dijkstra 自動路由 + 星形/串聯候選選擇
- 走線距離影響成本：cost = wire.costPerMeter × routeDistance（取代固定 DEFAULT_WIRE_LENGTH）
- 配電箱操作：點擊平面圖上的配電箱 → PanelInteriorView overlay 展開
- RoutingGraph 通用設計：FloorPlanOutlet.type 含 'power' | 'network'，為 v1.0 弱電預留
- FloorPlanView SVG：cellSize=80px grid→pixel 轉換、ROOM_GAP=3px 內牆間隙、WALL_PADDING=4px 外圍、WALL_THICKNESS=5px 外牆
- FloorPlanView 房間狀態：未指派（#1a1f2e + 灰色虛線邊框）/ 已指派（迴路色邊框 + 透明迴路色填充）
- FloorPlanView 路徑渲染：候選路徑（虛線 opacity=0.4 + 距離標籤）/ 已選路徑（實線 opacity=0.8 + wireColor + glow underlay）
- FloorPlanView 共用牆段偏移：buildSegSharing 偵測 + PATH_OFFSET_STEP=4px 垂直偏移
- CIRCUIT_COLORS：8 色迴路調色盤（amber/blue/emerald/rose/violet/cyan/orange/lime）
- 配電箱圖示：SVG rect + ⚡ + hover glow filter（feGaussianBlur + feFlood amber）
- FloorPlanView i18n：tRoomName 新增 8 房間（主臥/次臥/玄關/餐廳/主浴/客浴/更衣室/小孩房）
- FloorPlanView 互動 props：onRoomClick/onRoomHover/highlightedRoomId/dragActive，房間作為 wire drop zone
- FloorPlanView 房間 highlight：已指派房間 glow 邊框（fp-room-glow SVG filter）、未指派房間紅色提示（fp-room-invalid filter）
- 平面圖走線互動：拖曳線材到房間 → roomToCircuitMap 查找迴路 → 單房間 auto direct / 多房間顯示 RoutingStrategyPicker
- RoutingStrategyPicker：overlay 雙卡片（星形/串聯）+ 距離/成本 + inline SVG 示意圖標 + i18n routing.* keys
- 平面圖成本計算：circuitRouteDistances 存在時用 costPerMeter × routeDistance，否則 fallback DEFAULT_WIRE_LENGTH
- 平面圖條件渲染：currentFloorPlan 存在 → FloorPlanView，否則 → CircuitDiagram（向後相容）
- 走線策略選擇後觸發 crimp：requiresCrimp 關卡先選策略再壓接（非同時）
- 線材替換清除走線：替換線材時清除 routingStrategy/routeDistance/routePaths，多房間重新觸發策略選擇
- FloorPlanSimulationState 介面：isPowered + circuitStates(Record<CircuitId, {status, wireHeat, totalCurrent}>) + mainTripped，由 GameBoard useMemo 從 multiState 萃取
- FloorPlanView 房間模擬狀態：powered-normal(warm glow SVG filter) / warning(橘色脈動 fp-room-warning-pulse) / tripped(opacity 0.3) / burned(紅色閃爍 fp-room-burned-flash) / mainTripped(全暗)
- FloorPlanView 路徑模擬色：wireHeat < 0.3 原色 / 0.3-0.7 橘漸變 / ≥ 0.7 紅漸變，burned=紅+opacity 0.2，tripped=灰+opacity 0.3，CSS transition 0.3s
- FloorPlanView 電流流動動畫：SVG strokeDasharray="6 20" overlay path + CSS @keyframes fp-current-flow (strokeDashoffset)，僅 isPowered && normal/warning 時顯示
- FloorPlanView 老屋問題 badge：problemRooms prop → 房間右上角 ⚠️ SVG text + fp-problem-flash 動畫 + `<title>` tooltip
- 平面圖送電按鈕：fp-power-button 在 panel-left 區域，「⚡ 送電」/「⏹ 斷電」toggle，disabled 時 tooltip 提示缺少條件
- GameBoard 模擬狀態傳遞：3 個 useMemo（floorPlanSimulationState / floorPlanProblemRooms / floorPlanRoomCircuitMap）→ FloorPlanView props
- lerpColor 輔助函式：hex 色彩線性插值，用於 wireHeat 連續色彩映射
- getRoomSimState 輔助函式：roomId → roomCircuitMap → simulationState → RoomSimState('none'|'powered'|'warning'|'tripped'|'burned')
- v0.9 平面圖 layout 切換：currentFloorPlan 存在 → fp-layout（sidebar + FloorPlanView + WireToolbar），否則 → legacy 三欄 layout
- CircuitPlannerSidebar：可收合側欄（展開 280px / 收合 48px），精簡版 CircuitCard + 配電箱摘要 + 確認按鈕，規劃階段展開、接線階段收合
- WireToolbar：固定底部工具列（h=64px），6 張線材卡片橫排 + 右側送電按鈕，Pointer Events 拖曳 + 觸控長按 150ms，drop zone 偵測 .floor-plan-view
- CircuitAssignmentPopover：房間點擊彈出 popover，fixed 定位（clamp 到 viewport），迴路列表 + 色塊 + 電壓 + 新增迴路 + 取消指派，click-outside 關閉
- 平面圖迴路指派流程：點房間 → popover 選迴路 / 新增迴路（自動指派房間電器）/ 取消指派；已選中 sidebar 迴路時 → quick-assign
- 無電器房間不可點擊：handleFloorPlanRoomClick 檢查 level.rooms 中是否有電器
- 平面圖確認配置後需接線：floorPlan 關卡 confirmPlanning 設 isWired: false，強制拖曳線材到房間觸發走線路由
- floorPlanHighlightedRoomRef：用 ref 避免 handleDragEnd 中 React 批次更新導致的 stale closure
- handleAddCircuitAndAssignRoom：popover「新增迴路」一次完成建立迴路 + 指派房間電器（單一 setPlannerCircuits 呼叫）
- FloorPlanView 電器 badge：房間右下角 SVG rect+text "N⚡"，顏色跟隨迴路指派色，hover tooltip 顯示電器名稱+功率
- 平面圖關卡分配：L01-L05→FLOOR_PLAN_S、L06-L17/L21-L23→FLOOR_PLAN_M、L18-L20/L24-L28→FLOOR_PLAN_L、L29-L31→FLOOR_PLAN_XL
- FixedCircuitLevel + floorPlan 相容：GameBoard 用 config.label 匹配 room.id 或 room.label 建立 roomCircuitMap
- FreeCircuitLevel room ID 標準化：living→living-room、bedroom→master-bedroom、storage→entrance、laundry→second-bedroom、ac→master-bedroom、balcony→second-bedroom
- 距離影響預算：floorPlan 啟用後 wire cost = costPerMeter × routeDistance（Dijkstra 最短路徑）
- L29 豪宅配電：FreeCircuitLevel + XL + 11 房間 + 14 電器 + 8 插槽/100A + manual phaseMode + random leakage + crimp
- L30 豪宅翻修：FixedCircuitLevel + XL + 6 迴路 + oldHouse(5問題) + routing + aesthetics-score bonus
- L31 終極豪宅：FixedCircuitLevel + XL + 7 迴路 + oldHouse(6問題) + 全機制 + under-budget-ratio 0.75
- 隨機老屋 FloorPlan 整合：難度1→FLOOR_PLAN_S、難度2→FLOOR_PLAN_M、難度3→FLOOR_PLAN_L
- 隨機老屋 room 分配：從 FloorPlan rooms 隨機選取，wetArea 迴路分配到 wetArea 房間，label 使用 room.id
- 隨機老屋距離成本：findShortestPath(routingGraph, 'panel', 'outlet-{roomId}') 取代 DEFAULT_WIRE_LENGTH，fallback 保留
- GameBoard problemCircuits：useMemo 衍生（非 useState + useEffect），避免 cascading render
- v0.9 floor-plan-polish 響應式：fp-layout @media 640px（垂直堆疊）/ 1024px（sidebar 220px）
- Sidebar mobile auto-collapse：GameBoard useState(() => window.innerWidth <= 640) 初始化（避免 React strict mode toggle 問題）
- Sidebar mobile overlay：fixed 定位 z-index:200 + .sidebar-backdrop rgba(0,0,0,0.5) + 點擊收合
- WireToolbar scroll 提示：.wire-toolbar__cards-wrap::after 漸層遮罩 + ResizeObserver 偵測溢出
- Popover 入場動畫：translateY(8px→0) + opacity(0→1), 0.15s ease-out
- Popover viewport clamping：8px safe margin + fitsBelow 判斷翻轉
- Power button pulse：:active scale(1→1.05→1) @keyframes power-pulse 0.2s
- 距離標籤背景：rx=4 圓角 + rgba(0,0,0,0.8) + stroke rgba(255,255,255,0.12) 微邊框

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
