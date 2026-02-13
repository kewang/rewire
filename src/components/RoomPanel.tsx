import { useTranslation } from 'react-i18next';
import './RoomPanel.css';
import type { Appliance, FreeCircuitLevel, PlannerCircuit } from '../types/game';
import { tRoomName, tApplianceName } from '../i18nHelpers';

interface RoomPanelProps {
  readonly rooms: FreeCircuitLevel['rooms'];
  readonly circuits: readonly PlannerCircuit[];
  readonly onAssign: (appliance: Appliance, roomId: string, roomApplianceIndex: number) => void;
}

/** Check if a specific room appliance is assigned to any circuit */
function isAssigned(
  circuits: readonly PlannerCircuit[],
  roomId: string,
  roomApplianceIndex: number,
): { assigned: boolean; circuitId?: string } {
  for (const circuit of circuits) {
    for (const a of circuit.assignedAppliances) {
      if (a.roomId === roomId && a.roomApplianceIndex === roomApplianceIndex) {
        return { assigned: true, circuitId: circuit.id };
      }
    }
  }
  return { assigned: false };
}

export default function RoomPanel({ rooms, circuits, onAssign }: RoomPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="room-panel">
      <h3 className="room-panel-title">{t('room.title')}</h3>
      {rooms.map(room => (
        <div key={room.id} className="room-card">
          <div className="room-card-header">
            <span className="room-name">{tRoomName(t, room.name)}</span>
            {room.wetArea && <span className="room-wet-badge" title={t('room.wetArea')}>💧</span>}
          </div>
          <ul className="room-appliances">
            {room.appliances.map((appliance, idx) => {
              const status = isAssigned(circuits, room.id, idx);
              const current = (appliance.power / appliance.voltage).toFixed(1);
              const circuitLabel = status.circuitId
                ? circuits.find(c => c.id === status.circuitId)?.id.replace('pc-', t('room.circuitPrefix'))
                : undefined;
              return (
                <li
                  key={idx}
                  className={`room-appliance ${status.assigned ? 'assigned' : 'unassigned'}`}
                  onClick={() => {
                    if (!status.assigned) {
                      onAssign(appliance, room.id, idx);
                    }
                  }}
                >
                  <span className="appliance-name">{tApplianceName(t, appliance.name)}</span>
                  <span className="appliance-info">
                    {appliance.power}W / {appliance.voltage}V / {current}A
                  </span>
                  {status.assigned && circuitLabel && (
                    <span className="appliance-assigned-to">→ {circuitLabel}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
