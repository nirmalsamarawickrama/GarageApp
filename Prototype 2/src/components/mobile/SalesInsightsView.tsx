import React, { useState } from 'react';
import { TrendingUp, DollarSign, AlertCircle, MessageSquare, Check, BarChart3 } from 'lucide-react';

interface SalesInsightsViewProps {
  activeBranchName: string;
}

export const SalesInsightsView: React.FC<SalesInsightsViewProps> = ({
  activeBranchName,
}) => {
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  const weeklyTrend = [
    { day: 'Mon', revenue: 6400 },
    { day: 'Tue', revenue: 7850 },
    { day: 'Wed', revenue: 9200 },
    { day: 'Thu', revenue: 8600 },
    { day: 'Fri', revenue: 11400 },
    { day: 'Sat', revenue: 13900 },
    { day: 'Sun', revenue: 6850 },
  ];

  const maxRevenue = Math.max(...weeklyTrend.map((d) => d.revenue));

  const unpaidInvoices = [
    { id: 'inv-101', customer: 'Nexus Logistics Fleet', amount: 3420, daysOverdue: 14 },
    { id: 'inv-102', customer: 'David Sterling', amount: 480, daysOverdue: 6 },
    { id: 'inv-103', customer: 'Summit Express Couriers', amount: 1850, daysOverdue: 22 },
  ];

  const handleSendReminder = (id: string) => {
    setReminderSent(id);
    setTimeout(() => setReminderSent(null), 2500);
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTOR 1: Financial Performance */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <DollarSign size={14} color="var(--accent-primary)" /> Sector 1 &bull; Financial Performance
          </span>
          <span className="sg-sector-subtitle">{activeBranchName}</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Monthly Revenue</div>
              <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>
                $64,200
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={12} /> +14.2% vs last month
              </div>
            </div>

            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Avg Repair Order</div>
              <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>
                $368.50
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Healthy shop benchmark
              </div>
            </div>
          </div>

          {/* Revenue Split */}
          <div className="sg-panel-muted" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Revenue Split</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                54.2% Gross Margin
              </span>
            </div>

            <div
              style={{
                height: '10px',
                width: '100%',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                display: 'flex',
                marginBottom: '10px',
              }}
            >
              <div style={{ width: '58%', background: 'var(--accent-primary)' }} />
              <div style={{ width: '34%', background: 'var(--accent-volt)' }} />
              <div style={{ width: '8%', background: 'var(--accent-violet)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-primary)', marginRight: '4px', border: '1px solid var(--border-strong)' }} />
                Labor: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>$37.2k</strong>
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-volt)', marginRight: '4px', border: '1px solid var(--border-strong)' }} />
                Parts: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>$21.8k</strong>
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-violet)', marginRight: '4px', border: '1px solid var(--border-strong)' }} />
                Sublet: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>$5.1k</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTOR 2: 7-Day Revenue Velocity */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <BarChart3 size={14} /> Sector 2 &bull; 7-Day Revenue Velocity
          </span>
          <span className="sg-sector-subtitle tabular">$64.2k this week</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px' }}>
          <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '10px' }}>
            {weeklyTrend.map((item) => {
              const heightPercent = (item.revenue / maxRevenue) * 100;
              const isHighest = item.revenue === maxRevenue;

              return (
                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div className="tabular" style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ${(item.revenue / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(12, heightPercent * 0.72)}%`,
                      border: '1px solid var(--border-strong)',
                      background: isHighest ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      transition: 'height 350ms var(--ease-out-expo)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: isHighest ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTOR 3: Uncollected Invoices */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title" style={{ color: 'var(--accent-danger)' }}>
            <AlertCircle size={14} /> Sector 3 &bull; Uncollected Invoices
          </span>
          <span className="sg-sector-subtitle tabular">$5,750 outstanding</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {unpaidInvoices.map((inv, idx) => (
            <div
              key={inv.id}
              className="sg-panel stagger-item"
              style={{
                '--stagger-index': idx,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              } as React.CSSProperties}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{inv.customer}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 600, marginTop: '2px' }}>
                  {inv.daysOverdue} days overdue &bull;{' '}
                  <strong className="tabular" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    ${inv.amount}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSendReminder(inv.id)}
                className={`sg-btn sg-btn-sm ${reminderSent === inv.id ? 'sg-btn-emerald' : 'sg-btn-volt'}`}
              >
                {reminderSent === inv.id ? (
                  <>
                    <Check size={13} /> Sent WhatsApp!
                  </>
                ) : (
                  <>
                    <MessageSquare size={13} /> Remind
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
