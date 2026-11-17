import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronRight,
  Car,
  User as UserIcon,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { JobCard, JobStatus } from '../../types';

interface WorkProgressViewProps {
  jobs: JobCard[];
  onAdvanceStatus: (jobId: string, nextStatus: JobStatus) => void;
  onOpenNewJob: () => void;
  onOpenInspection: (job: JobCard) => void;
  canCreateIntake?: boolean;
  canAdvanceStatus?: boolean;
  canPerformDvi?: boolean;
}

const STAGE_ORDER: JobStatus[] = [
  'INTAKE',
  'DIAGNOSIS',
  'IN_REPAIR',
  'QUALITY_CHECK',
  'READY_DELIVERY',
];

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; next?: JobStatus; badgeClass: string }
> = {
  INTAKE: { label: 'Intake Inspection', next: 'DIAGNOSIS', badgeClass: 'sg-badge-intake' },
  DIAGNOSIS: { label: 'Diagnostic Review', next: 'IN_REPAIR', badgeClass: 'sg-badge-diagnosis' },
  IN_REPAIR: { label: 'In Repair', next: 'QUALITY_CHECK', badgeClass: 'sg-badge-repair' },
  QUALITY_CHECK: { label: 'Quality Control', next: 'READY_DELIVERY', badgeClass: 'sg-badge-qc' },
  READY_DELIVERY: { label: 'Ready for Handover', badgeClass: 'sg-badge-ready' },
};

