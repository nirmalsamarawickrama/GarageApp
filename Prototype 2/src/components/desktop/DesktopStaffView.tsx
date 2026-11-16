import React, { useState } from 'react';
import { Edit3, Search, Play, Square, Car } from 'lucide-react';
import { Employee, JobCard } from '../../types';
import { DesktopEmployeeEditModal } from './DesktopEmployeeEditModal';
import { syncEngine } from '../../state/syncEngine';
import { AvatarBadge } from '../shared/AvatarBadge';

interface DesktopStaffViewProps {
  employees: Employee[];
  jobs: JobCard[];
  onToggleClock: (empId: string) => void;
}

const BAYS = [
  { id: 'bay-1', name: 'Bay 1 (2-Post Lift)', type: 'Hydraulic Lift' },
  { id: 'bay-2', name: 'Bay 2 (Quick Lube Pit)', type: 'Subterranean Pit' },
  { id: 'bay-3', name: 'Bay 3 (ECU Diagnostic Lab)', type: 'Computerized Lab' },
  { id: 'bay-4', name: 'Bay 4 (Alignment Rack)', type: 'Laser Optical Rack' },
  { id: 'bay-5', name: 'Bay 5 (Heavy Transmission)', type: '4-Post Lift' },
  { id: 'bay-6', name: 'Bay 6 (Inspection & DVI)', type: 'Intake Bay' },
];

