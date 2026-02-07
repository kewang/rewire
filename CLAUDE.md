# Project Rewire

配電盤燒線模擬器 — 讓玩家體驗選線徑、接線、送電、過載跳電/燒線的 Web 互動遊戲。

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- SVG/Canvas 繪圖（預計）
- 狀態管理：待定（Zustand 或 Redux）

## Project Structure

- `src/components/` — React 元件
- `src/types/` — TypeScript 型別定義
- `src/engine/` — 模擬引擎邏輯
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