export const WorkProgressView: React.FC<WorkProgressViewProps> = ({
  jobs,
  onAdvanceStatus,
  onOpenNewJob,
  onOpenInspection,
  canCreateIntake = true,
  canAdvanceStatus = true,
  canPerformDvi = true,
}) => {
  const [activePipelineSector, setActivePipelineSector] = useState<'ACTIVE' | 'READY' | 'ALL'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  const activeJobs = jobs.filter((j) => j.status !== 'READY_DELIVERY');
  const readyJobs = jobs.filter((j) => j.status === 'READY_DELIVERY');

  const filteredJobs = jobs.filter((j) => {
    const matchesSector =
      activePipelineSector === 'ALL'
        ? true
        : activePipelineSector === 'READY'
        ? j.status === 'READY_DELIVERY'
        : j.status !== 'READY_DELIVERY';

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      j.customerName.toLowerCase().includes(q) ||
      j.vehicleModel.toLowerCase().includes(q) ||
      j.vehiclePlate.toLowerCase().includes(q) ||
      j.vin.toLowerCase().includes(q) ||
      j.jobNumber.toLowerCase().includes(q);

    return matchesSector && matchesSearch;
  });

  const segments = [
    { id: 'ACTIVE' as const, label: 'In Service', count: activeJobs.length },
    { id: 'READY' as const, label: 'Ready', count: readyJobs.length },
    { id: 'ALL' as const, label: 'All Jobs', count: jobs.length },
  ];
  const segIndex = segments.findIndex((s) => s.id === activePipelineSector);

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTOR 1: Workshop Bay Activity */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Wrench size={14} color="var(--accent-primary)" /> Sector 1 &bull; Workshop Bay Activity
          </span>
          <span className="sg-sector-subtitle tabular">{jobs.length} total vehicles</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Active in Bays</div>
              <div
                className="tabular"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-primary)' }}
              >
                {activeJobs.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In service &amp; diagnostics</div>
            </div>

            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Ready for Pickup</div>
              <div
                className="tabular"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-secondary)' }}
              >
                {readyJobs.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>QC passed &amp; invoiced</div>
            </div>
          </div>

          {canCreateIntake && (
            <button
              type="button"
              onClick={onOpenNewJob}
              className="sg-btn sg-btn-primary sg-btn-lg"
              style={{ width: '100%' }}
            >
              <Plus size={18} /> Intake New Vehicle
            </button>
          )}
        </div>
      </section>

      {/* SECTOR 2: Pipeline Stages */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <CheckCircle2 size={14} color="var(--accent-secondary)" /> Sector 2 &bull; Pipeline Stages
          </span>
          <span className="sg-sector-subtitle">Filter by workflow</span>
        </div>

        <div className="sg-segmented" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '12px' }}>
          <div
            className="sg-segmented-thumb"
            style={{
              width: 'calc((100% - 6px) / 3)',
              transform: `translateX(${segIndex * 100}%)`,
            }}
          />
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              className="sg-segmented-btn"
              data-active={activePipelineSector === seg.id}
              onClick={() => setActivePipelineSector(seg.id)}
            >
              <span>{seg.label}</span>
              <span
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '1px 6px',
                  background: activePipelineSector === seg.id ? 'var(--accent-volt)' : 'var(--bg-surface)',
                  color: activePipelineSector === seg.id ? 'var(--ink-on-accent)' : 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '2px',
                }}
              >
                {seg.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '13px' }}
          />
          <input
            type="text"
            className="sg-input"
            placeholder="Search by license plate, model, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </section>

      {/* SECTOR 3: Active Work Cards */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Car size={14} /> Sector 3 &bull; Active Work Cards ({filteredJobs.length})
          </span>
          <span className="sg-sector-subtitle">Live workshop status</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredJobs.length === 0 ? (
            <div className="sg-panel-muted" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No vehicles in this sector.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Tap &ldquo;Intake New Vehicle&rdquo; to register a repair order.</div>
            </div>
          ) : (
            filteredJobs.map((job, idx) => {
              const statusMeta = STATUS_CONFIG[job.status];
              const nextStatus = statusMeta.next;
              const hasDamageReport = job.damagePoints && job.damagePoints.length > 0;

              return (
                <article
                  key={job.id}
                  className="sg-card-interactive stagger-item"
                  style={{
                    '--stagger-index': idx,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  } as React.CSSProperties}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="sg-plate tabular">{job.vehiclePlate}</span>
                        <span
                          className="tabular"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent-primary)',
                          }}
                        >
                          {job.jobNumber}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, marginTop: '6px' }}>{job.vehicleModel}</h3>
                    </div>

                    <span className={`sg-badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
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

                  <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="sg-grid-cell" style={{ padding: '10px 12px', fontSize: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={11} /> CUSTOMER
                      </div>
                      <div style={{ fontWeight: 700, marginTop: '2px' }}>{job.customerName}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {job.customerPhone}
                      </div>
                    </div>

                    <div className="sg-grid-cell" style={{ padding: '10px 12px', fontSize: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> STATION &amp; BAY
                      </div>
                      <div style={{ fontWeight: 700, marginTop: '2px' }}>{job.assignedBay || 'Unassigned Bay'}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {job.assignedTechName || 'Awaiting Tech'}
                      </div>
                    </div>
                  </div>

                  <div
                    className="sg-panel-muted"
                    style={{
                      padding: '10px 12px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', marginRight: '6px' }}>
                      Concern:
                    </strong>
                    {job.primaryComplaint}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    {canPerformDvi ? (
                      <button
                        type="button"
                        onClick={() => onOpenInspection(job)}
                        className={`sg-btn sg-btn-sm ${hasDamageReport ? 'sg-btn-volt' : 'sg-btn-secondary'}`}
                      >
                        <AlertCircle size={14} />
                        {hasDamageReport ? `DVI Report (${job.damagePoints!.length} logged)` : 'Perform DVI'}
                      </button>
                    ) : (
                      <span className="sg-badge sg-badge-intake">
                        DVI: {job.damagePoints?.length || 0} logged
                      </span>
                    )}

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '6px' }}>Estimated Total:</span>
                      <strong
                        className="tabular"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--accent-secondary)' }}
                      >
                        ${job.totalCost.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {nextStatus && canAdvanceStatus && (
                    <button
                      type="button"
                      onClick={() => onAdvanceStatus(job.id, nextStatus)}
                      className="sg-btn sg-btn-secondary"
                      style={{ width: '100%' }}
                    >
                      Advance to {STATUS_CONFIG[nextStatus].label} <ChevronRight size={16} />
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
