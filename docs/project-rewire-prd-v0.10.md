# PRD v0.10 — Project Rewire（工程品質與體驗優化）

## 0. 版本摘要

v0.10 建立在 v0.9 已完成的基礎上（31 關 + 隨機老屋、平面圖模式、六語 i18n、完整遊戲機制），聚焦於**工程品質**與**使用者體驗**的全面提升：

- 降低 bundle 大小、加快首屏載入（初始 chunk 531→241 KB）
- 拆解巨型元件與 CSS，提升可維護性（GameBoard 1958→622 行、App.css 3693→396 行）
- 補齊使用者缺少的基本控制（音量、錯誤處理）
- 載入畫面取代白屏等待
- 補齊純函式單元測試基礎設施
- CSS 清理（未定義變數修復 + focus-visible + 硬編碼顏色統一）

> v0.1–v0.9 所有功能需求維持不變，本文件僅描述**增量（delta）**內容。

> **FR-L-F（PWA 支援）與 FR-L-H（Accessibility 深化）延後至未來版本。**


## 1. 產品目標（This release）

1. **效能優化**：JS bundle 初始 chunk 從 531 KB 降至 241 KB ✅
2. **程式碼健康**：GameBoard（1958 行）拆分為 622 行 + 6 custom hooks；App.css（3693 行）抽取為 20 個元件 CSS + 396 行共用樣式 ✅
3. **使用者控制**：音量調節 / 靜音 toggle ✅
4. **穩健性**：Error Boundary 防止白屏 ✅
5. **首印象**：載入畫面取代白屏等待 ✅
6. **測試基礎**：純函式單元測試覆蓋核心引擎 ✅
7. **佈局修復**：平面圖模式 ResultPanel 佈局修復 ✅
8. **CSS 整理**：未定義變數修復 + focus-visible + 硬編碼顏色統一 ✅

### 延後項目
- ~~PWA 支援~~（FR-L-F）— 延後至未來版本
- ~~Accessibility 深化~~（FR-L-H）— 僅完成 css-polish（focus-visible + active），ARIA/鍵盤導航/Screen Reader 延後

### 非目標（Not in v0.10）
- 不做弱電 / 網路線系統
- 不做段落級故障模擬（串聯中段燒斷→下游斷電）
- 不做 3D / 等角視角
- 不做使用者自訂房型 / 關卡編輯器
- 不做多人 / 排行榜功能


## 2. 功能需求（Functional Requirements）

### FR-L-A：Code-splitting（延遲載入）✅

將非首屏元件以 `React.lazy` + `Suspense` 延遲載入，降低初始 JS bundle 大小。

#### 延遲載入元件
| 元件 | 理由 |
|------|------|
| `CircuitDiagram` | 僅 legacy（非平面圖）關卡使用 |
| `PanelInteriorView` | 僅走線整理關卡使用 |
| `CrimpMiniGame` | 僅壓接關卡使用 |
| `BeforeAfterView` | 僅老屋通關時使用 |
| `RoutingStrategyPicker` | 僅走線策略選擇時使用 |
| `BreakerSelector` | 僅老屋 NFB 更換時使用 |

#### 額外優化
- `FloorPlanPreview`：`import.meta.env.DEV` 條件 guard，production build tree-shake 移除
- Vite `manualChunks`：vendor（react/react-dom/scheduler）+ i18n（i18next/react-i18next）分離

#### 驗收條件
- [x] 初始 JS chunk 531→241 KB（gzip 前）
- [x] overlay 類元件 `fallback={null}`，CircuitDiagram 用 `.lazy-loading-spinner` 旋轉動畫
- [x] `FloorPlanPreview` 在生產 build 中不被包含


### FR-L-B：GameBoard 重構（Custom Hooks 抽取）✅

將 GameBoard.tsx（1958 行）的邏輯拆分為獨立 custom hooks，元件本體僅負責組裝與渲染。

#### 抽取結果
| Hook | 職責 |
|------|------|
| `usePlannerState` | plannerCircuits、phase/elcb toggle、confirmPlanning、roomToCircuitMap |
| `useCircuitState` | circuitWires/Appliances/Crimps/Phases/Elcb、wiring state、接線操作、circuits useMemo |
| `useOldHouseLogic` | problemCircuits、preWiredCircuitIds、circuitBreakers、拆線/修復/BreakerSelector |
| `useRoutingOverlay` | circuitLanes/cableTies/aestheticsScore、拖曳/束帶 handlers |
| `useSimulationLoop` | rAF loop、multiState/isPowered/result/starResult、漏電事件/buzzing/終態判定 |
| `useFloorPlanInteraction` | routeDistances/Paths、候選路線、房間 popover、模擬狀態衍生 useMemo |

