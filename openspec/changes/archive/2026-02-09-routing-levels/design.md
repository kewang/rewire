## Context

v0.6 的整線基礎設施已全部就位（PanelInteriorView、aesthetics.ts、GameBoard routing flow、ResultPanel score display）。Change 3 的範圍很聚焦：

1. BonusCondition union 新增 `aesthetics-score` 類型
2. `calcStars` 支援此條件判定
3. 定義 L21–L23 三關使用 `requiresRouting: true`

現有程式碼已為此預留介面（`CalcStarsInput.aestheticsScore?: number`），只需啟用實際邏輯。

## Goals / Non-Goals

**Goals:**
- 新增 `aesthetics-score` BonusCondition 使整線分數能影響三星評等
- 新增 3 個整線關卡（入門 → 進階 → 畢業考），循序漸進教學整線機制
- L01–L20 完全不受影響

**Non-Goals:**
- 不修改 PanelInteriorView 或 aesthetics.ts 邏輯（已在 Change 2 完成）
- 不新增電器或線材種類
- 不修改 GameBoard routing flow（已在 Change 2 完成）

## Decisions

### D1: BonusCondition 型別擴充位置
在 `game.ts` 的 BonusCondition union 新增一個 member：`{ type: 'aesthetics-score'; minScore: number }`。TypeScript discriminated union 的 exhaustive check 會自動讓 `checkBonus` 的 switch 在缺少 case 時報型別錯誤。

### D2: calcStars checkBonus 擴充
在 `scoring.ts` 的 `checkBonus` switch 新增 `case 'aesthetics-score'`，判定 `input.aestheticsScore != null && input.aestheticsScore >= bonusCondition.minScore`。aestheticsScore 未提供時視為未達成。

### D3: bonusLabel 擴充
`bonusLabel` 新增 `case 'aesthetics-score'` 回傳 `整線分數 ≥ ${minScore}`。

### D4: L21–L23 關卡設計
嚴格按照 PRD v0.6 §4 定義。所有三關共同特徵：
- `requiresCrimp: true` + `requiresRouting: true`
- `bonusCondition: { type: 'aesthetics-score', minScore: N }`
- 預設車道排列（c1, c2, ...）故意不是最佳排列

### D5: 關卡資料結構
L21 使用已有電器（hairDryer, fridge, underSinkHeater）。L22 新增 c4/c5，L23 新增 c5/c6 含 wetArea + ELCB。所有電器和 NFB 規格均已在 constants.ts 中定義。

## Risks / Trade-offs

- **低風險**：Change 範圍小（3 檔案，~100 行），純資料+型別+邏輯擴充，無新元件。
- **TypeScript exhaustive check**：新增 BonusCondition member 後若 switch 缺 case 會編譯失敗——這是預期行為，確保全面覆蓋。
- **L22/L23 平衡**：關卡難度依 PRD 設計，實測後可微調預算/存活時間。
