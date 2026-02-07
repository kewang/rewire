# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

**PRD v0.2 所有功能需求已完成。**

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- SVG 視覺化（CircuitDiagram 元件）
- Web Audio API 音效（無外部音檔）
- 無狀態管理庫（useState + useRef + rAF loop）
- Google Fonts: Orbitron (display) + JetBrains Mono (mono)

## Project Structure

- `src/components/` — React 元件
  - `GameBoard.tsx` — 主遊戲控制器，rAF 驅動模擬迴圈
  - `StatusDisplay.tsx` — 即時狀態面板（含倒數計時器）
  - `ResultPanel.tsx` — 結果面板（過關/失敗），inline 顯示不遮蓋遊戲畫面
  - `CircuitDiagram.tsx` — SVG 線路圖 + 線色變化 + 燒毀特效（斷線、銅芯、明火）
  - `WireSelector.tsx` / `AppliancePanel.tsx` / `LevelSelect.tsx`
- `src/types/` — TypeScript 型別定義
- `src/engine/` — 模擬引擎邏輯
  - `simulation.ts` — 純函式模擬引擎（step, calcTotalCurrent）
  - `audio.ts` — Web Audio API 提示音 + buzzing 預警音 + 電器運轉音
- `src/data/` — 遊戲資料
  - `levels.ts` — L01-L05 關卡定義
  - `constants.ts` — 5 種線材、5 種電器、NFB 預設值
- `docs/` — PRD 與設計文件
- `openspec/` — OpenSpec 工作流程（changes、specs）

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — 建置生產版本
- `npm run lint` — ESLint 檢查

## Conventions

- 語言：程式碼用英文，註解與文件可用繁體中文
- OpenSpec 工作流程管理所有 change
- PRD 參考：`docs/project-rewire-prd-v0.1.md`、`docs/project-rewire-prd-v0.2.md`
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
- 電路圖 SVG 響應式：width="100%" maxWidth=260

## Known Issues / Notes

- 既有 lint error：GameBoard.tsx `tick` 變數在宣告前存取（非任何 change 引入）
- 電器音效目前用 Web Audio API 合成，未來可換真實音檔提升品質