#### 循環依賴解法
GameBoard 頂層建立 3 個共用 ref（`initiateFloorPlanWiringRef` / `floorPlanHighlightedRoomRef` / `circuitRouteDistancesRef`），傳給需要的 hooks。

#### 驗收條件
- [x] GameBoard.tsx 降至 622 行（1958→622，68% 減少）
- [x] 6 個 hook 獨立檔案，放置於 `src/hooks/`
- [x] 行為與重構前完全一致（零功能變更）
- [x] lint 通過、build 通過


### FR-L-C：CSS 抽取 ✅

將單體 `App.css`（3693 行）拆分為 per-component CSS 獨立檔案，降低心智負擔與衝突風險。

#### 拆分策略

**方案：Per-component CSS 獨立檔案**
- 每個元件一個 `.css` 檔案，元件 import 自己的 CSS
- `:root` CSS variables 保留在 `src/index.css`
- 全域共用樣式（ELCB Panel/Phase Balance/Cards/circuit-tabs/voltage-badge/wire-card/responsive）保留在 `App.css`

#### 實作分批
| 批次 | 元件 | 檔案數 |
|------|------|--------|
| batch 1 | LevelSelect / LanguageSwitcher / ErrorFallback | 3 |
| batch 2 | GameBoard / VolumeControl | 2 |
| batch 3 | StatusDisplay / ResultPanel / BeforeAfterView | 3 |
| batch 4 | CircuitDiagram / CrimpMiniGame / PanelInteriorView / CircuitPlanner / RoomPanel / CircuitCard / BreakerSelector / FloorPlanView / CircuitAssignmentPopover / CircuitPlannerSidebar / WireToolbar / RoutingStrategyPicker | 12 |

#### 驗收條件
- [x] `App.css` 從 3693 行降至 396 行（共用樣式）
- [x] 20 個元件 CSS 獨立檔案
- [x] 視覺呈現與重構前完全一致
- [x] lint 通過、build 通過


### FR-L-D：音量控制 ✅

新增音效控制 UI，讓玩家可調整音量或靜音。

#### 功能規格
- `src/engine/audio.ts` 新增 `masterGain` node 串接所有音效
- `setMasterVolume(0–1)` / `setMuted(boolean)` API
- 遊戲畫面 header 區域顯示 VolumeControl 元件（4 處：planning fp/legacy + active fp/legacy）
- speaker icon SVG 三態（高音量/低音量/靜音斜線）+ range slider
- 點擊 icon 切換靜音 / 恢復
- 音量設定 localStorage 持久化（key: `rewire-volume`，JSON { volume, muted }）
- 預設音量 50%，滑桿拉到 0 自動 mute，unmute 時 volume=0 恢復 0.5

#### 驗收條件
- [x] 靜音時所有音效（提示音 + buzzing + 電器音）完全靜默
- [x] 音量滑桿即時生效（無需重新送電）
- [x] 重新整理後音量設定保留
- [x] 不影響遊戲效能（不額外建立 AudioContext）


### FR-L-E：Error Boundary ✅

React Error Boundary 攔截渲染錯誤，避免整個遊戲白屏。

#### 功能規格
- 兩層架構：App 層（hardcode 英文，不依賴 i18n）+ GameBoard 層（i18n 六語）
- 錯誤時顯示友善訊息 + 「回到關卡選擇」按鈕
- console.error 記錄完整 stack trace
- 深色主題 fallback UI

#### 驗收條件
- [x] 模擬元件 throw Error 時不白屏
- [x] 顯示錯誤 fallback UI + 回到首頁按鈕
- [x] 錯誤訊息翻譯完整（六語）


### FR-L-F：PWA 支援 ⏳ 延後

> 延後至未來版本。原規劃包含 manifest.json、Service Worker、離線遊玩、安裝提示。


### FR-L-G：載入畫面 ✅

首次載入時顯示品牌 loading 畫面，取代白屏等待。

#### 功能規格
- `index.html` 內聯 CSS + HTML（不依賴 JS bundle，CSS-only 動畫）
- Orbitron 標題「Rewire」+ 琥珀色電路脈衝動畫
- 配色與遊戲深色主題一致（#0a0c0f 背景）
- React mount 後自動消失

