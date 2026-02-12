# PRD v0.10 — Project Rewire（工程品質與體驗優化）

## 0. 版本摘要

v0.10 建立在 v0.9 已完成的基礎上（31 關 + 隨機老屋、平面圖模式、六語 i18n、完整遊戲機制），聚焦於**工程品質**與**使用者體驗**的全面提升：

- 降低 bundle 大小、加快首屏載入
- 拆解巨型元件與 CSS，提升可維護性
- 補齊使用者缺少的基本控制（音量、錯誤處理）
- 支援離線遊玩與手機安裝
- 強化無障礙支援

> v0.1–v0.9 所有功能需求維持不變，本文件僅描述**增量（delta）**內容。


## 1. 產品目標（This release）

1. **效能優化**：JS bundle 從 518 KB 降至 500 KB 以下，首屏載入感受明顯改善
2. **程式碼健康**：GameBoard（1953 行）拆分為可維護的模組，App.css（4391 行）模組化
3. **使用者控制**：音量調節 / 靜音 toggle，玩家可控制遊戲音效
4. **穩健性**：Error Boundary 防止白屏，graceful fallback
5. **可安裝**：PWA 支援，手機可安裝到桌面、離線遊玩
6. **首印象**：載入畫面取代白屏等待
7. **無障礙深化**：ARIA landmarks、screen reader 支援、鍵盤可操作完整遊戲流程

### 非目標（Not in v0.10）
- 不做弱電 / 網路線系統
- 不做段落級故障模擬（串聯中段燒斷→下游斷電）
- 不做 3D / 等角視角
- 不做使用者自訂房型 / 關卡編輯器
- 不做多人 / 排行榜功能


## 2. 功能需求（Functional Requirements）

### FR-L-A：Code-splitting（延遲載入）

將非首屏元件以 `React.lazy` + `Suspense` 延遲載入，降低初始 JS bundle 大小。

#### 延遲載入候選
| 元件 | 理由 |
|------|------|
| `LevelSelect` | 進入遊戲後不再需要 |
| `PanelInteriorView` | 僅走線整理關卡使用 |
| `CrimpMiniGame` | 僅壓接關卡使用 |
| `FloorPlanPreview` | 開發驗證用，生產環境可完全排除 |
| `BeforeAfterView` | 僅老屋通關時使用 |
| `RoutingStrategyPicker` | 僅走線策略選擇時使用 |
| `BreakerSelector` | 僅老屋 NFB 更換時使用 |

#### 驗收條件
- [ ] 初始 JS chunk < 350 KB（gzip 前）
- [ ] 延遲載入元件以 `<Suspense fallback={<Loading />}>` 包裹
- [ ] 載入過程中顯示骨架屏或 spinner，無白屏閃爍
- [ ] `FloorPlanPreview` 在生產 build 中不被包含（tree-shaken 或條件排除）


### FR-L-B：GameBoard 重構（Custom Hooks 抽取）

將 GameBoard.tsx（1953 行）的邏輯拆分為獨立 custom hooks，元件本體僅負責組裝與渲染。

#### 抽取規劃
| Hook | 職責 | 預估行數 |
|------|------|---------|
| `useSimulationLoop` | rAF loop、step/stepMulti 呼叫、漏電事件處理、計時 | ~200 |
| `useCircuitState` | circuitWires/Appliances/Crimps/Breakers、wiring state、接線操作 | ~250 |
| `useOldHouseLogic` | problemCircuits、preWiredCircuitIds、拆線/修復/BreakerSelector | ~200 |
| `useFloorPlanInteraction` | 拖曳 drop、房間 highlight、routing strategies、popover 狀態 | ~250 |
| `usePlannerState` | plannerCircuits、phase/elcb toggle、confirmPlanning | ~200 |

#### 驗收條件
- [ ] GameBoard.tsx 降至 < 500 行（僅組裝 + JSX）
- [ ] 每個 hook 獨立檔案，放置於 `src/hooks/`
- [ ] 行為與重構前完全一致（零功能變更）
- [ ] lint 通過、build 通過


