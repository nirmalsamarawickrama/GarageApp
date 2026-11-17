import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Crosshair } from 'lucide-react';
import { VehicleDamagePoint } from '../../types';

interface VehicleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobNumber: string;
  vehicleModel: string;
  initialPoints?: VehicleDamagePoint[];
  onSave: (points: VehicleDamagePoint[]) => void;
}

const CAR_ZONES = [
  { id: 'Front Bumper', x: 50, y: 11, label: 'Front Bumper' },
  { id: 'Hood', x: 50, y: 25, label: 'Hood' },
  { id: 'Windshield', x: 50, y: 39, label: 'Windshield' },
  { id: 'Roof', x: 50, y: 54, label: 'Roof' },
  { id: 'Driver Front Door', x: 22, y: 45, label: 'Driver Door' },
  { id: 'Passenger Front Door', x: 78, y: 45, label: 'Pass Door' },
  { id: 'Driver Rear Door', x: 22, y: 63, label: 'Driver Rear' },
  { id: 'Passenger Rear Door', x: 78, y: 63, label: 'Pass Rear' },
  { id: 'Trunk / Tailgate', x: 50, y: 78, label: 'Trunk' },
  { id: 'Rear Bumper', x: 50, y: 90, label: 'Rear Bumper' },
];

export const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({
  isOpen,
  onClose,
  jobNumber,
  vehicleModel,
  initialPoints = [],
  onSave,
}) => {
  const [points, setPoints] = useState<VehicleDamagePoint[]>(initialPoints);
  const [selectedZone, setSelectedZone] = useState<string>('Front Bumper');
  const [damageType, setDamageType] = useState<'Scratch' | 'Dent' | 'Crack' | 'Wear'>('Scratch');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const activeZoneObj = CAR_ZONES.find((z) => z.id === selectedZone) || CAR_ZONES[0];

  const handleAddPoint = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `dmg-${crypto.randomUUID().slice(0, 8)}`
        : `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPoint: VehicleDamagePoint = {
      id,
      part: selectedZone,
      type: damageType,
      severity,
      notes: notes.trim() || undefined,
    };
    setPoints([...points, newPoint]);
    setNotes('');
  };

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave(points);
    onClose();
  };

  const getSeverityBadgeClass = (sev: VehicleDamagePoint['severity']) => {
    if (sev === 'High') return 'sg-badge sg-badge-repair';
    if (sev === 'Medium') return 'sg-badge sg-badge-diagnosis';
    return 'sg-badge sg-badge-intake';
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Digital Vehicle Inspection">
      <div className="sg-modal" style={{ maxWidth: '620px' }}>
        <div className="sg-modal-header">
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>360° Digital Vehicle Inspection (DVI)</h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {vehicleModel} &bull; <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{jobNumber}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close inspection"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CAD Blueprint Canvas + Crosshair Telemetry */}
          <div className="sg-dvi-layout">
            <div
              style={{
                position: 'relative',
                width: '236px',
                height: '340px',
                backgroundColor: 'var(--bg-recessed)',
                backgroundImage:
                  'linear-gradient(to right, oklch(1 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                border: '2px solid var(--border-strong)',
                borderRadius: 'var(--radius-control)',
                boxShadow: 'var(--shadow-recessed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Dynamic Crosshair Guides locked to Selected Zone */}
              <div
                style={{
                  position: 'absolute',
                  left: `${activeZoneObj.x}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: 'var(--accent-primary)',
                  opacity: 0.65,
                  pointerEvents: 'none',
                  transition: 'left 220ms var(--ease-out-expo)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: `${activeZoneObj.y}%`,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'var(--accent-primary)',
                  opacity: 0.65,
                  pointerEvents: 'none',
                  transition: 'top 220ms var(--ease-out-expo)',
                }}
              />

              {/* Coordinate Stamp */}
              <div
                className="tabular"
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  background: 'var(--bg-surface)',
                  color: 'var(--accent-volt)',
                  border: '1px solid var(--border-strong)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  zIndex: 5,
                }}
              >
                CHASSIS X:{activeZoneObj.x} Y:{activeZoneObj.y}
              </div>

              {/* Technical Vehicle CAD Silhouette SVG */}
              <svg width="200" height="310" viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M32 15C32 8 40 4 50 4C60 4 68 8 68 15L74 38C76 45 78 54 78 75L78 115C78 132 75 142 72 148C69 154 62 156 50 156C38 156 31 154 28 148C25 142 22 132 22 115L22 75C22 54 24 45 26 38L32 15Z"
                  fill="#252320"
                  stroke="#AEA99F"
                  strokeWidth="1.75"
                />
                {/* Hood creases */}
                <line x1="37" y1="20" x2="34" y2="38" stroke="#5A554E" strokeWidth="1" />
                <line x1="63" y1="20" x2="66" y2="38" stroke="#5A554E" strokeWidth="1" />
                {/* Windshield */}
                <path d="M30 40H70L66 58H34L30 40Z" fill="#12110F" stroke="#AEA99F" strokeWidth="1.2" />
                {/* Roof */}
                <rect x="33" y="60" width="34" height="32" rx="2" fill="#312E2A" stroke="#AEA99F" strokeWidth="1" />
                {/* Rear Window */}
                <path d="M34 94H66L68 108H32L34 94Z" fill="#12110F" stroke="#AEA99F" strokeWidth="1.2" />
                {/* Side mirrors */}
                <rect x="16" y="42" width="5" height="8" fill="#AEA99F" />
                <rect x="79" y="42" width="5" height="8" fill="#AEA99F" />
                {/* Headlights & Taillights */}
                <rect x="26" y="13" width="8" height="4" fill="#E6D617" stroke="#12110F" strokeWidth="0.8" />
                <rect x="66" y="13" width="8" height="4" fill="#E6D617" stroke="#12110F" strokeWidth="0.8" />
                <rect x="26" y="145" width="8" height="4" fill="#F55347" stroke="#12110F" strokeWidth="0.8" />
                <rect x="66" y="145" width="8" height="4" fill="#F55347" stroke="#12110F" strokeWidth="0.8" />
              </svg>

              {/* Clickable Zone Hotspots */}
              {CAR_ZONES.map((zone) => {
                const count = points.filter((p) => p.part === zone.id).length;
                const isSelected = selectedZone === zone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone.id)}
                    title={zone.label}
                    style={{
                      position: 'absolute',
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      border: isSelected ? '2px solid var(--text-primary)' : '1.5px solid var(--border-strong)',
                      background:
                        count > 0
                          ? 'var(--accent-danger-solid)'
                          : isSelected
                          ? 'var(--accent-primary)'
                          : 'var(--bg-elevated)',
                      color:
                        count > 0
                          ? '#FFFFFF'
                          : isSelected
                          ? 'var(--ink-on-accent)'
                          : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 10px var(--accent-primary)' : 'none',
                      zIndex: 10,
                    }}
                  >
                    {count > 0 ? count : isSelected ? '+' : ''}
                  </button>
                );
              })}
            </div>

            {/* Defect Logger Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="sg-panel-muted" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Crosshair size={14} color="var(--accent-primary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Zone: {selectedZone}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="sg-label">Defect Type</label>
                    <select
                      className="sg-select"
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value as VehicleDamagePoint['type'])}
                    >
                      <option value="Scratch">Scratch</option>
                      <option value="Dent">Dent</option>
                      <option value="Crack">Crack</option>
                      <option value="Wear">Tire / Brake Wear</option>
                    </select>
                  </div>

                  <div>
                    <label className="sg-label">Severity</label>
                    <select
                      className="sg-select"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as VehicleDamagePoint['severity'])}
                    >
                      <option value="Low">Low (Surface mark)</option>
                      <option value="Medium">Medium (Noticeable)</option>
                      <option value="High">High (Deep / Broken)</option>
                    </select>
                  </div>

                  <div>
                    <label className="sg-label">Technician Note (Optional)</label>
                    <input
                      type="text"
                      className="sg-input"
                      placeholder="e.g. 4cm scuff near trim"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="sg-btn sg-btn-volt"
                    style={{ width: '100%' }}
                  >
                    + Log Defect on {selectedZone}
                  </button>
                </div>
              </div>

              {/* Recorded Damage List */}
              <div>
                <div className="sg-label" style={{ marginBottom: '8px' }}>
                  Recorded Defects ({points.length})
                </div>
                {points.length === 0 ? (
                  <div className="sg-panel-muted" style={{ padding: '14px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No defects logged yet. Select a vehicle zone hotspot to record pre-existing wear.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                    {points.map((p) => (
                      <div
                        key={p.id}
                        className="sg-panel"
                        style={{
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <AlertTriangle size={14} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.part} &bull; {p.type}
                            </div>
                            {p.notes && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.notes}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span className={getSeverityBadgeClass(p.severity)}>{p.severity}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePoint(p.id)}
                            aria-label={`Remove ${p.part} defect`}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent-danger)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sg-modal-footer">
          <button type="button" onClick={onClose} className="sg-btn sg-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSaveAndClose} className="sg-btn sg-btn-primary">
            <CheckCircle size={16} /> Save Inspection Report
          </button>
        </div>
      </div>
    </div>
  );
};
