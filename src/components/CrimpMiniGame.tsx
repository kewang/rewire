import { useState, useRef, useCallback, useEffect } from 'react';
import type { Wire, CrimpResult, CrimpTerminalType, CrimpQuality } from '../types/game';
import { CRIMP_TERMINALS, CRIMP_QUALITY_MAP } from '../data/constants';

interface CrimpMiniGameProps {
  wire: Wire;
  circuitLabel: string;
  onComplete: (result: CrimpResult) => void;
}

/** Progress bar speed (units/sec, 0→1 range) */
const BAR_SPEED = 0.8;

/** Sweet spot center position (0-1) */
const SWEET_SPOT_CENTER = 0.5;

/** Sweet spot thresholds */
const EXCELLENT_HALF_WIDTH = 0.05;
const GOOD_HALF_WIDTH = 0.15;

const QUALITY_LABELS: Record<CrimpQuality, string> = {
  excellent: '完美壓接',
  good: '良好壓接',
  poor: '壓接不良',
  none: '未壓接',
};

function getQualityFromPosition(pos: number): CrimpQuality {
  const dist = Math.abs(pos - SWEET_SPOT_CENTER);
  if (dist <= EXCELLENT_HALF_WIDTH) return 'excellent';
  if (dist <= GOOD_HALF_WIDTH) return 'good';
  return 'poor';
}

function getQualityColor(quality: CrimpQuality): string {
  switch (quality) {
    case 'excellent': return '#22c55e';
    case 'good': return '#84cc16';
    case 'poor': return '#f97316';
    case 'none': return '#ef4444';
  }
}

