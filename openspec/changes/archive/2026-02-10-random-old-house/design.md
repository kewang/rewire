## Context

v0.8 完成全 5 種老屋問題後，需要隨機生成器提供無限重玩性。PRD v0.8 FR-I-D 定義了 3 級難度和生成演算法。

## Goals / Non-Goals

**Goals:**
- generateRandomOldHouse(difficulty: 1|2|3) 純函式生成器
- 3 級難度：初級 2-3 迴路 / 中級 3-4 迴路+全問題 / 高級 4-6 迴路+相位+漏電+走線
- 生成後驗證可解性（預算足夠、負載合理）
- LevelSelect 顯示隨機區塊 + 通關次數
- localStorage 持久化通關次數

**Non-Goals:**
- 不追蹤星等（隨機關卡每次不同）
- 不做種子碼分享

## Decisions

### D1：預算計算
**選擇**：budget = 修復成本 × 1.3（30% 彈性）。
**理由**：給玩家足夠空間選擇不同修復策略。

### D2：通關紀錄 key
**選擇**：localStorage `rewire-random-completions`，Record<string, number>。
**理由**：分難度計數，簡潔明瞭。

### D3：randomDifficulty 標記
**選擇**：在 FixedCircuitLevel 新增可選 `randomDifficulty?: 1 | 2 | 3`。
**理由**：GameBoard 通關時據此呼叫 saveRandomCompletion。
