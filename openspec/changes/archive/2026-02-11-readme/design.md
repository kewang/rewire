## Context

專案已發展到 v0.8+，部署於 GitHub Pages，但 repo 根目錄沒有 README.md。這是一個純文件變更，不涉及程式碼。

## Goals / Non-Goals

**Goals:**
- 提供專案第一印象：訪客 30 秒內理解這是什麼、怎麼玩
- 提供開發者快速上手指引：clone → install → dev 三步驟
- 展示遊戲特色吸引玩家與貢獻者

**Non-Goals:**
- 不撰寫完整的開發者文件或 API 文件（已有 CLAUDE.md 和 OpenSpec）
- 不製作截圖或 GIF（README 預留 placeholder，截圖另案處理）
- 不建立 CONTRIBUTING.md 或 CODE_OF_CONDUCT.md

## Decisions

### 1. 語言選擇：中英雙語
README 主體使用**繁體中文**（與遊戲預設語言一致），關鍵段落（專案名稱、Tech Stack、指令）保留英文。理由：目標受眾以台灣開發者/電工愛好者為主，中文更親切；英文技術術語維持原樣避免翻譯失真。

### 2. 結構順序：玩家優先、開發者其次
1. 標題 + 一句話描述
2. 線上遊玩連結（最重要的 CTA）
3. 截圖 placeholder
4. 遊戲特色
5. Tech Stack
6. 本地開發
7. 專案結構（精簡版）
8. License

理由：多數訪客是想玩的人，開發指引放後面。

### 3. 專案結構段落精簡化
只列出頂層目錄與關鍵檔案，不重複 CLAUDE.md 的詳細結構。理由：避免兩處維護。

## Risks / Trade-offs

- [截圖缺失] README 沒有視覺展示會降低吸引力 → 先放 placeholder 文字，後續補截圖
- [內容過時] 隨版本演進 README 可能過時 → 僅放穩定資訊（連結、指令、特色概述），避免寫入具體版本號或關卡數量
