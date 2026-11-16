import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Receipt, Plus, Search, Eye } from 'lucide-react';
import { JobCard, JobStatus } from '../../types';
import { DesktopBillEditModal } from './DesktopBillEditModal';

interface DesktopKanbanViewProps {
  jobs: JobCard[];
  onAdvanceStatus: (jobId: string, nextStatus: JobStatus) => void;
  onOpenNewJob: () => void;
  onOpenInspection: (job: JobCard) => void;
}

const STAGE_ORDER: JobStatus[] = [
  'INTAKE',
  'DIAGNOSIS',
  'IN_REPAIR',
  'QUALITY_CHECK',
  'READY_DELIVERY',
];

const COLUMNS: {
  id: JobStatus;
  title: string;
  headerBg: string;
  headerColor: string;
}[] = [
  { id: 'INTAKE', title: '1. Vehicle Intake', headerBg: 'var(--bg-elevated)', headerColor: 'var(--text-primary)' },
  { id: 'DIAGNOSIS', title: '2. Diagnostic Scans', headerBg: 'var(--accent-amber-tint)', headerColor: 'var(--accent-amber)' },
  { id: 'IN_REPAIR', title: '3. Bay Active Repair', headerBg: 'var(--accent-primary-tint)', headerColor: 'var(--accent-primary)' },
  { id: 'QUALITY_CHECK', title: '4. Quality & Road Test', headerBg: 'var(--accent-violet-tint)', headerColor: 'var(--accent-violet)' },
  { id: 'READY_DELIVERY', title: '5. Ready for Customer', headerBg: 'var(--accent-secondary-tint)', headerColor: 'var(--accent-secondary)' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Controls */}
      <div
        className="sg-panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            Workshop Repair Pipeline (Kanban Board)
          </h2>
          <span className="sg-badge sg-badge-volt tabular">{jobs.length} Active Vehicles</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
            <input
              type="text"
              className="sg-input"
              placeholder="Search vehicle, plate, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <button type="button" onClick={onOpenNewJob} className="sg-btn sg-btn-primary">
            <Plus size={15} /> New Intake Job
          </button>
        </div>
      </div>

      {/* 5-Column Structural Kanban Board */}
      <div className="sg-kanban-board">
        {COLUMNS.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col.id);

          return (
            <div
              key={col.id}
              className="sg-panel"
              style={{
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '2px solid var(--border-strong)',
                  background: col.headerBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: col.headerColor,
                    textTransform: 'uppercase',
                  }}
                >
                  {col.title}
                </span>
                <span
                  className="tabular"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {colJobs.length}
                </span>
              </div>

              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {colJobs.length === 0 ? (
                  <div style={{ padding: '28px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    No jobs currently in this stage
                  </div>
                ) : (
                  colJobs.map((job, idx) => {
                    const nextStatus = NEXT_STATUS_MAP[job.status];
                    const prevStatus = PREV_STATUS_MAP[job.status];

                    return (
                      <div
                        key={job.id}
                        className="sg-card-interactive stagger-item"
                        style={{
                          '--stagger-index': idx,
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        } as React.CSSProperties}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span
                            className="tabular"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}
                          >
                            {job.jobNumber}
                          </span>
                          <span className="sg-plate tabular">{job.vehiclePlate}</span>
                        </div>

                        {/* 5-Stage Service Bay Stepper */}
                        <div className="sg-stage-track" aria-label={`Stage ${STAGE_ORDER.indexOf(job.status) + 1} of 5`}>
                          {STAGE_ORDER.map((st, sIdx) => {
                            const currentIdx = STAGE_ORDER.indexOf(job.status);
                            return (
                              <div
                                key={st}
                                className="sg-stage-pip"
                                data-done={sIdx < currentIdx}
                                data-current={sIdx === currentIdx}
                              />
                            );
                          })}
                        </div>

                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>{job.vehicleModel}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.customerName}</div>
                        </div>

                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {job.primaryComplaint}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '8px',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>{job.assignedTechName || 'Shop Master'}</span>
                          <span
                            className="tabular"
                            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-secondary)' }}
                          >
                            ${job.totalCost ? job.totalCost.toFixed(2) : '0.00'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '2px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => onOpenInspection(job)}
                              className="sg-btn sg-btn-secondary sg-btn-sm"
                              style={{ minHeight: '28px', padding: '3px 7px', fontSize: '10px' }}
                              title="Inspect Vehicle 360° CAD Wireframe"
                            >
                              <Eye size={11} /> DVI
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedJobForBill(job)}
                              className="sg-btn sg-btn-volt sg-btn-sm"
                              style={{ minHeight: '28px', padding: '3px 7px', fontSize: '10px' }}
                              title="Edit Bill & Invoices"
                            >
                              <Receipt size={11} /> Bill
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {prevStatus && (
                              <button
                                type="button"
                                onClick={() => onAdvanceStatus(job.id, prevStatus)}
                                className="sg-btn sg-btn-secondary sg-btn-sm"
                                style={{ minHeight: '28px', width: '28px', padding: 0 }}
                                title="Move back one stage"
                                aria-label="Move back one stage"
                              >
                                <ArrowLeft size={12} />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                type="button"
                                onClick={() => onAdvanceStatus(job.id, nextStatus)}
                                className="sg-btn sg-btn-primary sg-btn-sm"
                                style={{ minHeight: '28px', padding: '3px 8px', fontSize: '10px' }}
                                title="Advance to next stage"
                              >
                                Advance <ArrowRight size={11} />
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
