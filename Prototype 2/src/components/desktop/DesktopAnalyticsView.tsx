import React, { useState } from 'react';
import { TrendingUp, DollarSign, Wrench, Award, ArrowUpRight } from 'lucide-react';
import { JobCard, Employee, GarageBranch } from '../../types';

interface DesktopAnalyticsViewProps {
  jobs: JobCard[];
  employees: Employee[];
  branches: GarageBranch[];
  activeBranchId: string;
}

const RANGES: { id: '7D' | '30D' | 'YTD'; label: string; scale: number }[] = [
  { id: '7D', label: 'Last 7 Days', scale: 1 },
  { id: '30D', label: 'Past 30 Days', scale: 3.8 },
  { id: 'YTD', label: 'Year to Date', scale: 11.4 },
];

export const DesktopAnalyticsView: React.FC<DesktopAnalyticsViewProps> = ({
  jobs,
  employees,
  branches,
  activeBranchId,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'YTD'>('7D');
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const activeRange = RANGES.find((r) => r.id === timeRange) || RANGES[0];
  const rangeIdx = RANGES.findIndex((r) => r.id === timeRange);

  const totalLaborRevenue = jobs.reduce((sum, j) => sum + (j.estimatedLaborCost || 0), 0);
  const totalPartsRevenue = jobs.reduce((sum, j) => sum + (j.partsCost || 0), 0);
  const totalRevenue = totalLaborRevenue + totalPartsRevenue;
  const avgOrderValue = jobs.length > 0 ? totalRevenue / jobs.length : 0;

  const avgEfficiency =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.efficiencyRating, 0) / employees.length)
      : 100;

  const weeklyData = [
    { day: 'Mon', labor: Math.round(1420 * activeRange.scale), parts: Math.round(980 * activeRange.scale) },
    { day: 'Tue', labor: Math.round(1850 * activeRange.scale), parts: Math.round(1240 * activeRange.scale) },
    { day: 'Wed', labor: Math.round(2100 * activeRange.scale), parts: Math.round(1450 * activeRange.scale) },
    { day: 'Thu', labor: Math.round(1980 * activeRange.scale), parts: Math.round(1120 * activeRange.scale) },
    { day: 'Fri', labor: Math.round(2650 * activeRange.scale), parts: Math.round(1890 * activeRange.scale) },
    { day: 'Sat', labor: Math.round(3100 * activeRange.scale), parts: Math.round(2200 * activeRange.scale) },
    { day: 'Sun', labor: Math.round(890 * activeRange.scale), parts: Math.round(450 * activeRange.scale) },
  ];

  const maxDayTotal = Math.max(...weeklyData.map((d) => d.labor + d.parts));

  const statusCounts = {
    INTAKE: jobs.filter((j) => j.status === 'INTAKE').length,
    DIAGNOSIS: jobs.filter((j) => j.status === 'DIAGNOSIS').length,
    IN_REPAIR: jobs.filter((j) => j.status === 'IN_REPAIR').length,
    QUALITY_CHECK: jobs.filter((j) => j.status === 'QUALITY_CHECK').length,
    READY_DELIVERY: jobs.filter((j) => j.status === 'READY_DELIVERY').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        className="sg-panel"
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase' }}>
              Garage Intelligence &amp; Bay Telemetry
            </h1>
            <span className="sg-badge sg-badge-ready">
              <span className="sg-led sg-led-live" /> LIVE TELEMETRY
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Operating metrics for <strong>{activeBranch.name}</strong> &bull; {activeBranch.baysCount} Active Workstation Bays
          </p>
        </div>

        <div className="sg-segmented" style={{ gridTemplateColumns: 'repeat(3, 1fr)', minWidth: '300px' }}>
          <div
            className="sg-segmented-thumb"
            style={{
              width: 'calc((100% - 6px) / 3)',
              transform: `translateX(${rangeIdx * 100}%)`,
            }}
          />
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className="sg-segmented-btn"
              data-active={timeRange === r.id}
              onClick={() => setTimeRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Executive KPIs (Exposed Structural Grid) */}
      <div className="sg-kpi-4">
        <div className="sg-grid-cell stagger-item" style={{ '--stagger-index': 0 } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Monthly Revenue</span>
            <DollarSign size={18} color="var(--accent-secondary)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
            ${activeBranch.monthlyRevenue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +14.8%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs previous month</span>
          </div>
        </div>

        <div className="sg-grid-cell stagger-item" style={{ '--stagger-index': 1 } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Avg Repair Order (ARO)</span>
            <TrendingUp size={18} color="var(--accent-primary)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
            ${avgOrderValue.toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +6.2%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>labor + parts mix</span>
          </div>
        </div>

        <div className="sg-grid-cell stagger-item" style={{ '--stagger-index': 2 } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Bay Utilization</span>
            <Wrench size={18} color="var(--accent-amber)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
            87.5%
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', marginTop: '8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '5px',
                  background: i < 7 ? 'var(--accent-amber)' : 'var(--bg-recessed)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-amber)' }}>
            7 of {activeBranch.baysCount} Bays Occupied
          </div>
        </div>

        <div className="sg-grid-cell stagger-item" style={{ '--stagger-index': 3 } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Team Labor Efficiency</span>
            <Award size={18} color="var(--accent-secondary)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
            {avgEfficiency}%
          </div>
          <div style={{ height: '6px', background: 'var(--bg-recessed)', border: '1px solid var(--border-subtle)', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, avgEfficiency)}%`, height: '100%', background: 'var(--accent-secondary)' }} />
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            Billed vs. Clocked Hours
          </div>
        </div>
      </div>

      {/* Revenue Flow Chart + Revenue Structure */}
      <div className="sg-analytics-split">
        <div className="sg-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Revenue Flow (Labor vs. Parts)</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cumulative workshop billing ({activeRange.label})
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--accent-primary)', border: '1px solid var(--border-strong)' }} />
                <span>Labor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--accent-volt)', border: '1px solid var(--border-strong)' }} />
                <span>Parts &amp; Fluids</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '210px', gap: '12px', paddingTop: '12px' }}>
            {weeklyData.map((d) => {
              const totalDay = d.labor + d.parts;
              const heightPx = Math.max(24, Math.round((totalDay / maxDayTotal) * 155));
              const laborPercent = (d.labor / totalDay) * 100;
              const partsPercent = (d.parts / totalDay) * 100;

              return (
                <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ${(totalDay / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{
                      width: '42px',
                      maxWidth: '100%',
                      height: `${heightPx}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--border-strong)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: `${partsPercent}%`,
                        background: 'var(--accent-volt)',
                        borderBottom: '1px solid var(--border-strong)',
                        transition: 'height 320ms var(--ease-out-expo)',
                      }}
                      title={`${d.day} Parts: $${d.parts.toLocaleString()}`}
                    />
                    <div
                      style={{
                        height: `${laborPercent}%`,
                        background: 'var(--accent-primary)',
                        transition: 'height 320ms var(--ease-out-expo)',
                      }}
                      title={`${d.day} Labor: $${d.labor.toLocaleString()}`}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sg-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Revenue Structure</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Profit contributions by service department
            </p>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Mechanical Diagnostic & Labor', pct: '58.2%', color: 'var(--accent-primary)' },
                { label: 'OEM & Aftermarket Parts', pct: '34.5%', color: 'var(--accent-volt)' },
                { label: 'Environmental & Shop Consumables', pct: '7.3%', color: 'var(--accent-secondary)' },
              ].map((row) => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 600 }}>{row.label}</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {row.pct}
                    </span>
                  </div>
                  <div style={{ height: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}>
                    <div style={{ width: row.pct, height: '100%', background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              background: 'var(--accent-volt)',
              color: 'var(--ink-on-accent)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-control)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
              Gross Operating Margin
            </div>
            <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>
              64.2% <span style={{ fontSize: '12px', fontWeight: 600 }}>(+2.1% target beat)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Pipeline Stage Breakdown & Branch Network */}
      <div className="sg-analytics-bottom">
        <div className="sg-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Live Repair Orders in Workshop ({jobs.length} Active)
          </h2>

          <div className="sg-grid-matrix" style={{ gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center' }}>
            {[
              { label: 'Intake', count: statusCounts.INTAKE, color: 'var(--text-primary)' },
              { label: 'Diagnosis', count: statusCounts.DIAGNOSIS, color: 'var(--accent-amber)' },
              { label: 'In Repair', count: statusCounts.IN_REPAIR, color: 'var(--accent-primary)' },
              { label: 'QC & Test', count: statusCounts.QUALITY_CHECK, color: 'var(--accent-violet)' },
              { label: 'Ready', count: statusCounts.READY_DELIVERY, color: 'var(--accent-secondary)' },
            ].map((st) => (
              <div key={st.label} className="sg-grid-cell" style={{ padding: '14px 8px' }}>
                <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: st.color }}>
                  {st.count}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sg-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Multi-Location Network Performance
          </h2>
          <div className="sg-table-wrap">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>Branch Hub</th>
                  <th style={{ textAlign: 'center' }}>Bays</th>
                  <th style={{ textAlign: 'center' }}>Active Jobs</th>
                  <th style={{ textAlign: 'right' }}>Monthly Rev</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      background: b.id === activeBranchId ? 'var(--accent-primary-tint)' : 'transparent',
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.city}</div>
                    </td>
                    <td className="tabular" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{b.baysCount}</td>
                    <td className="tabular" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {b.activeJobsCount}
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      ${b.monthlyRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