### FR-L-C：CSS 模組化

將單體 `App.css`（4391 行）拆分為 per-component CSS 檔案，降低心智負擔與衝突風險。

#### 拆分策略

**方案：CSS Modules（`.module.css`）**
- 每個元件一個 `.module.css` 檔案
- `:root` CSS variables 保留在 `src/index.css`
- 全域動畫 `@keyframes` 保留在共用 CSS

#### 拆分清單
| CSS 檔案 | 對應元件 | 預估行數 |
|----------|---------|---------|
| `GameBoard.module.css` | GameBoard | ~300 |
| `CircuitDiagram.module.css` | CircuitDiagram + SingleCircuitSVG | ~400 |
| `FloorPlanView.module.css` | FloorPlanView | ~350 |
| `StatusDisplay.module.css` | StatusDisplay | ~200 |
| `ResultPanel.module.css` | ResultPanel | ~150 |
| `LevelSelect.module.css` | LevelSelect | ~200 |
| `CircuitPlanner.module.css` | CircuitPlanner + CircuitCard + RoomPanel | ~300 |
| `PanelInteriorView.module.css` | PanelInteriorView | ~250 |
| `CrimpMiniGame.module.css` | CrimpMiniGame | ~150 |
| `WireToolbar.module.css` | WireToolbar | ~100 |
| `FloorPlanSidebar.module.css` | CircuitPlannerSidebar + CircuitAssignmentPopover | ~200 |
| `shared.css` | 共用 @keyframes + utility classes | ~200 |

#### 驗收條件
- [ ] `App.css` 刪除或僅保留 < 100 行全域樣式
- [ ] 每個元件 import 自己的 `.module.css`
- [ ] 視覺呈現與重構前完全一致
- [ ] 無 class name 衝突（CSS Modules 自動 scope）


### FR-L-D：音量控制

新增音效控制 UI，讓玩家可調整音量或靜音。

#### 功能規格
- 遊戲畫面右上角（或設定面板中）顯示音量圖示
- 點擊切換靜音 / 恢復
- 長按或右鍵展開音量滑桿（0–100%）
- 音量設定 localStorage 持久化（key: `rewire-volume`）
- 預設音量 50%（目前音效偏大）

#### 影響範圍
- `src/engine/audio.ts` — 所有 GainNode 乘以 masterVolume
- 新增 `src/components/VolumeControl.tsx`
- GameBoard 傳遞 volume state 給 audio engine

#### 驗收條件
- [ ] 靜音時所有音效（提示音 + buzzing + 電器音）完全靜默
- [ ] 音量滑桿即時生效（無需重新送電）
- [ ] 重新整理後音量設定保留
- [ ] 不影響遊戲效能（不額外建立 AudioContext）


### FR-L-E：Error Boundary

React Error Boundary 攔截渲染錯誤，避免整個遊戲白屏。

#### 功能規格
- 頂層 Error Boundary 包裹 `<App />`
- 遊戲區域 Error Boundary 包裹 GameBoard
- 錯誤時顯示友善訊息 + 「回到關卡選擇」按鈕
- console.error 記錄完整 stack trace
- 支援 i18n（錯誤訊息六語）

#### 驗收條件
- [ ] 模擬元件 throw Error 時不白屏
- [ ] 顯示錯誤 fallback UI + 回到首頁按鈕
- [ ] 錯誤訊息翻譯完整（六語）


### FR-L-F：PWA 支援

讓遊戲可安裝到手機桌面，離線可玩。

#### 功能規格
- `public/manifest.json`：name、icons（192/512）、theme_color、background_color
- Service Worker（Vite PWA plugin 或手動 `sw.js`）：cache-first 策略
- 快取策略：所有靜態資源 + Google Fonts（fallback 也可玩）
- 安裝提示：首次訪問時顯示「安裝到桌面」banner

