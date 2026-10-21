import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  Receipt,
  Plus, 
  Search,
  Eye
} from 'lucide-react';
import { JobCard, JobStatus } from '../../types';
import { DesktopBillEditModal } from './DesktopBillEditModal';

interface DesktopKanbanViewProps {
  jobs: JobCard[];
  onAdvanceStatus: (jobId: string, nextStatus: JobStatus) => void;
  onOpenNewJob: () => void;
  onOpenInspection: (job: JobCard) => void;
}

const COLUMNS: { id: JobStatus; title: string; color: string; bg: string; border: string }[] = [
  {
    id: 'INTAKE',
    title: '1. Vehicle Intake',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.08)',
    border: 'rgba(148, 163, 184, 0.25)',
  },
  {
    id: 'DIAGNOSIS',
    title: '2. Diagnostic Scans',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'IN_REPAIR',
    title: '3. Bay Active Repair',
    color: '#22d3ee',
    bg: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.25)',
  },
  {
    id: 'QUALITY_CHECK',
    title: '4. Quality & Road Test',
    color: '#a78bfa',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'READY_DELIVERY',
    title: '5. Ready for Customer',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
];

const NEXT_STATUS_MAP: Record<JobStatus, JobStatus | null> = {
  INTAKE: 'DIAGNOSIS',
  DIAGNOSIS: 'IN_REPAIR',
  IN_REPAIR: 'QUALITY_CHECK',
  QUALITY_CHECK: 'READY_DELIVERY',
  READY_DELIVERY: null,
};

const PREV_STATUS_MAP: Record<JobStatus, JobStatus | null> = {
  INTAKE: null,
  DIAGNOSIS: 'INTAKE',
  IN_REPAIR: 'DIAGNOSIS',
  QUALITY_CHECK: 'IN_REPAIR',
  READY_DELIVERY: 'QUALITY_CHECK',
};

export const DesktopKanbanView: React.FC<DesktopKanbanViewProps> = ({
  jobs,
  onAdvanceStatus,
  onOpenNewJob,
  onOpenInspection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobForBill, setSelectedJobForBill] = useState<JobCard | null>(null);

  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      j.jobNumber.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.vehiclePlate.toLowerCase().includes(q) ||
      j.vehicleModel.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>
            Workshop Repair Pipeline (Kanban Board)
          </h2>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: 'rgba(6, 182, 212, 0.12)',
            color: 'var(--accent-cyan)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}>
            {jobs.length} Active Vehicles
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            borderRadius: '10px',
            padding: '6px 12px',
            width: '260px',
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search vehicle, plate, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>

          <button onClick={onOpenNewJob} className="btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>
            <Plus size={15} />
            <span>New Intake Job</span>
          </button>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '14px',
        alignItems: 'flex-start',
      }}>
        {COLUMNS.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col.id);

          return (
            <div
              key={col.id}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '650px',
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-card)',
                background: col.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: col.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {col.title}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: col.color,
                }}>
                  {colJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {colJobs.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', fontStyle: 'italic' }}>
                    No jobs currently in this stage
                  </div>
                ) : (
                  colJobs.map((job) => {
                    const nextStatus = NEXT_STATUS_MAP[job.status];
                    const prevStatus = PREV_STATUS_MAP[job.status];

                    return (
                      <div
                        key={job.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-card)',
                          borderRadius: '14px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}
                      >
                        {/* Top: Job # & License Plate */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                            {job.jobNumber}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                          }}>
                            {job.vehiclePlate}
                          </span>
                        </div>

                        {/* Vehicle & Customer */}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>
                            {job.vehicleModel}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {job.customerName}
                          </div>
                        </div>

                        {/* Complaint summary */}
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-dim)',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {job.primaryComplaint}
                        </div>

                        {/* Bay & Tech */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {job.assignedTechName || 'Shop Master'}
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--accent-amber)' }}>
                            ${job.totalCost ? job.totalCost.toFixed(2) : '0.00'}
                          </div>
                        </div>

                        {/* Fast Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => onOpenInspection(job)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-card)',
                                borderRadius: '6px',
                                padding: '4px 6px',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                              }}
                              title="Inspect Vehicle 360 Wireframe"
                            >
                              <Eye size={12} />
                              <span>DVI</span>
                            </button>

                            <button
                              onClick={() => setSelectedJobForBill(job)}
                              style={{
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '6px',
                                padding: '4px 6px',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                              }}
                              title="Edit Bill & Invoices"
                            >
                              <Receipt size={12} />
                              <span>Bill</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {prevStatus && (
                              <button
                                onClick={() => onAdvanceStatus(job.id, prevStatus)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                }}
                                title="Move back one stage"
                              >
                                <ArrowLeft size={13} />
                              </button>
                            )}

                            {nextStatus && (
                              <button
                                onClick={() => onAdvanceStatus(job.id, nextStatus)}
                                style={{
                                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Advance to next stage"
                              >
                                <span>Advance</span>
                                <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Editor Modal */}
      {selectedJobForBill && (
        <DesktopBillEditModal
          isOpen={!!selectedJobForBill}
          onClose={() => setSelectedJobForBill(null)}
          job={selectedJobForBill}
        />
      )}
    </div>
  );
};
