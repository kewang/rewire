# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

**PRD v0.1 所有功能需求已完成。**

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- SVG 視覺化（CircuitDiagram 元件）
- Web Audio API 音效（無外部音檔）
- 無狀態管理庫（useState + useRef + rAF loop）

## Project Structure

- `src/components/` — React 元件
  - `GameBoard.tsx` — 主遊戲控制器，rAF 驅動模擬迴圈
  - `StatusDisplay.tsx` — 即時狀態面板（含倒數計時器）
  - `ResultPanel.tsx` — 結果面板（過關/失敗），邊框顏色依結果類型
  - `CircuitDiagram.tsx` — SVG 線路圖 + 線色變化 + 動畫
  - `WireSelector.tsx` / `AppliancePanel.tsx` / `LevelSelect.tsx`
- `src/types/` — TypeScript 型別定義
- `src/engine/` — 模擬引擎邏輯
  - `simulation.ts` — 純函式模擬引擎（step, calcTotalCurrent）
  - `audio.ts` — Web Audio API 提示音
- `src/data/` — 遊戲資料
  - `levels.ts` — L01-L03 關卡定義
  - `constants.ts` — 線材、NFB 預設值
- `docs/` — PRD 與設計文件
- `openspec/` — OpenSpec 工作流程（changes、specs）

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — 建置生產版本
- `npm run lint` — ESLint 檢查

## Conventions

- 語言：程式碼用英文，註解與文件可用繁體中文
- OpenSpec 工作流程管理所有 change
- PRD 參考：`docs/project-rewire-prd-v0.1.md`
- 「更新 memory」= 更新此 CLAUDE.md 檔案

## Key Design Decisions

- NFB 跳脫閾值 = ratedCurrent × 1.25（台灣電工法規）
- 線材熱度模型: heatRate=0.4, coolRate=0.15（約 3 秒燒毀）
- 倒數計時器在 StatusDisplay 計算（remainingTime = survivalTime - elapsed），不改 SimulationState
- ResultPanel 邊框顏色用 CSS variable `--result-border-color` 依結果類型變色
- 深色主題：背景 #111/#1a1a1a，label 文字 #aaa、value 文字 #f0f0f0（WCAG AA 對比度）