#### 驗收條件
- [ ] Chrome DevTools > Application > Manifest 無錯誤
- [ ] Lighthouse PWA 審計通過基本項目
- [ ] 飛航模式下遊戲可正常遊玩（已快取後）
- [ ] 手機 Chrome/Safari 可安裝到桌面


### FR-L-G：載入畫面

首次載入時顯示品牌 loading 畫面，取代白屏等待。

#### 功能規格
- `index.html` 內聯 CSS + HTML（不依賴 JS bundle）
- 顯示遊戲 logo / 標題「Rewire」+ loading 動畫
- 配色與遊戲深色主題一致（#0a0c0f 背景）
- React mount 後自動消失（fade-out 過渡）
- 載入時間 < 100ms 時不閃爍（最小顯示 300ms 或不顯示）

#### 驗收條件
- [ ] 首次訪問（清快取）看到 loading 畫面而非白屏
- [ ] loading 畫面到遊戲畫面平滑過渡
- [ ] loading HTML/CSS < 5 KB（內聯不影響 FCP）


### FR-L-H：Accessibility 深化

在現有 focus-visible 基礎上，進一步強化無障礙支援。

#### 功能規格

**ARIA Landmarks**
- `<main>` 包裹遊戲區域
- `<nav>` 包裹關卡選擇
- `role="status"` 標記 StatusDisplay（即時狀態）
- `aria-live="polite"` 標記 ResultPanel（結果通知）

**鍵盤操作**
- Tab 順序：線材選擇 → 迴路 → 電器面板 → 送電按鈕
- Enter/Space 觸發按鈕、toggle
- Esc 關閉 overlay（CrimpMiniGame、BreakerSelector、Popover）
- Arrow keys 在線材卡片間移動

**Screen Reader**
- 線材卡片 `aria-label`：「1.6mm² 藍色線材，安全電流 15A，每公尺 $2」
- 送電按鈕狀態：`aria-disabled` + 原因描述
- 遊戲結果 `aria-live` 播報：「通關！成本 $45，獲得 3 星」

#### 驗收條件
- [ ] 純鍵盤可完成完整遊戲流程（選關→接線→送電→看結果）
- [ ] VoiceOver / NVDA 可讀取關鍵操作資訊
- [ ] Lighthouse Accessibility 分數 ≥ 90


## 3. 實作順序

建議依序實作，前置項目為後續提供基礎：

```
Phase 1 — 基礎設施（不影響功能）
  1. FR-L-G  載入畫面           ← 最簡單，立即改善首印象
  2. FR-L-E  Error Boundary     ← 安全網，後續重構有保障
  3. FR-L-D  音量控制           ← 獨立功能，不影響現有程式

Phase 2 — 重構（改善可維護性）
  4. FR-L-B  GameBoard 重構     ← 先拆邏輯，降低複雜度
  5. FR-L-C  CSS 模組化         ← 再拆樣式，完成解耦
  6. FR-L-A  Code-splitting     ← 最後切割，基於已拆分的模組

Phase 3 — 進階體驗
  7. FR-L-F  PWA 支援           ← 需要 icon 等資源
  8. FR-L-H  Accessibility 深化 ← 基於重構後的乾淨結構
```


## 4. 技術約束

- 不引入新的 CSS 框架（不用 Tailwind / styled-components）
- 不引入狀態管理庫（維持 useState + useRef 架構）
- CSS Modules 為 Vite 內建支援，零配置
- PWA plugin 選用 `vite-plugin-pwa`（如果適合）或手動實作
- 所有改動必須 lint 通過、build 通過
- 重構類改動（FR-L-B/C）必須零功能變更


## 5. 成功指標

| 指標 | 目標 |
|------|------|
| 初始 JS chunk | < 350 KB |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |
| Lighthouse PWA | 基本項目通過 |
| GameBoard.tsx 行數 | < 500 行 |
| App.css 行數 | < 100 行（全域樣式） |
| 首次載入白屏 | 0（有 loading 畫面） |
