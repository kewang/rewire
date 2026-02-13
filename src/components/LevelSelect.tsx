import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './LevelSelect.css';
import type { Level } from '../types/game';
import { isFreeCircuitLevel } from '../types/helpers';
import { loadBestStars } from '../engine/scoring';
import { generateRandomOldHouse, loadRandomCompletions } from '../engine/randomOldHouse';
import { LEVELS } from '../data/levels';
import type { TFunction } from 'i18next';
import { tApplianceName, tLevelName, tLevelDesc } from '../i18nHelpers';
import LanguageSwitcher from './LanguageSwitcher';

function getLevelAppliances(level: Level, t: TFunction, lang: string): string {
  const names = isFreeCircuitLevel(level)
    ? level.rooms.flatMap(r => r.appliances).map(a => tApplianceName(t, a.name))
    : level.requiredAppliances.map(a => tApplianceName(t, a.name));
  return names.join(lang === 'en' ? ', ' : '\u3001');
}

interface LevelSelectProps {
  levels: readonly Level[];
  onSelect: (level: Level) => void;
}

export default function LevelSelect({ levels, onSelect }: LevelSelectProps) {
  const bestStars = useMemo(() => loadBestStars(), []);
  const randomCompletions = useMemo(() => loadRandomCompletions(), []);
  const { t, i18n } = useTranslation();

  const handleRandomSelect = useCallback((difficulty: 1 | 2 | 3) => {
    const level = generateRandomOldHouse(difficulty);
    onSelect(level);
  }, [onSelect]);

  const RANDOM_DIFFICULTIES = [
    { difficulty: 1 as const, name: t('random.beginner'), desc: t('random.beginnerDesc'), icon: '1' },
    { difficulty: 2 as const, name: t('random.intermediate'), desc: t('random.intermediateDesc'), icon: '2' },
    { difficulty: 3 as const, name: t('random.advanced'), desc: t('random.advancedDesc'), icon: '3' },
  ] as const;

  return (
    <div className="level-select">
      <div className="level-select-header">
        <h1>{t('app.title')}</h1>
        <LanguageSwitcher />
      </div>
      <p className="subtitle">{t('app.subtitle')}</p>
      <h2>{t('levelSelect.selectLevel')}</h2>
      <div className="level-list">
        {levels.map((level, index) => {
          const levelIdx = LEVELS.indexOf(level) >= 0 ? LEVELS.indexOf(level) : index;
          return (
            <button
              key={level.name}
              className="level-card"
              onClick={() => onSelect(level)}
            >
              <div className="card-title">{tLevelName(t, levelIdx)}</div>
              <div className="level-stars-row">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`level-star ${i <= (bestStars[index] ?? 0) ? 'level-star-lit' : 'level-star-dim'}`}>&#9733;</span>
                ))}
              </div>
              <div className="card-detail">{tLevelDesc(t, levelIdx)}</div>
              <div className="card-detail card-detail-ellipsis">
                {t('levelSelect.appliances')}: {getLevelAppliances(level, t, i18n.language)}
              </div>
              <div className="card-detail">
                {t('levelSelect.budget')}: ${level.budget} | {t('levelSelect.powerGoal')}: {level.survivalTime}{t('levelSelect.seconds')}
              </div>
            </button>
          );
        })}
      </div>

      <h2 className="random-section-title">{t('random.title')}</h2>
      <div className="random-old-house-grid">
        {RANDOM_DIFFICULTIES.map(({ difficulty, name, desc, icon }) => (
          <button
            key={difficulty}
            className="random-card"
            onClick={() => handleRandomSelect(difficulty)}
          >
            <div className="random-card-icon">{icon}</div>
            <div className="random-card-name">{name}</div>
            <div className="random-card-desc">{desc}</div>
            {(randomCompletions[String(difficulty)] ?? 0) > 0 && (
              <div className="random-card-completions">
                {t('random.completions', { count: randomCompletions[String(difficulty)] })}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
