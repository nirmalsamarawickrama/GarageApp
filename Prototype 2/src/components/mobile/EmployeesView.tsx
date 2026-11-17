import React from 'react';
import { UserCheck, Clock, Play, Square, Award, Users, CheckCircle2 } from 'lucide-react';
import { Employee, User } from '../../types';
import { AvatarBadge } from '../shared/AvatarBadge';

interface EmployeesViewProps {
  employees: Employee[];
  onToggleClock: (empId: string) => void;
  currentUser?: User | null;
  canManageRoster?: boolean;
  canClockSelf?: boolean;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onToggleClock,
  currentUser = null,
  canManageRoster = true,
  canClockSelf = true,
}) => {
  const activeWorkingCount = employees.filter((e) => e.status === 'Working on Job').length;
  const avgEfficiency =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.efficiencyRating, 0) / employees.length)
      : 100;

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTOR 1: Workshop Bay Capacity */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Users size={14} color="var(--accent-primary)" /> Sector 1 &bull; Workshop Bay Capacity
          </span>
          <span className="sg-sector-subtitle tabular">{employees.length} technicians assigned</span>
        </div>

        <div className="sg-grid-matrix" style={{ gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
          <div className="sg-grid-cell" style={{ padding: '14px 8px' }}>
            <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {employees.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total Staff</div>
          </div>

          <div className="sg-grid-cell" style={{ padding: '14px 8px' }}>
            <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
              {activeWorkingCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Active Bays</div>
          </div>

          <div className="sg-grid-cell" style={{ padding: '14px 8px' }}>
            <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {avgEfficiency}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Shop Efficiency</div>
          </div>
        </div>
      </section>

      {/* SECTOR 2: Technician Roster & Time Logs */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Clock size={14} /> Sector 2 &bull; Technician Roster &amp; Time Logs
          </span>
          <span className="sg-sector-subtitle">Tap to clock in/out</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {employees.map((emp, idx) => {
            const isWorking = emp.status === 'Working on Job';
            const isSelf =
              !!currentUser &&
              (emp.userId === currentUser.id ||
                emp.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase());
            const canClockThisEmp = canManageRoster || (canClockSelf && isSelf);

            return (
              <article
                key={emp.id}
                className="sg-card-interactive stagger-item"
                style={{
                  '--stagger-index': idx,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderColor: isWorking ? 'var(--accent-primary)' : 'var(--border-strong)',
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AvatarBadge src={emp.avatarUrl} name={emp.name} size={44} />
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{emp.name}</h4>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>{emp.role}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {emp.phone}
                      </div>
                    </div>
                  </div>

                  <span className={`sg-badge ${isWorking ? 'sg-badge-repair' : 'sg-badge-ready'}`}>
                    {isWorking ? <Clock size={11} /> : <UserCheck size={11} />}
                    {emp.status}
                  </span>
                </div>

                {emp.activeBay && (
                  <div
                    className="sg-panel-muted"
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Station: <strong style={{ color: 'var(--text-primary)' }}>{emp.activeBay}</strong>
                    </span>
                    {emp.currentJobCardId && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        Job #{emp.currentJobCardId}
                      </span>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Labor Efficiency</div>
                    <div
                      className="tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: emp.efficiencyRating >= 100 ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <Award size={13} /> {emp.efficiencyRating}%
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Hours Logged</div>
                    <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                      {emp.billedHoursThisMonth}h / {emp.actualHoursThisMonth}h
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Jobs Done</div>
                    <div
                      className="tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <CheckCircle2 size={13} /> {emp.completedJobsCount}
                    </div>
                  </div>
                </div>

                {canClockThisEmp && (
                  <button
                    type="button"
                    onClick={() => onToggleClock(emp.id)}
                    className={`sg-btn ${isWorking ? 'sg-btn-danger' : 'sg-btn-primary'}`}
                    style={{ width: '100%' }}
                  >
                    {isWorking ? (
                      <>
                        <Square size={14} /> Clock-Out from Active Job
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Clock-In to Workshop Bay
                      </>
                    )}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
