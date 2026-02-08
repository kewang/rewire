import { useState } from 'react';
import type { Appliance, CircuitConfig, CircuitId } from '../types/game';

interface AppliancePanelProps {
  circuitConfigs: readonly CircuitConfig[];
  circuitAppliances: Record<CircuitId, Appliance[]>;
  onAdd: (circuitId: CircuitId, appliance: Appliance) => void;
  onRemove: (circuitId: CircuitId, index: number) => void;
  disabled: boolean;
  isPowered: boolean;
}

export default function AppliancePanel({ circuitConfigs, circuitAppliances, onAdd, onRemove, disabled, isPowered }: AppliancePanelProps) {
  const isSingle = circuitConfigs.length === 1;
  const [selectedCircuitId, setSelectedCircuitId] = useState<CircuitId>(circuitConfigs[0]?.id ?? '');

  const selectedConfig = circuitConfigs.find(c => c.id === selectedCircuitId) ?? circuitConfigs[0];
  const circuitVoltage = selectedConfig?.voltage ?? 110;
  const available = selectedConfig?.availableAppliances ?? [];
  const plugged = circuitAppliances[selectedCircuitId] ?? [];

  // Check if level has mixed voltages (to decide whether to show voltage badges)
  const hasMixedVoltage = circuitConfigs.length > 1 &&
    new Set(circuitConfigs.map(c => c.voltage)).size > 1;

  return (
    <div className="appliance-panel">
      <h3>電器</h3>

      {/* Circuit selector tabs (hidden for single circuit) */}
      {!isSingle && (
        <div className="circuit-tabs">
          {circuitConfigs.map(config => (
            <button
              key={config.id}
              className={`circuit-tab ${config.id === selectedCircuitId ? 'active' : ''}`}
              onClick={() => setSelectedCircuitId(config.id)}
            >
              {config.label}
              {hasMixedVoltage && <span className="voltage-tab-badge">{config.voltage}V</span>}
            </button>
          ))}
        </div>
      )}

      <div className="card-list">
        {available.map((a) => {
          const voltageIncompat = a.voltage !== circuitVoltage;
          return (
            <button
              key={a.name}
              className={`card${voltageIncompat ? ' voltage-disabled' : ''}`}
              onClick={() => !voltageIncompat && onAdd(selectedCircuitId, a)}
              disabled={disabled || voltageIncompat}
              title={voltageIncompat ? `需要 ${a.voltage}V 迴路` : undefined}
            >
              <div className="card-title">
                {a.name}
                {hasMixedVoltage && <span className={`voltage-badge v${a.voltage}`}>{a.voltage}V</span>}
              </div>
              <div className="card-detail">{a.power}W / {a.voltage}V</div>
              <div className="card-detail">≈ {(a.power / a.voltage).toFixed(1)}A</div>
              {voltageIncompat && (
                <div className="card-hint voltage-hint">需要 {a.voltage}V 迴路</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Plugged appliances - show per circuit for multi, flat for single */}
      {isSingle ? (
        plugged.length > 0 && (
          <>
            <h4>已插入插座</h4>
            <div className="card-list">
              {plugged.map((a, i) => (
                <button
                  key={i}
                  className={`card plugged${isPowered ? ' operating' : ''}`}
                  onClick={() => onRemove(selectedCircuitId, i)}
                  disabled={disabled}
                >
                  <div className="card-title">{a.name}</div>
                  <div className="card-detail">{(a.power / a.voltage).toFixed(1)}A</div>
                  <div className="card-hint">點擊移除</div>
                </button>
              ))}
            </div>
          </>
        )
      ) : (
        circuitConfigs.map(config => {
          const appls = circuitAppliances[config.id] ?? [];
          if (appls.length === 0) return null;
          return (
            <div key={config.id}>
              <h4>{config.label} 已插入</h4>
              <div className="card-list">
                {appls.map((a, i) => (
                  <button
                    key={i}
                    className={`card plugged${isPowered ? ' operating' : ''}`}
                    onClick={() => onRemove(config.id, i)}
                    disabled={disabled}
                  >
                    <div className="card-title">{a.name}</div>
                    <div className="card-detail">{(a.power / a.voltage).toFixed(1)}A</div>
                    <div className="card-hint">點擊移除</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
