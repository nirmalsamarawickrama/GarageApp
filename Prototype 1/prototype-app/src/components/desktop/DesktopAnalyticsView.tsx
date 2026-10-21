import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wrench,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { JobCard, Employee, GarageBranch } from '../../types';

interface DesktopAnalyticsViewProps {
  jobs: JobCard[];
  employees: Employee[];
  branches: GarageBranch[];
  activeBranchId: string;
}

export const DesktopAnalyticsView: React.FC<DesktopAnalyticsViewProps> = ({
  jobs,
  employees,
  branches,
  activeBranchId,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'YTD'>('7D');
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // Financial Aggregations
  const totalLaborRevenue = jobs.reduce((sum, j) => sum + (j.estimatedLaborCost || 0), 0);
  const totalPartsRevenue = jobs.reduce((sum, j) => sum + (j.partsCost || 0), 0);
  const totalRevenue = totalLaborRevenue + totalPartsRevenue;
  const avgOrderValue = jobs.length > 0 ? totalRevenue / jobs.length : 0;

  // Calculate average efficiency
  const avgEfficiency = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.efficiencyRating, 0) / employees.length)
    : 100;

  // 7-day revenue mock dataset
  const weeklyData = [
    { day: 'Mon', labor: 1420, parts: 980, jobs: 6 },
    { day: 'Tue', labor: 1850, parts: 1240, jobs: 8 },
    { day: 'Wed', labor: 2100, parts: 1450, jobs: 9 },
    { day: 'Thu', labor: 1980, parts: 1120, jobs: 7 },
    { day: 'Fri', labor: 2650, parts: 1890, jobs: 11 },
    { day: 'Sat', labor: 3100, parts: 2200, jobs: 14 },
    { day: 'Sun', labor: 890, parts: 450, jobs: 3 },
  ];

  const maxDayTotal = Math.max(...weeklyData.map((d) => d.labor + d.parts));

  // Pipeline distribution
  const statusCounts = {
    INTAKE: jobs.filter((j) => j.status === 'INTAKE').length,
    DIAGNOSIS: jobs.filter((j) => j.status === 'DIAGNOSIS').length,
    IN_REPAIR: jobs.filter((j) => j.status === 'IN_REPAIR').length,
    QUALITY_CHECK: jobs.filter((j) => j.status === 'QUALITY_CHECK').length,
    READY_DELIVERY: jobs.filter((j) => j.status === 'READY_DELIVERY').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner: Branch Status & Date Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(10, 15, 29, 0.95))',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(16px)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>
              Garage Intelligence &amp; Performance Overview
            </h1>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              Live Telemetry
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Operating metrics for {activeBranch.name} • {activeBranch.baysCount} Active Workstation Bays
          </p>
        </div>

        {/* Time Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-card)',
        }}>
          {(['7D', '30D', 'YTD'] as ('7D' | '30D' | 'YTD')[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: timeRange === r ? 'var(--accent-cyan)' : 'transparent',
                color: timeRange === r ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Past 30 Days' : 'Year to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Monthly Revenue
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '12px' }}>
            ${activeBranch.monthlyRevenue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +14.8%
            </span>
            <span style={{ color: 'var(--text-dim)' }}>vs previous month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Average Repair Order (ARO)
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '12px' }}>
            ${avgOrderValue.toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#22d3ee', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +6.2%
            </span>
            <span style={{ color: 'var(--text-dim)' }}>labor + parts mix</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Bay Utilization
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}>
              <Wrench size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '12px' }}>
            87.5%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>
              7 of {activeBranch.baysCount} Bays Occupied
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Team Labor Efficiency
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa',
            }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '12px' }}>
            {avgEfficiency}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>
              Billed vs. Clocked Hours
            </span>
          </div>
        </div>
      </div>

      {/* Mid Section: Weekly Revenue Breakdown Chart & Parts vs Labor Mix */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Interactive 7-Day Revenue Bar Graph */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
                Weekly Revenue Flow (Labor vs. Parts)
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cumulative workshop billing over the current cycle
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-cyan)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Labor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-amber)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Parts &amp; Fluids</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '10px 0 20px 0' }}>
            {weeklyData.map((d) => {
              const totalDay = d.labor + d.parts;
              const heightPercent = (totalDay / maxDayTotal) * 100;
              const laborPercent = (d.labor / totalDay) * 100;
              const partsPercent = (d.parts / totalDay) * 100;

              return (
                <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    ${(totalDay / 1000).toFixed(1)}k
                  </div>

                  <div style={{
                    width: '38px',
                    height: `${heightPercent * 1.6}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.03)',
                  }}>
                    {/* Parts Segment */}
                    <div
                      style={{
                        height: `${partsPercent}%`,
                        background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                        transition: 'height 0.4s ease',
                      }}
                      title={`${d.day} Parts: $${d.parts}`}
                    />
                    {/* Labor Segment */}
                    <div
                      style={{
                        height: `${laborPercent}%`,
                        background: 'linear-gradient(180deg, #06b6d4, #0284c7)',
                        transition: 'height 0.4s ease',
                      }}
                      title={`${d.day} Labor: $${d.labor}`}
                    />
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Split & Margin Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
              Revenue Structure
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Profit contributions by service department
            </p>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Mechanical Diagnostic &amp; Labor</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>58.2%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: '58.2%', height: '100%', background: 'linear-gradient(90deg, #06b6d4, #0284c7)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>OEM &amp; Aftermarket Parts</span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>34.5%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: '34.5%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Environmental &amp; Shop Consumables</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>7.3%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: '7.3%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Gross Operating Margin
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginTop: '2px' }}>
              64.2% <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>(+2.1% target beat)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Pipeline Stage Breakdown & Branch Comparative */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Work Order Stage Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Live Repair Orders in Workshop ({jobs.length} Active)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#94a3b8' }}>{statusCounts.INTAKE}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>Intake</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>{statusCounts.DIAGNOSIS}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>Diagnosis</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#22d3ee' }}>{statusCounts.IN_REPAIR}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>In Repair</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#a78bfa' }}>{statusCounts.QUALITY_CHECK}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>QC &amp; Test</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>{statusCounts.READY_DELIVERY}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>Ready</div>
            </div>
          </div>
        </div>

        {/* Branch Network Performance Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Multi-Location Network Performance
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-card)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Branch Hub</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Bays</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Active Jobs</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Monthly Rev</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: b.id === activeBranchId ? 'rgba(6, 182, 212, 0.06)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px', color: 'white', fontWeight: 600 }}>
                      {b.name}
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{b.city}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>{b.baysCount}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: 'var(--accent-cyan)', fontWeight: 700 }}>{b.activeJobsCount}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 700 }}>
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
