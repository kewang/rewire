## MODIFIED Requirements

### Requirement: Wire Routing Paths
走線區 SHALL 繪製每條迴路的走線路徑，從匯流排分接點垂直向下連接到對應 NFB。走線路徑 SHALL 分三段著色：上段（匯流排→走線區入口）使用相位色，中段使用漸層從相位色過渡到線徑色，下段（走線區出口→NFB）使用線徑色。220V 迴路的走線粗細 SHALL 為 6px，110V 迴路為 4px。

#### Scenario: R-phase wire color
- **WHEN** 迴路為 110V R 相
- **THEN** 上段走線為紅色(#ef4444)，中段漸變至線徑色，下段為線徑色

#### Scenario: T-phase wire color
- **WHEN** 迴路為 110V T 相
- **THEN** 上段走線為藍色(#60a5fa)，中段漸變至線徑色，下段為線徑色

#### Scenario: 220V wire color
- **WHEN** 迴路為 220V
- **THEN** 上段走線為紫色(#a855f7)，中段漸變至線徑色，下段為線徑色

#### Scenario: Wire colors match gauge in lower segment
- **WHEN** 迴路使用 2.0mm² 線材
- **THEN** 下段走線顏色為綠色(#86efac)

#### Scenario: 220V wire is thicker
- **WHEN** 迴路電壓為 220V
- **THEN** 走線路徑寬度為 6px（一般 110V 為 4px）

### Requirement: Busbar Rendering
匯流排區 SHALL 繪製 R 相（紅色標籤）、T 相（藍色標籤）、N 中性線（灰色標籤）三條水平銅排，銅排顏色為銅色(#d97706)。每條迴路在匯流排上 SHALL 有一個放大的分接點（r=5），填充為對應相位色。分接點旁 SHALL 顯示小文字相位標籤（「R」或「T」）。

#### Scenario: Enlarged tap points with phase color
- **WHEN** 迴路為 110V R 相
- **THEN** R 銅排上的分接點 r=5，填充紅色(#ef4444)，旁邊顯示紅色「R」標籤

#### Scenario: T-phase tap point
- **WHEN** 迴路為 110V T 相
- **THEN** T 銅排上的分接點 r=5，填充藍色(#60a5fa)，旁邊顯示藍色「T」標籤

#### Scenario: 220V dual tap points
- **WHEN** 迴路為 220V
- **THEN** R 和 T 銅排上各有一個分接點，兩點之間用短虛線連接

#### Scenario: Busbar tap points for mixed voltage circuits
- **WHEN** 迴路包含 110V R 相、110V T 相、220V 迴路
- **THEN** R 相迴路的分接點出現在 R 銅排左側區域，T 相迴路的分接點出現在 T 銅排右側區域，220V 迴路的分接點出現在中間區域跨接 R-T

## ADDED Requirements

### Requirement: Neutral Return Path
每個 110V 迴路 SHALL 繪製一條灰色虛線中性線回路，從 NFB 下方連接到 N 匯流排。

#### Scenario: 110V circuit neutral line
- **WHEN** 迴路為 110V（R 或 T 相）
- **THEN** 繪製灰色虛線（strokeDasharray="4 4"，opacity=0.3）從 NFB 底部垂直向下再水平連接到 N 匯流排 tap point

#### Scenario: 220V circuit no neutral
- **WHEN** 迴路為 220V
- **THEN** 不繪製 N 回路虛線（220V 跨 R-T，無中性線）

#### Scenario: N tap point rendering
- **WHEN** 110V 迴路的 N 回路虛線連接到 N 匯流排
- **THEN** N 匯流排上的 tap point r=4，灰色填充
