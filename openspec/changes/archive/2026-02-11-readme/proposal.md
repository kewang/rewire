## Why

專案上線至 v0.8+ 且已部署到 GitHub Pages，但 repo 根目錄完全沒有 README。訪客（包括潛在貢獻者、從社群連結點進來的玩家）打開 repo 第一眼看不到任何說明，不知道這是什麼、怎麼玩、怎麼跑起來。一份好的 README 是開源專案的門面。

## What Changes

- 新增 `README.md` 於 repo 根目錄，內容涵蓋：
  - 專案標題與一句話簡介
  - 遊戲截圖或 GIF 展示（placeholder，待實際截圖補上）
  - 線上遊玩連結（GitHub Pages）
  - 遊戲特色亮點（關卡系統、老屋模式、壓接小遊戲、走線整理、六語 i18n 等）
  - Tech Stack 速覽
  - 本地開發指引（clone → install → dev）
  - 建置與部署說明
  - 專案結構簡述
  - License（待確認）

## Capabilities

### New Capabilities
- `readme`: 專案 README 文件，涵蓋專案介紹、遊玩連結、特色說明、開發指引

### Modified Capabilities
<!-- 無，README 不影響任何既有功能 -->

## Impact

- 僅新增一個 markdown 檔案，零程式碼變更
- 不影響建置、部署、或任何既有功能
