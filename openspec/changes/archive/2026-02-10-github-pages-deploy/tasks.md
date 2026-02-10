## 1. Vite 設定

- [x] 1.1 在 `vite.config.ts` 加入 `base: '/rewire/'`

## 2. GitHub Actions Workflow

- [x] 2.1 建立 `.github/workflows/deploy.yml`，設定 push to `master` 觸發
- [x] 2.2 Workflow 步驟：checkout → setup Node.js → npm ci → npm run build → upload-pages-artifact → deploy-pages
- [x] 2.3 設定 `permissions: pages: write, id-token: write` 和 `concurrency` 防止並行部署

## 3. 驗證

- [x] 3.1 執行 `npm run build` 確認建置成功
- [x] 3.2 確認 `dist/` 中的資源路徑包含 `/rewire/` 前綴
