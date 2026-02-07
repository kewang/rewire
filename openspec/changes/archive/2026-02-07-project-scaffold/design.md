## Context

Project Rewire 是一個配電盤燒線模擬器的 Web 遊戲。PRD 指定使用 React + TypeScript，需要 SVG/Canvas 繪圖和 requestAnimationFrame 模擬迴圈。目前專案零程式碼。

## Goals / Non-Goals

**Goals:**
- 建立可立即開發的 React + TypeScript 環境
- 目錄結構預留遊戲各模組的位置

**Non-Goals:**
- 不安裝遊戲相關套件（Zustand、動畫庫等留給後續 change）
- 不建立任何遊戲邏輯或 UI 元件

## Decisions

### Decision 1: 使用 Vite 作為建置工具

選 Vite 而非 CRA 或 Next.js。理由：Vite 啟動快、HMR 快、設定簡單，且這是純前端 SPA，不需要 SSR。

### Decision 2: 最小依賴原則

只安裝 React、ReactDOM、TypeScript 和 Vite 相關套件。其餘依賴（Zustand、繪圖庫等）留給各功能的 change 再加入，避免前期過度安裝。
