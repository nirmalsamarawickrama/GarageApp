import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, AlertCircle, MessageSquare, Check, BarChart3 } from 'lucide-react';
import { GarageBranch, JobCard } from '../../types';

interface SalesInsightsViewProps {
  activeBranch: GarageBranch;
  jobs: JobCard[];
  canSendReminders?: boolean;
}

export const SalesInsightsView: React.FC<SalesInsightsViewProps> = ({
  activeBranch,
  jobs,
  canSendReminders = true,
}) => {
  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const totalLabor = jobs.reduce((sum, j) => sum + (j.estimatedLaborCost ?? 0), 0);
  const totalParts = jobs.reduce((sum, j) => sum + (j.partsCost ?? 0), 0);
  const totalInvoiced = jobs.reduce((sum, j) => sum + (j.totalCost ?? 0), 0);
  const avgRepairOrder = jobs.length > 0 ? totalInvoiced / jobs.length : 0;

  const splitDenominator = Math.max(1, totalLabor + totalParts);
  const laborPct = Math.round((totalLabor / splitDenominator) * 100);
  const partsPct = 100 - laborPct;

  const branchScale = activeBranch.monthlyRevenue / 64200;
  const weeklyTrend = [
    { day: 'Mon', revenue: Math.round(6400 * branchScale) },
    { day: 'Tue', revenue: Math.round(7850 * branchScale) },
    { day: 'Wed', revenue: Math.round(9200 * branchScale) },
    { day: 'Thu', revenue: Math.round(8600 * branchScale) },
    { day: 'Fri', revenue: Math.round(11400 * branchScale) },
    { day: 'Sat', revenue: Math.round(13900 * branchScale) },
    { day: 'Sun', revenue: Math.round(6850 * branchScale) },
  ];
  const weeklyTotal = weeklyTrend.reduce((sum, d) => sum + d.revenue, 0);
  const maxRevenue = Math.max(1, ...weeklyTrend.map((d) => d.revenue));

  const unpaidInvoices = jobs
    .map((j) => {
      const total = j.totalCost ?? 0;
      const paid = j.billingStatus === 'PAID' ? (j.paidAmount ?? total) : (j.paidAmount ?? 0);
      const balance = Math.max(0, Math.round((total - paid) * 100) / 100);
      return {
        id: j.id,
        jobNumber: j.jobNumber,
        customer: j.customerName,
        amount: balance,
        billingStatus: j.billingStatus || 'PENDING',
      };
    })
    .filter((inv) => inv.billingStatus !== 'PAID' && inv.amount > 0);

  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleSendReminder = (id: string) => {
    if (!canSendReminders) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setReminderSent(id);
    timerRef.current = window.setTimeout(() => {
      setReminderSent(null);
      timerRef.current = null;
    }, 2500);
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTOR 1: Financial Performance */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <DollarSign size={14} color="var(--accent-primary)" /> Sector 1 &bull; Financial Performance
          </span>
          <span className="sg-sector-subtitle">{activeBranch.name}</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Branch Monthly Rev</div>
              <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>
                ${activeBranch.monthlyRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={12} /> Active orders: ${totalInvoiced.toFixed(0)}
              </div>
            </div>

            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Avg Repair Order</div>
              <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>
                ${avgRepairOrder.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Across {jobs.length} branch order{jobs.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Revenue Split */}
          <div className="sg-panel-muted" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Open Orders Mix</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                {laborPct}% Labor / {partsPct}% Parts
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
              <div style={{ width: `${laborPct}%`, background: 'var(--accent-primary)' }} />
              <div style={{ width: `${partsPct}%`, background: 'var(--accent-volt)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-primary)', marginRight: '4px', border: '1px solid var(--border-strong)' }} />
                Labor: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>${totalLabor.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent-volt)', marginRight: '4px', border: '1px solid var(--border-strong)' }} />
                Parts: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>${totalParts.toFixed(2)}</strong>
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
          <span className="sg-sector-subtitle tabular">${(weeklyTotal / 1000).toFixed(1)}k projected/wk</span>
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
          <span className="sg-sector-subtitle tabular">${totalOutstanding.toFixed(2)} outstanding</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {unpaidInvoices.length === 0 ? (
            <div className="sg-panel-muted" style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              All invoices in {activeBranch.name} are settled.
            </div>
          ) : (
            unpaidInvoices.map((inv, idx) => (
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
                    {inv.jobNumber} &bull; {inv.billingStatus} &bull;{' '}
                    <strong className="tabular" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      ${inv.amount.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {canSendReminders && (
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
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
