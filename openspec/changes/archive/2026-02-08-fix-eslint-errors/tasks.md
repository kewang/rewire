## 1. CircuitDiagram ref-during-render 修復

- [x] 1.1 在 CircuitDiagram 新增 `previewY` state，將 L480-485 的 render-time svgRef 計算移入既有的 useEffect（L452），在 effect 中設定 previewY state
- [x] 1.2 render body 改為讀取 previewY state 值，移除直接 svgRef.current 存取

## 2. GameBoard tick 宣告順序修復

- [x] 2.1 將 `useEffect`（送電啟動 rAF 的 effect）移到 `tick` useCallback 宣告之後

## 3. GameBoard circuitConfigs 穩定引用修復

- [x] 3.1 提取模組級常數 `EMPTY_CONFIGS: CircuitConfig[] = []`，將 `currentLevel?.circuitConfigs ?? []` 改為 `currentLevel?.circuitConfigs ?? EMPTY_CONFIGS`

## 4. 驗證

- [x] 4.1 執行 `npm run lint` 確認零 errors 零 warnings
- [x] 4.2 執行 `npm run build` 確認編譯正常
