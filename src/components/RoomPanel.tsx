import type { Appliance, FreeCircuitLevel, PlannerCircuit } from '../types/game';

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
  return (
    <div className="room-panel">
      <h3 className="room-panel-title">房間 / 電器</h3>
      {rooms.map(room => (
        <div key={room.id} className="room-card">
          <div className="room-card-header">
            <span className="room-name">{room.name}</span>
            {room.wetArea && <span className="room-wet-badge" title="潮濕區域">💧</span>}
          </div>
          <ul className="room-appliances">
            {room.appliances.map((appliance, idx) => {
              const status = isAssigned(circuits, room.id, idx);
              const current = (appliance.power / appliance.voltage).toFixed(1);
              const circuitLabel = status.circuitId
                ? circuits.find(c => c.id === status.circuitId)?.id.replace('pc-', '迴路 ')
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
                  <span className="appliance-name">{appliance.name}</span>
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