export const DesktopStaffView: React.FC<DesktopStaffViewProps> = ({
  employees,
  jobs,
  onToggleClock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Employee['status']>('ALL');
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState<Employee | null>(null);

  const totalStaff = employees.length;
  const activeInBay = employees.filter((e) => e.status === 'Working on Job').length;
  const available = employees.filter((e) => e.status === 'Available').length;
  const offOrBreak = employees.filter((e) => e.status === 'On Break' || e.status === 'Off Duty').length;
  const avgEfficiency =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.efficiencyRating, 0) / employees.length)
      : 100;

  const filteredEmployees = employees.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(query) ||
      e.role.toLowerCase().includes(query) ||
      (e.activeBay && e.activeBay.toLowerCase().includes(query)) ||
      e.phone.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleQuickStatusChange = (empId: string, newStatus: Employee['status']) => {
    syncEngine.updateEmployee(empId, { status: newStatus });
  };

  const handleQuickBayChange = (empId: string, newBay: string) => {
    syncEngine.updateEmployee(empId, {
      activeBay: newBay === 'Unassigned' ? undefined : newBay,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Metrics Row */}
      <div className="sg-kpi-5">
        <div className="sg-grid-cell">
          <div className="sg-label">Total Staff</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {totalStaff} Techs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active branch roster</div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Active on Jobs</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {activeInBay} Working
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operating on lifts</div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Available &amp; Ready</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '4px' }}>
            {available} Ready
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ready for dispatch</div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Break / Off Duty</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {offOrBreak} Off Floor
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rest or off shift</div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Avg Efficiency</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-violet)', marginTop: '4px' }}>
            {avgEfficiency}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Billed / clocked ratio</div>
        </div>
      </div>

      {/* Live Bay Station Allocation Map */}
      <div className="sg-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
              Workshop Bay Station Live Allocation Map
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time technician assignments across active workshop lifts and diagnostic stations
            </div>
          </div>
          <span className="sg-badge sg-badge-volt">LIVE FLOOR MONITORING</span>
        </div>

        <div className="sg-bay-map">
          {BAYS.map((bay, bayIdx) => {
            const assignedTech = employees.find(
              (e) => e.activeBay && e.activeBay.startsWith(bay.name.split(' ')[0] + ' ' + bay.name.split(' ')[1])
            );
            const activeJob = assignedTech?.currentJobCardId
              ? jobs.find((j) => j.id === assignedTech.currentJobCardId)
              : null;

            return (
              <div
                key={bay.id}
                className={assignedTech ? 'sg-panel' : 'sg-panel-muted'}
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '132px',
                  borderColor: assignedTech ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  borderLeftWidth: assignedTech ? '4px' : '1px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="tabular"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 5px',
                          background: assignedTech ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                          color: assignedTech ? 'var(--ink-on-accent)' : 'var(--text-muted)',
                          borderRadius: '2px',
                        }}
                      >
                        BAY 0{bayIdx + 1}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{bay.name.replace(/^Bay \d+\s*/, '')}</span>
                    </div>
                    <span className={`sg-badge ${assignedTech ? 'sg-badge-ready' : 'sg-badge-intake'}`}>
                      <span className={`sg-led ${assignedTech ? 'sg-led-live' : 'sg-led-warn'}`} />
                      {assignedTech ? 'OCCUPIED' : 'VACANT'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {bay.type}
                  </div>
                </div>

                {assignedTech ? (
                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AvatarBadge src={assignedTech.avatarUrl} name={assignedTech.name} size={28} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{assignedTech.name}</div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {assignedTech.role}
                        </div>
                      </div>
                    </div>
                    {activeJob && (
                      <div style={{ marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Car size={12} color="var(--accent-amber)" />
                        <span>
                          {activeJob.vehicleModel} ({activeJob.jobNumber})
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Station ready for incoming vehicle intake
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="sg-panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
          <input
            type="text"
            className="sg-input"
            placeholder="Search employee, role, bay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['ALL', 'Available', 'Working on Job', 'On Break', 'Off Duty'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`sg-btn sg-btn-sm ${statusFilter === st ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="sg-table-wrap">
        <table className="sg-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role / Specialization</th>
              <th>Status (Live Override)</th>
              <th>Station / Bay Allocation</th>
              <th style={{ textAlign: 'center' }}>Billed / Clocked</th>
              <th style={{ textAlign: 'center' }}>Efficiency</th>
              <th style={{ textAlign: 'center' }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => {
              const isWorking = emp.status === 'Working on Job';

              return (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AvatarBadge src={emp.avatarUrl} name={emp.name} size={36} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {emp.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{emp.role}</div>
                    <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-primary)' }}>
                      {emp.completedJobsCount} jobs completed
                    </div>
                  </td>

                  <td>
                    <select
                      className="sg-select"
                      value={emp.status}
                      onChange={(e) =>
                        handleQuickStatusChange(emp.id, e.target.value as Employee['status'])
                      }
                      style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}
                      aria-label={`Status for ${emp.name}`}
                    >
                      <option value="Available">Available</option>
                      <option value="Working on Job">Working on Job</option>
                      <option value="On Break">On Break</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </td>

                  <td>
                    <select
                      className="sg-select"
                      value={emp.activeBay || 'Unassigned'}
                      onChange={(e) => handleQuickBayChange(emp.id, e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px', maxWidth: '200px' }}
                      aria-label={`Bay assignment for ${emp.name}`}
                    >
                      <option value="Unassigned">Unassigned / Floating</option>
                      {BAYS.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="tabular" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {emp.billedHoursThisMonth}h / {emp.actualHoursThisMonth}h
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className={`sg-badge tabular ${emp.efficiencyRating >= 100 ? 'sg-badge-ready' : 'sg-badge-diagnosis'}`}>
                      {emp.efficiencyRating}%
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onToggleClock(emp.id)}
                        className={`sg-btn sg-btn-sm ${isWorking ? 'sg-btn-danger' : 'sg-btn-primary'}`}
                      >
                        {isWorking ? <Square size={12} /> : <Play size={12} />}
                        <span>{isWorking ? 'End Job' : 'Clock Job'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedEmpForEdit(emp)}
                        className="sg-btn sg-btn-secondary sg-btn-sm"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmpForEdit && (
        <DesktopEmployeeEditModal
          isOpen={!!selectedEmpForEdit}
          onClose={() => setSelectedEmpForEdit(null)}
          employee={selectedEmpForEdit}
          jobs={jobs}
        />
      )}
    </div>
  );
};