export default function CrimpMiniGame({ wire, circuitLabel, onComplete }: CrimpMiniGameProps) {
  const [step, setStep] = useState<'select' | 'crimp' | 'result'>('select');
  const [selectedTerminal, setSelectedTerminal] = useState<CrimpTerminalType | null>(null);
  const [barPosition, setBarPosition] = useState(0);
  const [crimpResult, setCrimpResult] = useState<{ quality: CrimpQuality; contactResistance: number } | null>(null);

  const rafRef = useRef(0);
  const prevTimeRef = useRef(0);
  const barPosRef = useRef(0);
  const directionRef = useRef(1);

  // Animate progress bar
  useEffect(() => {
    if (step !== 'crimp') return;

    const animate = (timestamp: number) => {
      if (prevTimeRef.current === 0) {
        prevTimeRef.current = timestamp;
      }
      const dt = (timestamp - prevTimeRef.current) / 1000;
      prevTimeRef.current = timestamp;

      let pos = barPosRef.current + directionRef.current * BAR_SPEED * dt;
      if (pos >= 1) {
        pos = 1;
        directionRef.current = -1;
      } else if (pos <= 0) {
        pos = 0;
        directionRef.current = 1;
      }
      barPosRef.current = pos;
      setBarPosition(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    barPosRef.current = 0;
    prevTimeRef.current = 0;
    directionRef.current = 1;
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  const handleTerminalSelect = useCallback((type: CrimpTerminalType) => {
    setSelectedTerminal(type);
    setStep('crimp');
  }, []);

  const handleCrimpPress = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const quality = getQualityFromPosition(barPosRef.current);
    const contactResistance = CRIMP_QUALITY_MAP[quality];
    setCrimpResult({ quality, contactResistance });
    setStep('result');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedTerminal || !crimpResult) return;
    onComplete({
      terminalType: selectedTerminal,
      quality: crimpResult.quality,
      contactResistance: crimpResult.contactResistance,
    });
  }, [selectedTerminal, crimpResult, onComplete]);

  return (
    <div className="crimp-overlay" onPointerDown={step === 'crimp' ? handleCrimpPress : undefined}>
      <div
        className="crimp-card"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="crimp-header">
          <div className="crimp-header-tag">CRIMP</div>
          <h2 className="crimp-title">壓接端子</h2>
          <div className="crimp-circuit-label">{circuitLabel} — {wire.crossSection}mm²</div>
        </div>

        {/* Step 1: Terminal Selection */}
        {step === 'select' && (
          <div className="crimp-step crimp-step-select">
            <div className="crimp-step-label">
              <span className="crimp-step-num">01</span>
              選擇端子類型
            </div>
            <div className="crimp-terminal-options">
              {CRIMP_TERMINALS.map((terminal) => {
                const compatible = (terminal.compatibleCrossSections as readonly number[]).includes(wire.crossSection);
                return (
                  <button
                    key={terminal.type}
                    className={`crimp-terminal-btn ${!compatible ? 'disabled' : ''}`}
                    disabled={!compatible}
                    onClick={() => handleTerminalSelect(terminal.type)}
                  >
                    <div className="crimp-terminal-icon">
                      {terminal.type === 'o-ring' ? (
                        <svg width="48" height="48" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                          <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                        </svg>
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 48 48">
                          <path d="M16 38 L24 20 L32 38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="24" y1="20" x2="24" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <div className="crimp-terminal-name">{terminal.name}</div>
                    <div className="crimp-terminal-compat">
                      {compatible
                        ? terminal.compatibleCrossSections.join(' / ') + ' mm²'
                        : '不相容此線徑'
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Crimp Action */}
        {step === 'crimp' && (
          <div
            className="crimp-step crimp-step-action"
            onPointerDown={handleCrimpPress}
          >
            <div className="crimp-step-label">
              <span className="crimp-step-num">02</span>
              壓接操作
            </div>
            <div className="crimp-instruction">點擊甜蜜區停止</div>

            <div className="crimp-bar-container">
              {/* Zone markers */}
              <div className="crimp-bar-zones">
                <div
                  className="crimp-zone crimp-zone-poor-left"
                  style={{ left: '0%', width: `${(SWEET_SPOT_CENTER - GOOD_HALF_WIDTH) * 100}%` }}
                />
                <div
                  className="crimp-zone crimp-zone-good-left"
                  style={{ left: `${(SWEET_SPOT_CENTER - GOOD_HALF_WIDTH) * 100}%`, width: `${(GOOD_HALF_WIDTH - EXCELLENT_HALF_WIDTH) * 100}%` }}
                />
                <div
                  className="crimp-zone crimp-zone-excellent"
                  style={{ left: `${(SWEET_SPOT_CENTER - EXCELLENT_HALF_WIDTH) * 100}%`, width: `${EXCELLENT_HALF_WIDTH * 2 * 100}%` }}
                />
                <div
                  className="crimp-zone crimp-zone-good-right"
                  style={{ left: `${(SWEET_SPOT_CENTER + EXCELLENT_HALF_WIDTH) * 100}%`, width: `${(GOOD_HALF_WIDTH - EXCELLENT_HALF_WIDTH) * 100}%` }}
                />
                <div
                  className="crimp-zone crimp-zone-poor-right"
                  style={{ left: `${(SWEET_SPOT_CENTER + GOOD_HALF_WIDTH) * 100}%`, width: `${(1 - SWEET_SPOT_CENTER - GOOD_HALF_WIDTH) * 100}%` }}
                />
              </div>

              {/* Track */}
              <div className="crimp-bar-track">
                {/* Sweet spot highlight */}
                <div
                  className="crimp-sweet-spot"
                  style={{
                    left: `${(SWEET_SPOT_CENTER - EXCELLENT_HALF_WIDTH) * 100}%`,
                    width: `${EXCELLENT_HALF_WIDTH * 2 * 100}%`,
                  }}
                />
                {/* Needle */}
                <div
                  className="crimp-bar-needle"
                  style={{ left: `${barPosition * 100}%` }}
                >
                  <div className="crimp-needle-head" />
                </div>
              </div>

              {/* Zone labels */}
              <div className="crimp-bar-labels">
                <span className="crimp-label-poor">POOR</span>
                <span className="crimp-label-good">GOOD</span>
                <span className="crimp-label-excellent">EXCELLENT</span>
                <span className="crimp-label-good">GOOD</span>
                <span className="crimp-label-poor">POOR</span>
              </div>
            </div>

            <div className="crimp-tap-hint">TAP ANYWHERE</div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && crimpResult && (
          <div className="crimp-step crimp-step-result">
            <div className="crimp-step-label">
              <span className="crimp-step-num">03</span>
              壓接結果
            </div>

            <div
              className="crimp-result-display"
              style={{ '--crimp-quality-color': getQualityColor(crimpResult.quality) } as React.CSSProperties}
            >
              <div className="crimp-quality-badge">
                {QUALITY_LABELS[crimpResult.quality]}
              </div>
              <div className="crimp-result-stats">
                <div className="crimp-stat">
                  <span className="crimp-stat-label">接觸電阻倍率</span>
                  <span className="crimp-stat-value">×{crimpResult.contactResistance.toFixed(2)}</span>
                </div>
                <div className="crimp-stat">
                  <span className="crimp-stat-label">有效電流倍率</span>
                  <span className="crimp-stat-value">×{Math.sqrt(crimpResult.contactResistance).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="crimp-confirm-btn" onClick={handleConfirm}>
              確認
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
