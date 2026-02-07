## ADDED Requirements

### Requirement: Vite Dev Server

系統 MUST 提供透過 npm scripts 啟動本地開發伺服器的能力，支援 HMR。

#### Scenario: 啟動開發伺服器

- **WHEN** 開發者執行 `npm run dev`
- **THEN** Vite 開發伺服器在 localhost 啟動
- **AND** 瀏覽器可看到入口頁面

#### Scenario: 建置生產版本

- **WHEN** 開發者執行 `npm run build`
- **THEN** 產出靜態檔案至 `dist/` 目錄
- **AND** 建置過程無 TypeScript 錯誤
