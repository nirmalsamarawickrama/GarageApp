import React from 'react';
import { UserCheck, Clock, Play, Square, Award, Users, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeesViewProps {
  employees: Employee[];
  onToggleClock: (empId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onToggleClock,
}) => {
  const activeWorkingCount = employees.filter((e) => e.status === 'Working on Job').length;

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTOR 1: Bay Occupation & Staff Availability */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Users size={14} /> Sector 1 &bull; Workshop Bay Capacity
          </span>
          <span className="sector-subtitle">{employees.length} technicians assigned</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 10px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {employees.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total Staff</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 10px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {activeWorkingCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Active Bays</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 10px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                112%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Shop Efficiency</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTOR 2: Technician Roster & Time Tracker */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Clock size={14} /> Sector 2 &bull; Technician Roster & Time Logs
          </span>
          <span className="sector-subtitle">Tap to clock in/out</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {employees.map((emp) => {
            const isWorking = emp.status === 'Working on Job';

            return (
              <div
                key={emp.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderColor: isWorking ? 'rgba(6, 182, 212, 0.35)' : 'var(--border-card)',
                }}
              >
                {/* Staff Info Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.08)',
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{emp.name}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{emp.role}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '1px' }}>{emp.phone}</div>
                    </div>
                  </div>

                  {/* Status chip */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: isWorking ? 'rgba(6,182,212,0.15)' : 'rgba(16,185,129,0.15)',
                    color: isWorking ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                    border: `1px solid ${isWorking ? 'rgba(6,182,212,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    {isWorking ? <Clock size={12} /> : <UserCheck size={12} />}
                    {emp.status}
                  </span>
                </div>

                {/* Assigned Bay Station */}
                {emp.activeBay && (
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Current Station: <strong style={{ color: 'white' }}>{emp.activeBay}</strong>
                    </span>
                    {emp.currentJobCardId && (
                      <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                        Job #{emp.currentJobCardId}
                      </span>
                    )}
                  </div>
                )}

                {/* Efficiency & Metrics Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>Labor Efficiency</div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: emp.efficiencyRating >= 100 ? 'var(--accent-emerald)' : '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                    }}>
                      <Award size={13} /> {emp.efficiencyRating}%
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>Hours Logged</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {emp.billedHoursThisMonth}h / {emp.actualHoursThisMonth}h
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>Jobs Done</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <CheckCircle2 size={13} /> {emp.completedJobsCount}
                    </div>
                  </div>
                </div>

                {/* Clock In / Out Toggle Button */}
                <button
                  onClick={() => onToggleClock(emp.id)}
                  className={isWorking ? 'btn-danger' : 'btn-primary'}
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '13px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
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
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
