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
      
      {/* SECTOR 1: Revenue & Margins Overview */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <DollarSign size={14} /> Sector 1 &bull; Financial Performance
          </span>
          <span className="sector-subtitle">{activeBranchName}</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hero KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Monthly Revenue</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'white',
                fontFamily: 'var(--font-mono)',
                marginTop: '6px',
              }}>
                $64,200
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={12} /> +14.2% vs last month
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Repair Order</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'white',
                fontFamily: 'var(--font-mono)',
                marginTop: '6px',
              }}>
                $368.50
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Healthy shop benchmark
              </div>
            </div>
          </div>

          {/* Revenue Split: Labor vs Parts */}
          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Revenue Split</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>54.2% Gross Margin</span>
            </div>

            <div style={{ height: '8px', width: '100%', borderRadius: '6px', background: '#1e293b', overflow: 'hidden', display: 'flex', marginBottom: '10px' }}>
              <div style={{ width: '58%', background: 'var(--accent-cyan)' }} />
              <div style={{ width: '34%', background: 'var(--accent-amber)' }} />
              <div style={{ width: '8%', background: 'var(--accent-purple)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-cyan)', marginRight: '4px' }} />
                Labor: <strong>$37.2k</strong>
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-amber)', marginRight: '4px' }} />
                Parts: <strong>$21.8k</strong>
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-purple)', marginRight: '4px' }} />
                Sublet: <strong>$5.1k</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTOR 2: Revenue Velocity & Trend */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <BarChart3 size={14} /> Sector 2 &bull; 7-Day Revenue Velocity
          </span>
          <span className="sector-subtitle">$64.2k this week</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingTop: '10px' }}>
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
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ${(item.revenue / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      borderRadius: '6px 6px 0 0',
                      background: isHighest
                        ? 'linear-gradient(180deg, #06b6d4, #0284c7)'
                        : 'rgba(255, 255, 255, 0.12)',
                      boxShadow: isHighest ? '0 0 14px rgba(6,182,212,0.4)' : 'none',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: isHighest ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTOR 3: Uncollected Accounts & Payment Reminders */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <AlertCircle size={14} color="#f87171" /> Sector 3 &bull; Uncollected Invoices
          </span>
          <span className="sector-subtitle">$5,750 outstanding</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {unpaidInvoices.map((inv) => (
            <div
              key={inv.id}
              className="glass-panel"
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{inv.customer}</div>
                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>
                  {inv.daysOverdue} days overdue &bull; <strong style={{ color: 'white', fontFamily: 'var(--font-mono)' }}>${inv.amount}</strong>
                </div>
              </div>

              <button
                onClick={() => handleSendReminder(inv.id)}
                style={{
                  background: reminderSent === inv.id ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.12)',
                  border: `1px solid ${reminderSent === inv.id ? 'var(--accent-emerald)' : 'rgba(6,182,212,0.3)'}`,
                  color: reminderSent === inv.id ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
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
