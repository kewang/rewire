## Context

Rewire 遊戲已開發至 v0.7，共 23 個可玩關卡，需要公開部署讓玩家在瀏覽器直接體驗。Repo 已在 GitHub（`kewang/rewire`），GitHub Pages 為零成本部署方案。

目前 `vite.config.ts` 無設定 `base`，build 產出假設部署在根路徑。

## Goals / Non-Goals

**Goals:**
- push 到 `master` 時自動建置部署到 GitHub Pages
- 靜態資源路徑在 `https://kewang.github.io/rewire/` 下正確載入
- 本地開發不受影響

**Non-Goals:**
- 自訂域名（未來可加）
- Preview deployments for PR
- CDN 或其他部署平台

## Decisions

### 1. 使用 GitHub Actions + `actions/deploy-pages`（非 `gh-pages` branch）

**選擇**: 官方 GitHub Pages Actions 部署方式（upload-pages-artifact + deploy-pages）

**替代方案**: `gh-pages` npm 套件推送到 `gh-pages` branch
- 需額外安裝套件
- 需管理 deploy key 或 token
- branch 方式已非 GitHub 推薦做法

**理由**: 零依賴、官方支援、設定簡單、workflow 內完成所有步驟。

### 2. Vite `base` 設定為 `/rewire/`

GitHub Pages 的 project site URL 為 `https://<user>.github.io/<repo>/`，Vite 的 `base` 必須匹配。

## Risks / Trade-offs

- **[首次需手動設定]** → GitHub repo Settings → Pages → Source 改為 "GitHub Actions"，一次性操作
- **[base 路徑影響 dev]** → Vite dev server 會自動處理 base，`npm run dev` 存取 `http://localhost:5173/rewire/` 即可，或可考慮只在 production build 設定 base → 使用環境變數 `process.env.NODE_ENV` 不必要，Vite 的 dev server 會自動 rewrite，不影響開發體驗
