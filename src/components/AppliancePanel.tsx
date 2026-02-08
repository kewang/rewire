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
  const available = selectedConfig?.availableAppliances ?? [];
  const plugged = circuitAppliances[selectedCircuitId] ?? [];

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
            </button>
          ))}
        </div>
      )}

      <div className="card-list">
        {available.map((a) => (
          <button
            key={a.name}
            className="card"
            onClick={() => onAdd(selectedCircuitId, a)}
            disabled={disabled}
          >
            <div className="card-title">{a.name}</div>
            <div className="card-detail">{a.power}W / {a.voltage}V</div>
            <div className="card-detail">≈ {(a.power / a.voltage).toFixed(1)}A</div>
          </button>
        ))}
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
