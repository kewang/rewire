## Context

Project Rewire 的專案腳手架已完成（React + TypeScript + Vite）。PRD 第 6 節定義了遊戲數值（線材、電器、NFB），第 3-4 節定義了核心玩法迴圈和模擬狀態。在實作模擬引擎或 UI 之前，需要先建立共用的型別定義和常數資料。

## Goals / Non-Goals

**Goals:**
- 定義所有遊戲實體的 TypeScript 型別，供模擬引擎和 UI 共用
- 將 PRD 數據表轉為型別安全的常數，確保數值有單一來源

**Non-Goals:**
- 不實作任何遊戲邏輯（模擬、計算等留給後續 change）
- 不建立 React 元件或 UI
- 不設計狀態管理架構（Zustand/Redux 選擇留給後續）

## Decisions

### Decision 1: 型別與常數分離為兩個檔案

型別定義放 `src/types/game.ts`，預設常數放 `src/data/constants.ts`。理由：型別是介面契約，常數是可調數值，分開後未來可獨立修改常數（例如關卡平衡調整）而不動型別。

替代方案：全部放同一檔。缺點是型別和資料混在一起，不利於後續維護。

### Decision 2: 使用 union type 表示模擬狀態

`SimulationStatus = 'normal' | 'warning' | 'tripped' | 'burned'`，使用字串字面量聯合型別而非 enum。理由：字串字面量在 TypeScript 中更慣用、序列化友善、且 tree-shaking 更好。

替代方案：使用 enum。缺點是序列化時需要額外轉換，且在 bundle 中會產生額外程式碼。

### Decision 3: 使用 readonly + as const 確保常數不可變

預設常數使用 `as const` 斷言，確保數值在執行期不會被意外修改。型別定義使用 `readonly` 標記陣列屬性。

## Risks / Trade-offs

- **型別可能需要隨功能演進調整** → 這是預期行為，型別定義本來就會隨需求演進。保持最小必要欄位，後續 change 再擴充。
- **常數硬編碼** → v0.1 階段可接受。未來若需要從外部載入關卡資料，只需修改 `constants.ts` 的匯出方式。
