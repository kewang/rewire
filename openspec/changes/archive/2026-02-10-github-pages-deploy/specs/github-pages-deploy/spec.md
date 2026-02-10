## ADDED Requirements

### Requirement: GitHub Actions 自動部署

系統 MUST 在 push 到 `master` 分支時，透過 GitHub Actions 自動建置並部署至 GitHub Pages。

#### Scenario: push 觸發部署

- **WHEN** 程式碼 push 到 `master` 分支
- **THEN** GitHub Actions workflow 自動觸發
- **AND** 執行 `npm ci` 安裝依賴
- **AND** 執行 `npm run build` 建置生產版本
- **AND** 將 `dist/` 目錄部署至 GitHub Pages

#### Scenario: 非 master 分支不觸發

- **WHEN** 程式碼 push 到非 `master` 分支
- **THEN** 部署 workflow 不觸發

### Requirement: 靜態資源路徑正確

系統 MUST 設定 Vite `base` 為 `/rewire/`，確保所有靜態資源在 GitHub Pages 子路徑下正確載入。

#### Scenario: 生產環境資源載入

- **WHEN** 使用者存取 `https://kewang.github.io/rewire/`
- **THEN** 所有 JS、CSS、字型等靜態資源正確載入
- **AND** 遊戲可正常運作

#### Scenario: 本地開發不受影響

- **WHEN** 開發者執行 `npm run dev`
- **THEN** 本地開發伺服器正常運作
