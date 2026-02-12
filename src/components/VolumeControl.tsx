import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMasterVolume, isMuted, setMasterVolume, setMuted } from '../engine/audio';

export default function VolumeControl() {
  const { t } = useTranslation();
  const [volume, setVolume] = useState(() => getMasterVolume());
  const [muted, setMutedState] = useState(() => isMuted());

  const handleToggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    // If unmuting from 0 volume, bump to default
    if (!next && volume === 0) {
      setMasterVolume(0.5);
      setVolume(0.5);
    }
  }, [muted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100;
    setMasterVolume(val);
    setVolume(val);
    setMutedState(val === 0);
  }, []);

  const pct = muted ? 0 : Math.round(volume * 100);

  return (
    <div className="volume-control" title={t('volume.label')}>
      <button
        className="volume-control__icon"
        onClick={handleToggleMute}
        aria-label={muted ? t('volume.unmute') : t('volume.mute')}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {/* Speaker body */}
          <path
            d="M3 7.5h3l4-3.5v12l-4-3.5H3a1 1 0 01-1-1v-3a1 1 0 011-1z"
            fill="currentColor"
          />
          {!muted && volume > 0 && (
            <>
              {/* Small wave — always shown when not muted */}
              <path
                d="M13 8.5a2.5 2.5 0 010 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Large wave — shown at higher volume */}
              {volume > 0.4 && (
                <path
                  d="M15 6.5a5 5 0 010 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </>
          )}
          {/* Mute slash */}
          {muted && (
            <path
              d="M15 7l-4 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      <input
        type="range"
        className="volume-control__slider"
        min="0"
        max="100"
        value={pct}
        onChange={handleVolumeChange}
        aria-label={t('volume.label')}
        style={{ '--volume-pct': `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
