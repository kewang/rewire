## Context

v0.7 自由配迴路系統已完成（L06-L17, L21-L23），但關卡數值（budget, bonusCondition, mainBreakerRating）僅為估算值，需經分析後微調。分析發現一個成本計算 bug、多個數值不合理之處、以及主開關額定普遍過高的問題。

## Goals / Non-Goals

**Goals:**
- 修復 endgame finalCost 漏算 NFB 成本的 bug
- 修正 2 個數學上不可能達成的 bonus 條件（L10, L13）
- 修正 2 個純靠 RNG 的 bonus 條件（L14, L15）
- 收緊 3 個預算過鬆的關卡（L17, L22, L23）
- 收緊 14 個關卡的 mainBreakerRating，讓負載指示器有意義

**Non-Goals:**
- 不調整固定迴路關卡（L01-L05, L18-L20）
- 不調整教學入門關卡（L07, L16, L21）的寬鬆預算
- 不更改關卡的 rooms/appliances/maxSlots/survivalTime 等結構
- 不新增或移除關卡

## Decisions

### D1: finalCost 加入 NFB 成本

GameBoard.tsx endgame finalCost（line 339-345）需加入 NFB 成本，與 displayedCost（line 140-148）和 plannerTotalCost（line 755-760）保持一致。複用既有的 `NFB_COSTS` 查詢表和 `circuitConfigs` state。

### D2: L10 提高預算至 $280，bonus ratio 改 0.9

原 budget=$250, ratio=0.85 → 上限 $212，但最低可行成本 $240 → 不可能。
- 新 budget=$280, ratio=0.9 → 上限 $252
- 最低成本 $240，留 $12 給非最優配置
- 保留 under-budget-ratio 類型，符合「全屋配電，優化成本」的主題

### D3: L13 bonus 改為 time-margin

原 no-trip + scripted 漏電 → ELCB 必定跳脫 → 不可能。
- 改為 `time-margin: 3`
- ELCB 入門關的意義是「裝 ELCB 保命」，time-margin 鼓勵正確配線安全通關
- 漏電發生時 ELCB 跳脫後該迴路斷電，不影響其他迴路的存活

### D4: L14 bonus 改為 under-budget-ratio

原 no-trip + random 漏電 → 54% 靠運氣。
- 改為 `under-budget-ratio: 0.9`（$185 × 0.9 = $166.5，最低成本 $155）
- 「ELCB 預算壓力」主題改用成本優化 bonus 更切題

### D5: L15 bonus 改為 time-margin

原 no-trip + random 漏電 → 36% 靠運氣。
- 改為 `time-margin: 5`（20s 關卡，需存活 15+s）
- 綜合挑戰關用 time-margin 鼓勵紮實配線，不被 RNG 懲罰

### D6: L17 收緊預算至 $150

原 $180，最低成本 $120（67%）。收至 $150（80% usage）。
- 壓接進階關，玩家已學會機制，應有預算壓力

### D7: L22 收緊預算至 $250

原 $300，最低成本 $200（67%）。收至 $250（80% usage）。
- 走線進階關，迴路規劃選擇會影響預算

### D8: L23 收緊預算至 $350

原 $400，最低成本 $295（74%）。收至 $350（84% usage）。
- 畢業考，全方位壓力

### D9: 全面收緊 mainBreakerRating

StatusDisplay 主開關負載指示器 ≥80% 橘色、≥100% 紅色。顯示百分比 = totalCurrent / (rating × 1.25)。
目前多數關卡負載率 30-65%，指示器無意義。

分級策略：
- 教學關（L06/L07/L13/L16/L21）：50-65%，有感但不壓迫
- 中階關（L08/L09/L11/L14/L17/L22）：70-80%，橘色邊緣
- 進階關（L10/L12/L15/L23）：80-90%，深橘色

具體調整（L12 已 84% 不動）：

| 關卡 | 總電流 | 舊 Rating | 舊負載% | 新 Rating | 新負載% |
|------|--------|----------|---------|----------|---------|
| L06 | 26.3A | 50A | 42% | 35A | 60% |
| L07 | 18.2A | 50A | 29% | 30A | 49% |
| L08 | 40.0A | 50A | 64% | 40A | 80% |
| L09 | 37.2A | 50A | 60% | 40A | 74% |
| L10 | 68.2A | 75A | 73% | 60A | 91% |
| L11 | 44.5A | 75A | 47% | 50A | 71% |
| L13 | 18.4A | 50A | 29% | 30A | 49% |
| L14 | 32.9A | 50A | 53% | 35A | 75% |
| L15 | 60.2A | 75A | 64% | 60A | 80% |
| L16 | 12.7A | 50A | 20% | 20A | 51% |
| L17 | 37.2A | 50A | 60% | 40A | 74% |
| L21 | 20.0A | 50A | 32% | 30A | 53% |
| L22 | 57.3A | 75A | 61% | 60A | 76% |
| L23 | 72.9A | 75A | 65A | 78% | 90% |

注意：主開關不會實際跳脫（totalCurrent < rating × 1.25），但負載指示器的視覺回饋讓玩家感受到電力系統的壓力。

## Risks / Trade-offs

- **NFB 成本 bug 修正影響所有自由配關卡**：修正後所有自由配關卡的 finalCost 會比修正前高（多了 NFB 費用），但由於預算本就考慮了 NFB 成本，不會造成不合理的難度增加。
- **L10 預算提高可能感覺偏鬆**：$280 相對 $240 最低成本有 17% headroom，但考慮到這是 7 台電器、5 房間的複雜關卡，新手需要摸索空間。
- **L14/L15 bonus 不再測試 ELCB 意識**：改為 cost/time bonus 後，不再直接獎勵「正確安裝 ELCB」的行為。但 ELCB 已是送電前置條件（wetArea 強制），無需 bonus 重複驗證。
- **mainBreakerRating 非標準值**：部分值（35A, 65A）不是常見標準規格，但遊戲中 mainBreakerRating 為抽象數值不受限於實際產品規格。
