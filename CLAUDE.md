# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

**PRD v0.2 完成。v0.3 全部完成（FR-A drag-drop, FR-B multi-circuit, FR-C voltage-distinction, FR-D levels）。v0.4 PRD 已撰寫（FR-E phase-balancing, FR-F ELCB, FR-G extended-materials-ii）。**

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- SVG 視覺化（CircuitDiagram 元件）
- Web Audio API 音效（無外部音檔）
- 無狀態管理庫（useState + useRef + rAF loop）
- Google Fonts: Orbitron (display) + JetBrains Mono (mono)

## Project Structure

- `src/components/` — React 元件
  - `GameBoard.tsx` — 主遊戲控制器，rAF 驅動，多迴路狀態管理（circuitWires/circuitAppliances per-circuit）
  - `StatusDisplay.tsx` — 即時狀態面板（單迴路詳細 / 多迴路摘要）
  - `ResultPanel.tsx` — 結果面板（inline + 失敗迴路標示）
  - `CircuitDiagram.tsx` — SVG 線路圖，SingleCircuitSVG 子元件 + 多迴路水平並列佈局
  - `WireSelector.tsx` — 線材選擇卡片，拖曳來源（Pointer Events + 觸控長按）
  - `AppliancePanel.tsx` — 電器面板，多迴路時有 circuit-tabs 選擇目標迴路
  - `LevelSelect.tsx` — 關卡選擇
- `src/types/` — TypeScript 型別定義
  - `game.ts` — CircuitId, Circuit, CircuitState, MultiCircuitState, WiringState, CircuitConfig 等
  - `helpers.ts` — toLegacyState, worstStatus, createSingleCircuitLevel
- `src/engine/` — 模擬引擎邏輯
  - `simulation.ts` — 純函式模擬引擎（step, stepMulti, calcTotalCurrent）
  - `audio.ts` — Web Audio API 提示音 + buzzing 預警音 + 電器運轉音
- `src/data/` — 遊戲資料
  - `levels.ts` — L01-L09 關卡定義（L01-L05 單迴路, L06-L09 多迴路）
  - `constants.ts` — 5 種線材、6 種電器（含電熱水器 220V）、NFB 預設值
- `docs/` — PRD 與設計文件
- `openspec/` — OpenSpec 工作流程（changes、specs）

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — 建置生產版本
- `npm run lint` — ESLint 檢查

## Conventions

- 語言：程式碼用英文，註解與文件可用繁體中文
- OpenSpec 工作流程管理所有 change
- PRD 參考：`docs/project-rewire-prd-v0.1.md`、`docs/project-rewire-prd-v0.2.md`、`docs/project-rewire-prd-v0.4.md`
- 「更新 memory」= 更新此 CLAUDE.md 檔案

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
- ResultPanel 自動 scrollIntoView({ behavior: 'smooth', block: 'nearest' })
- 電路圖 SVG 響應式：width="100%" maxWidth=260（單迴路），多迴路 maxWidth = n × 260
- 多迴路架構：CircuitDiagram 內 SingleCircuitSVG 子元件 + 水平並列（CIRCUIT_WIDTH=200）
- 拖曳接線：Pointer Events API（非 HTML5 DnD），WiringState 集中管理於 GameBoard
- 拖曳 drop zone：SVG 座標判定 circuitIndex = floor(svgX / CIRCUIT_WIDTH)，onTargetCircuitChange 回調
- 拖曳流程：pointerdown 設 capture → 移動超閾值啟動拖曳 → releaseCapture + global listeners → elementFromPoint 偵測 drop zone
- 觸控長按 150ms 啟動拖曳，移動 >10px 取消長按（避免與捲動衝突）
- 電路圖三態：未接線（灰色虛線+提示文字）→ 拖曳中預覽（彩色虛線跟隨游標）→ 已接線（實線+閃光動畫）
- 線材顏色依線徑區分：1.6mm²藍、2.0mm²綠、3.5mm²黃、5.5mm²橘、8.0mm²紅
- 送電前置條件：所有迴路都已接線（isWired = 衍生值）才能啟用 NFB 開關
- 全域送電開關（非獨立 per-circuit NFB），未來可擴展
- AppliancePanel 多迴路：circuit-tabs 選擇目標迴路 + availableAppliances 過濾
- 成本計算：totalCost = Σ(circuitWires[id].costPerMeter × DEFAULT_WIRE_LENGTH)
- buzzing 音效：任一迴路 warning 時觸發，音量 = max wireHeat across all circuits

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

## Known Issues / Notes

- 既有 lint error：GameBoard.tsx `tick` 變數在宣告前存取（非任何 change 引入）
- 電器音效目前用 Web Audio API 合成，未來可換真實音檔提升品質
