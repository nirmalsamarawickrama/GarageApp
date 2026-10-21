import React, { useState } from 'react';
import { 
  Edit3, 
  Search,
  Play,
  Square,
  Car
} from 'lucide-react';
import { Employee, JobCard } from '../../types';
import { DesktopEmployeeEditModal } from './DesktopEmployeeEditModal';
import { syncEngine } from '../../state/syncEngine';

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

  // Aggregations
  const totalStaff = employees.length;
  const activeInBay = employees.filter((e) => e.status === 'Working on Job').length;
  const available = employees.filter((e) => e.status === 'Available').length;
  const offOrBreak = employees.filter((e) => e.status === 'On Break' || e.status === 'Off Duty').length;
  const avgEfficiency = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.efficiencyRating, 0) / employees.length)
    : 100;

  // Filtered
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

  const getStatusStyle = (st: Employee['status']) => {
    switch (st) {
      case 'Working on Job':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      case 'Available':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'On Break':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Off Duty':
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const handleQuickStatusChange = (empId: string, newStatus: Employee['status']) => {
    syncEngine.updateEmployee(empId, { status: newStatus });
  };

  const handleQuickBayChange = (empId: string, newBay: string) => {
    syncEngine.updateEmployee(empId, { activeBay: newBay });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Total Staff
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', marginTop: '8px' }}>
            {totalStaff} Technicians
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Active branch roster
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
            Active on Jobs
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '8px' }}>
            {activeInBay} Working
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Operating on lifts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)' }}>
            Available &amp; Ready
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '8px' }}>
            {available} Available
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Ready for dispatch
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)' }}>
            Break / Off Duty
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '8px' }}>
            {offOrBreak} Off Floor
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Rest or off shift
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa' }}>
            Avg Labor Efficiency
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#a78bfa', marginTop: '8px' }}>
            {avgEfficiency}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Billed / clocked ratio
          </div>
        </div>
      </div>

      {/* Workshop Bay Station Live Allocation Map */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
              Workshop Bay Station Live Allocation Map
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time technician assignments across active workshop lifts and diagnostic stations
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, background: 'rgba(6, 182, 212, 0.12)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            Live Floor Monitoring
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {BAYS.map((bay) => {
            const assignedTech = employees.find((e) => e.activeBay && e.activeBay.startsWith(bay.name.split(' ')[0]));
            const activeJob = assignedTech?.currentJobCardId
              ? jobs.find((j) => j.id === assignedTech.currentJobCardId)
              : null;

            return (
              <div
                key={bay.id}
                style={{
                  background: assignedTech ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${assignedTech ? 'rgba(6, 182, 212, 0.3)' : 'var(--border-card)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '130px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>
                      {bay.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: assignedTech ? '#34d399' : 'var(--text-dim)',
                      background: assignedTech ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}>
                      {assignedTech ? 'OCCUPIED' : 'VACANT'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {bay.type}
                  </div>
                </div>

                {assignedTech ? (
                  <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={assignedTech.avatarUrl}
                        alt={assignedTech.name}
                        style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{assignedTech.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{assignedTech.role}</div>
                      </div>
                    </div>
                    {activeJob && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Car size={12} color="var(--accent-amber)" />
                        <span>{activeJob.vehicleModel} ({activeJob.jobNumber})</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Station ready for incoming vehicle intake
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-card)',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '8px 14px',
          width: '320px',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search employee, role, bay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'Available', 'Working on Job', 'On Break', 'Off Duty'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: statusFilter === st ? '1px solid var(--accent-cyan)' : '1px solid var(--border-card)',
                background: statusFilter === st ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: statusFilter === st ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Staff Roster Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: 'rgba(11, 17, 32, 0.8)',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-card)',
                textAlign: 'left',
              }}>
                <th style={{ padding: '14px 18px' }}>Staff Member</th>
                <th style={{ padding: '14px 16px' }}>Role / Specialization</th>
                <th style={{ padding: '14px 16px' }}>Status (Live Override)</th>
                <th style={{ padding: '14px 16px' }}>Station / Bay Allocation</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Billed / Clocked</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Efficiency</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const statusStyle = getStatusStyle(emp.status);
                const isWorking = emp.status === 'Working on Job';

                return (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Staff Member */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-card)',
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'white' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            {emp.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{emp.role}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                        {emp.completedJobsCount} jobs completed
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={emp.status}
                        onChange={(e) => handleQuickStatusChange(emp.id, e.target.value as Employee['status'])}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="Available">Available</option>
                        <option value="Working on Job">Working on Job</option>
                        <option value="On Break">On Break</option>
                        <option value="Off Duty">Off Duty</option>
                      </select>
                    </td>

                    {/* Bay Allocation Dropdown */}
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={emp.activeBay || 'Unassigned'}
                        onChange={(e) => handleQuickBayChange(emp.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          background: 'var(--bg-input)',
                          color: 'white',
                          border: '1px solid var(--border-card)',
                          cursor: 'pointer',
                          maxWidth: '180px',
                        }}
                      >
                        <option value="Unassigned">Unassigned / Floating</option>
                        {BAYS.map((b) => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Hours */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600 }}>
                      {emp.billedHoursThisMonth}h / {emp.actualHoursThisMonth}h
                    </td>

                    {/* Efficiency */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: emp.efficiencyRating >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: emp.efficiencyRating >= 100 ? '#34d399' : '#fbbf24',
                      }}>
                        {emp.efficiencyRating}%
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => onToggleClock(emp.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: `1px solid ${isWorking ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                            background: isWorking ? 'rgba(245, 158, 11, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                            color: isWorking ? '#fbbf24' : 'var(--accent-cyan)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isWorking ? <Square size={12} /> : <Play size={12} />}
                          <span>{isWorking ? 'End Job' : 'Clock Job'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedEmpForEdit(emp)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Edit Modal */}
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
