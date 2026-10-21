import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { VehicleDamagePoint } from '../../types';

interface VehicleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobNumber: string;
  vehicleModel: string;
  initialPoints?: VehicleDamagePoint[];
  onSave: (points: VehicleDamagePoint[]) => void;
}

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

  if (!isOpen) return null;

  const carZones = [
    { id: 'Front Bumper', x: '50%', y: '12%', label: 'Front Bumper' },
    { id: 'Hood', x: '50%', y: '26%', label: 'Hood' },
    { id: 'Windshield', x: '50%', y: '39%', label: 'Windshield' },
    { id: 'Roof', x: '50%', y: '54%', label: 'Roof' },
    { id: 'Driver Front Door', x: '24%', y: '45%', label: 'Driver Door' },
    { id: 'Passenger Front Door', x: '76%', y: '45%', label: 'Pass Door' },
    { id: 'Driver Rear Door', x: '24%', y: '62%', label: 'Driver Rear' },
    { id: 'Passenger Rear Door', x: '76%', y: '62%', label: 'Pass Rear' },
    { id: 'Trunk / Tailgate', x: '50%', y: '78%', label: 'Trunk' },
    { id: 'Rear Bumper', x: '50%', y: '90%', label: 'Rear Bumper' },
  ];

  const handleAddPoint = () => {
    const newPoint: VehicleDamagePoint = {
      id: `dmg-${Date.now()}`,
      part: selectedZone,
      type: damageType,
      severity: severity,
    };
    setPoints([...points, newPoint]);
  };

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave(points);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Digital Vehicle Inspection (DVI)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{vehicleModel} &bull; <span style={{ color: 'var(--accent-cyan)' }}>{jobNumber}</span></p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Interactive Car Wireframe Graphic */}
        <div style={{
          position: 'relative',
          width: '260px',
          height: '380px',
          margin: '0 auto 20px',
          background: 'radial-gradient(circle, rgba(14,23,42,0.8) 0%, rgba(8,11,17,0.95) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 30px rgba(6,182,212,0.1)',
        }}>
          {/* Car Body Silhouette SVG */}
          <svg width="220" height="340" viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 15C32 8 40 4 50 4C60 4 68 8 68 15L74 38C76 45 78 54 78 75L78 115C78 132 75 142 72 148C69 154 62 156 50 156C38 156 31 154 28 148C25 142 22 132 22 115L22 75C22 54 24 45 26 38L32 15Z"
              fill="#131d31"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Windshield */}
            <path d="M30 40H70L66 58H34L30 40Z" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1" />
            {/* Roof */}
            <rect x="33" y="60" width="34" height="32" rx="4" fill="#0f172a" stroke="#0ea5e9" strokeWidth="0.8" />
            {/* Rear Window */}
            <path d="M34 94H66L68 108H32L34 94Z" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1" />
            {/* Headlights */}
            <ellipse cx="28" cy="18" rx="4" ry="7" fill="#38bdf8" opacity="0.6" />
            <ellipse cx="72" cy="18" rx="4" ry="7" fill="#38bdf8" opacity="0.6" />
            {/* Taillights */}
            <ellipse cx="27" cy="148" rx="4" ry="6" fill="#ef4444" opacity="0.7" />
            <ellipse cx="73" cy="148" rx="4" ry="6" fill="#ef4444" opacity="0.7" />
          </svg>

          {/* Interactive Inspection Hotspots */}
          {carZones.map((zone) => {
            const hasDamage = points.some((p) => p.part === zone.id);
            const isSelected = selectedZone === zone.id;

            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                title={zone.label}
                style={{
                  position: 'absolute',
                  left: zone.x,
                  top: zone.y,
                  transform: 'translate(-50%, -50%)',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid white' : hasDamage ? '2px solid #ef4444' : '1px solid rgba(6,182,212,0.6)',
                  background: hasDamage ? '#ef4444' : isSelected ? 'var(--accent-cyan)' : 'rgba(15,23,42,0.85)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: hasDamage ? '0 0 12px #ef4444' : isSelected ? '0 0 12px var(--accent-cyan)' : 'none',
                  transition: 'all 0.2s',
                  zIndex: 10,
                }}
              >
                {hasDamage ? '!' : isSelected ? '✓' : ''}
              </button>
            );
          })}
        </div>

        {/* Defect Logger Tool */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Selected Area: <strong style={{ color: 'white' }}>{selectedZone}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Defect Type</label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                }}
              >
                <option value="Scratch">Scratch</option>
                <option value="Dent">Dent</option>
                <option value="Crack">Crack</option>
                <option value="Wear">Tire / Brake Wear</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                }}
              >
                <option value="Low">Low (Surface mark)</option>
                <option value="Medium">Medium (Noticeable)</option>
                <option value="High">High (Deep / Broken)</option>
              </select>
            </div>
          </div>

          <button onClick={handleAddPoint} className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
            + Log Defect on {selectedZone}
          </button>
        </div>

        {/* Recorded Damage List */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Recorded Defects ({points.length})
          </h4>
          {points.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '10px' }}>
              No defects recorded. Tap vehicle zones to log body condition.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {points.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} color="#f59e0b" />
                    <span><strong>{p.part}</strong>: {p.type} ({p.severity})</span>
                  </div>
                  <button
                    onClick={() => handleRemovePoint(p.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSaveAndClose} className="btn-primary" style={{ flex: 1 }}>
            <CheckCircle size={16} /> Save Inspection Report
          </button>
        </div>
      </div>
    </div>
  );
};
