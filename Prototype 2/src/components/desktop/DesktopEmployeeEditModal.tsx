import React, { useState } from 'react';
import { X, Clock, Wrench, CheckCircle2, Briefcase } from 'lucide-react';
import { Employee, JobCard } from '../../types';
import { syncEngine } from '../../state/syncEngine';
import { WORKSHOP_BAYS } from '../../data/mockData';
import { AvatarBadge } from '../shared/AvatarBadge';

interface DesktopEmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  jobs?: JobCard[];
  onSaved?: () => void;
}

const BAY_OPTIONS = [...WORKSHOP_BAYS.map((b) => b.name), 'Unassigned / Roaming'];

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

const DesktopEmployeeEditModalContent: React.FC<
  DesktopEmployeeEditModalProps & { employee: Employee }
> = ({ onClose, employee, jobs = [], onSaved }) => {
  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState<Employee['role']>(employee.role);
  const [phone, setPhone] = useState(employee.phone);
  const [status, setStatus] = useState<Employee['status']>(employee.status);
  const [activeBay, setActiveBay] = useState(employee.activeBay || 'Unassigned / Roaming');
  const [currentJobCardId, setCurrentJobCardId] = useState(employee.currentJobCardId || '');
  const [actualHours, setActualHours] = useState(employee.actualHoursThisMonth);
  const [billedHours, setBilledHours] = useState(employee.billedHoursThisMonth);

  const branchJobs = jobs.filter((j) => j.branchId === employee.branchId);
  const efficiency =
    actualHours > 0 ? Math.round((billedHours / actualHours) * 100) : billedHours > 0 ? 100 : 0;

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

  const getBadgeClass = (st: Employee['status']) => {
    switch (st) {
      case 'Working on Job':
        return 'sg-badge sg-badge-repair';
      case 'Available':
        return 'sg-badge sg-badge-ready';
      case 'On Break':
        return 'sg-badge sg-badge-diagnosis';
      case 'Off Duty':
      default:
        return 'sg-badge sg-badge-intake';
    }
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit Technician and Bay">
      <div className="sg-modal" style={{ maxWidth: '660px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AvatarBadge src={employee.avatarUrl} name={name} size={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{name}</h2>
                <span className={getBadgeClass(status)}>{status}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {role} &bull; ID: {employee.id}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close staff modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="sg-label">Operational Status (Bay / Workshop Floor)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['Available', 'Working on Job', 'On Break', 'Off Duty'] as Employee['status'][]).map(
                (st) => {
                  const isSelected = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`sg-btn sg-btn-sm ${isSelected ? 'sg-btn-volt' : 'sg-btn-secondary'}`}
                    >
                      {st}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="sg-panel-muted" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '12px' }}>
              <Wrench size={15} color="var(--accent-primary)" />
              <span>Bay Assignment &amp; Work Queue</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="sg-label">Assigned Bay / Lift Station</label>
                <select
                  className="sg-select"
                  value={activeBay}
                  onChange={(e) => setActiveBay(e.target.value)}
                >
                  {BAY_OPTIONS.map((bay) => (
                    <option key={bay} value={bay}>
                      {bay}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="sg-label">Current Active Job Card</label>
                <select
                  className="sg-select"
                  value={currentJobCardId}
                  onChange={(e) => setCurrentJobCardId(e.target.value)}
                >
                  <option value="">-- No Active Job Assigned --</option>
                  {branchJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} &bull; {j.vehicleModel} ({j.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="sg-panel-muted" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '12px' }}>
              <Briefcase size={15} color="var(--accent-amber)" />
              <span>Staff Profile &amp; Contact</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label className="sg-label">Full Name</label>
                <input
                  type="text"
                  className="sg-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="sg-label">Job Role</label>
                <select
                  className="sg-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Employee['role'])}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="sg-label">Direct Phone</label>
                <input
                  type="text"
                  className="sg-input sg-input-mono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="sg-panel-muted" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '12px' }}>
              <Clock size={15} color="var(--accent-secondary)" />
              <span>Monthly Hours &amp; Labor Efficiency</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label className="sg-label">Actual Clocked Hours</label>
                <input
                  type="number"
                  min="0"
                  className="sg-input sg-input-mono"
                  value={actualHours}
                  onChange={(e) => setActualHours(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div>
                <label className="sg-label">Billed Customer Hours</label>
                <input
                  type="number"
                  min="0"
                  className="sg-input sg-input-mono"
                  value={billedHours}
                  onChange={(e) => setBilledHours(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div>
                <label className="sg-label">Calculated Efficiency</label>
                <div
                  className="sg-panel tabular"
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: efficiency >= 100 ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                  }}
                >
                  {efficiency}% {efficiency >= 100 ? '★ Target' : 'Standard'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sg-modal-footer">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            * Broadcasts live to bay tablets over Wi-Fi.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="sg-btn sg-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="sg-btn sg-btn-primary">
              <CheckCircle2 size={16} /> Save &amp; Sync Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
