## 1. 型別系統與資料模型

- [x] 1.1 在 CircuitConfig 和 Circuit 新增 `voltage: 110 | 220` 必填欄位
- [x] 1.2 更新 `createSingleCircuitLevel` helper 預設 voltage=110
- [x] 1.3 更新 constants.ts 中已有的 DEFAULT_APPLIANCES 確認 voltage 欄位正確

## 2. 模擬引擎

- [x] 2.1 在 simulation.ts 的 step() 中加入電壓不匹配防禦性檢查（忽略不匹配電器的電流）
- [x] 2.2 更新 calcTotalCurrent() 支援電壓過濾參數

## 3. 電器分配（AppliancePanel）

- [x] 3.1 AppliancePanel 依目標迴路電壓過濾可用電器（電壓不相容顯示 disabled）
- [x] 3.2 Disabled 電器卡片加入電壓不相容提示文字（「需要 220V 迴路」或「需要 110V 迴路」）
- [x] 3.3 電器卡片新增電壓 badge 顯示（"110V" / "220V"）

## 4. 電路圖視覺（CircuitDiagram）

- [x] 4.1 220V 迴路改為雙平行線渲染（紅+黑雙相，間距 4px）
- [x] 4.2 220V 插座改為 T 型 SVG 圖示，110V 維持現有雙扁插座
- [x] 4.3 NFB 視覺區分：220V 顯示 "2P" + 加寬，110V 顯示 "1P"
- [x] 4.4 多迴路時迴路名稱旁顯示電壓標籤（"110V"/"220V"），全同電壓時省略

## 5. 220V 線路特效

- [x] 5.1 220V 雙線同步支援 warning 熱度漸變、smoke 粒子、burned 斷裂特效

## 6. 關卡資料

- [x] 6.1 更新 L06-L07 CircuitConfig 加入 voltage=110（向後相容）
- [x] 6.2 修改 L08：c3 改為 220V 專用迴路（烘衣機），更新可用電器與描述
- [x] 6.3 新增 L09「混合電壓挑戰」關卡（2×110V + 1×220V，30A NFB for 220V）

## 7. 狀態顯示

- [x] 7.1 StatusDisplay 多迴路摘要中顯示各迴路電壓標示
