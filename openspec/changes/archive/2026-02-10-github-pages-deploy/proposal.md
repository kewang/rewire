## Why

遊戲開發至 v0.7 已有完整可玩內容（23 個關卡），需要一個公開的遊玩入口讓玩家可以直接在瀏覽器體驗。GitHub Pages 是零成本、零維運的最佳選擇，且 repo 已在 GitHub 上。

## What Changes

- 新增 GitHub Actions workflow，push 到 `master` 時自動建置並部署到 GitHub Pages
- 修改 Vite 設定的 `base` 路徑，使靜態資源在子路徑 `/rewire/` 下正確載入

## Capabilities

### New Capabilities
- `github-pages-deploy`: GitHub Pages 自動部署配置（CI/CD workflow + Vite base path）

### Modified Capabilities
- `dev-environment`: 新增 `base` 路徑設定，影響 build 產出的資源路徑

## Impact

- **新增檔案**: `.github/workflows/deploy.yml`
- **修改檔案**: `vite.config.ts`（加上 `base: '/rewire/'`）
- **外部設定**: GitHub repo Settings → Pages → Source 需手動改為 "GitHub Actions"
- **無破壞性變更**: 本地 `npm run dev` 不受影響
