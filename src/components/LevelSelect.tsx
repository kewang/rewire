import { useMemo } from 'react';
import type { Level } from '../types/game';
import { loadBestStars } from '../engine/scoring';

interface LevelSelectProps {
  levels: readonly Level[];
  onSelect: (level: Level) => void;
}

export default function LevelSelect({ levels, onSelect }: LevelSelectProps) {
  const bestStars = useMemo(() => loadBestStars(), []);

  return (
    <div className="level-select">
      <h1>Project Rewire</h1>
      <p className="subtitle">配電盤燒線模擬器</p>
      <h2>選擇關卡</h2>
      <div className="level-list">
        {levels.map((level, index) => (
          <button
            key={level.name}
            className="level-card"
            onClick={() => onSelect(level)}
          >
            <div className="card-title">{level.name}</div>
            <div className="level-stars-row">
              {[1, 2, 3].map(i => (
                <span key={i} className={`level-star ${i <= (bestStars[index] ?? 0) ? 'level-star-lit' : 'level-star-dim'}`}>&#9733;</span>
              ))}
            </div>
            <div className="card-detail">{level.description}</div>
            <div className="card-detail card-detail-ellipsis">
              電器：{level.requiredAppliances.map((a) => a.name).join('、')}
            </div>
            <div className="card-detail">
              預算：${level.budget} ｜ 通電目標：{level.survivalTime}秒
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
