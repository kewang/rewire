## Why

Project Rewire 目前只有 PRD 文件，尚無任何程式碼。為了讓後續功能開發（資料模型、模擬引擎、UI 元件）有穩固的基礎，需要先建立 React + TypeScript 的專案腳手架。

## What Changes

- 使用 Vite 初始化 React + TypeScript 專案
- 建立合理的目錄結構（`src/`、`src/components/`、`src/types/`、`src/engine/`）
- 設定 TypeScript 嚴格模式
- 建立最基本的入口頁面，確認專案可正常啟動

## Capabilities

### New Capabilities
- `dev-environment`: 開發者可以 `npm run dev` 啟動本地開發伺服器
- `project-structure`: 建立符合 PRD 技術需求的目錄結構

## Impact

- 新增 `package.json`、`tsconfig.json`、`vite.config.ts` 等設定檔
- 新增 `src/` 目錄及基本入口檔案
- 新增 `index.html`
