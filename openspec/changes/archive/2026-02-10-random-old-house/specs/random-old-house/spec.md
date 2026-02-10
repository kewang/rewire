# random-old-house

## Requirement: Random Old House Generator

`src/engine/randomOldHouse.ts` — 純函式隨機老屋關卡生成器。

**函式簽名：**
```typescript
function generateRandomOldHouse(difficulty: 1 | 2 | 3): FixedCircuitLevel
```

**3 級難度：**
| 難度 | 迴路數 | 問題數 | 問題池 | 額外機制 | 存活時間 |
|------|--------|--------|--------|----------|----------|
| 1（初級） | 2–3 | 1–2 | 前 3 種 | 無 | 13s |
| 2（中級） | 3–4 | 2–3 | 全 5 種 | 手動相位 | 16s |
| 3（高級） | 4–6 | 3–5 | 全 5 種 | 相位+漏電+走線 | 19s |

**生成流程：** 迴路數量 → 電壓分配 → 電器分配 → 線材/NFB 分配 → 問題分配 → 預算計算(×1.3) → 可解性驗證。

**通關紀錄：** localStorage key `rewire-random-completions`，Record<string, number>。不追蹤星等。

**型別擴充：** FixedCircuitLevel 新增 `randomDifficulty?: 1 | 2 | 3`。

## Requirement: LevelSelect Random Section

關卡選擇頁新增「隨機老屋挑戰」區塊：
- 位於固定關卡 grid 下方
- 三張難度卡片（初級/中級/高級）
- 每張顯示難度名稱 + 說明 + 歷史通關次數
- 點擊卡片 → 生成隨機關卡 → 進入遊戲
- CSS amber 主題卡片 + hover 效果