#### 驗收條件
- [x] 首次訪問（清快取）看到 loading 畫面而非白屏
- [x] loading 畫面到遊戲畫面平滑過渡
- [x] loading HTML/CSS ~3.5 KB（內聯）


### FR-L-H：Accessibility ⏳ 部分完成，餘延後

#### 已完成（css-polish change）
- 8 個未定義 CSS 變數修復（13 處）
- 8 元素 focus-visible 樣式
- 4 元素 :active 回饋
- 硬編碼顏色統一為 CSS variable

#### 延後項目
- ARIA Landmarks（`<main>`、`<nav>`、`role="status"`、`aria-live`）
- 完整鍵盤操作（Tab 順序、Arrow keys、Esc 關閉 overlay）
- Screen Reader 支援（aria-label、aria-disabled、aria-live 播報）
- Lighthouse Accessibility ≥ 90 目標


### FR-L-I：測試基礎設施 ✅

補齊純函式單元測試，確保核心引擎邏輯正確。

#### 功能規格
- Vitest 測試框架
- 6 個模組覆蓋：simulation / scoring / helpers / routing / aesthetics / randomOldHouse
- 142 個純函式單元測試

#### 驗收條件
- [x] `npm run test` 142 tests 全部通過
- [x] 覆蓋核心引擎所有公開函式
- [x] watch mode 可用（`npm run test:watch`）


### FR-L-J：平面圖 ResultPanel 佈局修復 ✅

修復平面圖模式通關時 ResultPanel 擠壓 FloorPlanView 的佈局問題。

#### 功能規格
- ResultPanel 移入 `.fp-center` 捲動區（FloorPlanView 下方）
- overlays 拆分為 `resultPanel`（inline）+ `modalOverlays`（position:fixed）
- FloorPlanView 使用 `margin: auto` 居中（避免溢出時頂部不可及）

#### 驗收條件
- [x] 平面圖模式通關後 ResultPanel 不擠壓 FloorPlanView
- [x] 可捲動查看完整 ResultPanel
- [x] modal overlays 仍正常覆蓋全畫面


## 3. 實作順序（實際執行）

```
Phase 0 — CSS 清理
  1. FR-L-H(部分) css-polish           ← 修復未定義變數 + focus-visible   ✅

Phase 1 — 基礎設施
  2. FR-L-G  載入畫面                   ← 最簡單，立即改善首印象           ✅
  3. FR-L-E  Error Boundary            ← 安全網，後續重構有保障           ✅
  4. FR-L-D  音量控制                   ← 獨立功能，不影響現有程式         ✅

Phase 2 — 測試與重構
  5. FR-L-I  測試基礎設施               ← 補齊單元測試                    ✅
  6. FR-L-B  GameBoard 重構             ← 拆邏輯，降低複雜度              ✅
  7. FR-L-J  ResultPanel 佈局修復       ← 修復重構後發現的佈局問題         ✅

Phase 3 — 優化
  8. FR-L-A  Code-splitting             ← 切割 bundle，基於已拆分模組      ✅
  9. FR-L-C  CSS 抽取（batch 1-4）      ← 拆樣式，完成解耦                ✅
```

> FR-L-F（PWA）和 FR-L-H 剩餘項目（ARIA/鍵盤/Screen Reader）延後至未來版本。


## 4. 技術約束

- 不引入新的 CSS 框架（不用 Tailwind / styled-components）
- 不引入狀態管理庫（維持 useState + useRef 架構）
- CSS 抽取使用 plain CSS 獨立檔案（非 CSS Modules），保持與既有程式碼一致
- 所有改動必須 lint 通過、build 通過
- 重構類改動（FR-L-B/C）必須零功能變更


## 5. 成功指標

| 指標 | 目標 | 實際 |
|------|------|------|
| 初始 JS chunk | < 350 KB | 241 KB ✅ |
| GameBoard.tsx 行數 | < 500 行 | 622 行（68% 減少）✅ |
| App.css 行數 | < 100 行 | 396 行（89% 減少）✅ |
| 元件 CSS 獨立檔案 | — | 20 個 ✅ |
| 單元測試數 | — | 142 個 ✅ |
| 首次載入白屏 | 0 | 0 ✅ |
| Lighthouse Performance | ≥ 90 | 待驗證 |
| Lighthouse Accessibility | ≥ 90 | 延後 |
| Lighthouse PWA | 通過 | 延後 |
