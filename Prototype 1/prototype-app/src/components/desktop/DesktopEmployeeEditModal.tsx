import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';
import { Employee, JobCard } from '../../types';
import { syncEngine } from '../../state/syncEngine';

interface DesktopEmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  jobs?: JobCard[];
  onSaved?: () => void;
}

const BAY_OPTIONS = [
  'Bay 1 (2-Post Lift)',
  'Bay 2 (Quick Lube Pit)',
  'Bay 3 (ECU Diagnostic Lab)',
  'Bay 4 (Alignment Rack)',
  'Bay 5 (Heavy Transmission Lift)',
  'Bay 6 (Inspection & DVI Pit)',
  'Paint & Detailing Booth',
  'Unassigned / Roaming',
];

const ROLE_OPTIONS: Employee['role'][] = [
  'Master Technician',
  'Diagnostic Specialist',
  'Service Advisor',
  'Quick Lube Tech',
  'Workshop Manager',
];

export const DesktopEmployeeEditModal: React.FC<DesktopEmployeeEditModalProps> = (props) => {
  if (!props.isOpen || !props.employee) return null;
  return <DesktopEmployeeEditModalContent {...props} employee={props.employee} />;
};

const DesktopEmployeeEditModalContent: React.FC<DesktopEmployeeEditModalProps & { employee: Employee }> = ({
  onClose,
  employee,
  jobs = [],
  onSaved,
}) => {
  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState(employee.role);
  const [phone, setPhone] = useState(employee.phone);
  const [status, setStatus] = useState<Employee['status']>(employee.status);
  const [activeBay, setActiveBay] = useState(employee.activeBay || BAY_OPTIONS[0]);
  const [currentJobCardId, setCurrentJobCardId] = useState(employee.currentJobCardId || '');
  const [actualHours, setActualHours] = useState(employee.actualHoursThisMonth);
  const [billedHours, setBilledHours] = useState(employee.billedHoursThisMonth);

  const efficiency = actualHours > 0 ? Math.round((billedHours / actualHours) * 100) : 100;

  const handleSave = () => {
    syncEngine.updateEmployee(employee.id, {
      name,
      role,
      phone,
      status,
      activeBay: activeBay === 'Unassigned / Roaming' ? undefined : activeBay,
      currentJobCardId: currentJobCardId || undefined,
      actualHoursThisMonth: actualHours,
      billedHoursThisMonth: billedHours,
      efficiencyRating: efficiency,
    });

    if (onSaved) onSaved();
    onClose();
  };

  const getStatusBadgeStyle = (st: Employee['status']) => {
    switch (st) {
      case 'Working on Job':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      case 'Available':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'On Break':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Off Duty':
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const statusStyle = getStatusBadgeStyle(status);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 130,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-accent)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.9)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: '2px solid var(--accent-cyan)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>
                  {name}
                </h2>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                }}>
                  {status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {role} • ID: {employee.id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Quick Bar */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
              Operational Status (Bay / Workshop Floor)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {(['Available', 'Working on Job', 'On Break', 'Off Duty'] as Employee['status'][]).map((st) => {
                const isSelected = status === st;
                const style = getStatusBadgeStyle(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${style.text}` : '1px solid var(--border-card)',
                      background: isSelected ? style.bg : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? style.text : 'var(--text-muted)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bay Assignment & Active Job Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={16} color="var(--accent-cyan)" />
              <span>Bay Assignment &amp; Work Queue</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Assigned Bay / Lift Station
                </label>
                <select
                  value={activeBay}
                  onChange={(e) => setActiveBay(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  {BAY_OPTIONS.map((bay) => (
                    <option key={bay} value={bay}>{bay}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Current Active Job Card
                </label>
                <select
                  value={currentJobCardId}
                  onChange={(e) => setCurrentJobCardId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  <option value="">-- No Active Job Assigned --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} • {j.vehicleModel} ({j.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Role & Contact Details */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} color="var(--accent-amber)" />
              <span>Staff Profile &amp; Contact</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Job Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Direct Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Performance & Hours Billed */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-emerald)" />
              <span>Monthly Hours &amp; Labor Efficiency</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Actual Clocked Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualHours}
                  onChange={(e) => setActualHours(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Billed Customer Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={billedHours}
                  onChange={(e) => setBilledHours(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Calculated Efficiency
                </label>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  color: efficiency >= 100 ? '#34d399' : '#fbbf24',
                  fontWeight: 800,
                  fontSize: '14px',
                }}>
                  {efficiency}% {efficiency >= 100 ? '★ Bonus Target' : 'Standard'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.95)',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            * Status will immediately broadcast to bay tablets &amp; mobile phones over Wi-Fi.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              <CheckCircle2 size={16} />
              <span>Save &amp; Sync Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
