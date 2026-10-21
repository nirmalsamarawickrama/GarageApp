import React, { useState } from 'react';
import { Plus, Search, ChevronRight, Car, User, Clock, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';
import { JobCard, JobStatus } from '../../types';

interface WorkProgressViewProps {
  jobs: JobCard[];
  onAdvanceStatus: (jobId: string, nextStatus: JobStatus) => void;
  onOpenNewJob: () => void;
  onOpenInspection: (job: JobCard) => void;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; next?: JobStatus; colorClass: string }> = {
  INTAKE: { label: 'Intake Inspection', next: 'DIAGNOSIS', colorClass: 'badge-intake' },
  DIAGNOSIS: { label: 'Diagnostic Review', next: 'IN_REPAIR', colorClass: 'badge-diagnosis' },
  IN_REPAIR: { label: 'In Repair', next: 'QUALITY_CHECK', colorClass: 'badge-repair' },
  QUALITY_CHECK: { label: 'Quality Control', next: 'READY_DELIVERY', colorClass: 'badge-qc' },
  READY_DELIVERY: { label: 'Ready for Handover', colorClass: 'badge-ready' },
};

export const WorkProgressView: React.FC<WorkProgressViewProps> = ({
  jobs,
  onAdvanceStatus,
  onOpenNewJob,
  onOpenInspection,
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

    const matchesSearch =
      searchQuery === '' ||
      j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.jobNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSector && matchesSearch;
  });

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTOR 1: Workshop Bays & Quick Intake */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Wrench size={14} /> Sector 1 &bull; Workshop Bay Activity
          </span>
          <span className="sector-subtitle">{jobs.length} total vehicles</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Bay stats metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active in Bays
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {activeJobs.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                In service & diagnostics
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ready for Pickup
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {readyJobs.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                QC passed & invoiced
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewJob}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '14px' }}
          >
            <Plus size={18} /> Intake New Vehicle
          </button>
        </div>
      </section>

      {/* SECTOR 2: Stage Filter & Search Tool */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <CheckCircle2 size={14} /> Sector 2 &bull; Pipeline Stages
          </span>
          <span className="sector-subtitle">Filter by workflow</span>
        </div>

        {/* Clean Segmented Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: 'rgba(11, 17, 32, 0.8)',
          padding: '5px',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px',
        }}>
          {[
            { id: 'ACTIVE' as const, label: 'In Service', count: activeJobs.length },
            { id: 'READY' as const, label: 'Ready', count: readyJobs.length },
            { id: 'ALL' as const, label: 'All Jobs', count: jobs.length },
          ].map((seg) => {
            const isActive = activePipelineSector === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActivePipelineSector(seg.id)}
                style={{
                  background: isActive ? 'var(--accent-cyan)' : 'transparent',
                  color: isActive ? '#080b11' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '9px 4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span>{seg.label}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                  fontWeight: 800,
                }}>
                  {seg.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input with comfortable spacing */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            placeholder="Search by license plate, model, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '12px 14px 12px 40px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </section>

      {/* SECTOR 3: Breathable Vehicle Job Cards */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Car size={14} /> Sector 3 &bull; Active Work Cards ({filteredJobs.length})
          </span>
          <span className="sector-subtitle">Live workshop status</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>No vehicles in this sector.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Tap "Intake New Vehicle" to register a repair order.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const nextStatus = STATUS_CONFIG[job.status].next;
              const hasDamageReport = job.damagePoints && job.damagePoints.length > 0;

              return (
                <div
                  key={job.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Card Top: Plate, Model, Status Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          color: 'white',
                          fontFamily: 'var(--font-mono)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                        }}>
                          {job.vehiclePlate}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {job.jobNumber}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginTop: '6px' }}>
                        {job.vehicleModel}
                      </h3>
                    </div>

                    <span className={`badge-status ${STATUS_CONFIG[job.status].colorClass}`}>
                      {STATUS_CONFIG[job.status].label}
                    </span>
                  </div>

                  {/* Customer & Station Info Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> Customer
                      </div>
                      <div style={{ color: 'white', fontWeight: 600, marginTop: '2px' }}>
                        {job.customerName}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {job.customerPhone}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Station & Bay
                      </div>
                      <div style={{ color: 'white', fontWeight: 600, marginTop: '2px' }}>
                        {job.assignedBay || 'Unassigned Bay'}
                      </div>
                      <div style={{ color: 'var(--accent-amber)', fontSize: '11px' }}>
                        {job.assignedTechName || 'Awaiting Tech'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Concern Box */}
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    lineHeight: '1.5',
                  }}>
                    <strong style={{ color: 'var(--accent-amber)' }}>Service Concern: </strong>
                    {job.primaryComplaint}
                  </div>

                  {/* Cost & Inspection Summary */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                  }}>
                    <button
                      onClick={() => onOpenInspection(job)}
                      style={{
                        background: hasDamageReport ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${hasDamageReport ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                        color: hasDamageReport ? '#fbbf24' : 'var(--text-muted)',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <AlertCircle size={14} />
                      {hasDamageReport ? `DVI Report (${job.damagePoints!.length} logged)` : 'Perform DVI'}
                    </button>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '6px' }}>Estimated Total:</span>
                      <strong style={{ fontSize: '16px', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                        ${job.totalCost.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Advance Workflow Button */}
                  {nextStatus && (
                    <button
                      onClick={() => onAdvanceStatus(job.id, nextStatus)}
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        borderColor: 'rgba(6,182,212,0.3)',
                        borderRadius: '12px',
                      }}
                    >
                      Advance to {STATUS_CONFIG[nextStatus].label} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
};
