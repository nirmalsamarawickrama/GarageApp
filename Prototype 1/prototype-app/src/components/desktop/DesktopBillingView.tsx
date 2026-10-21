import React, { useState } from 'react';
import { 
  Receipt, 
  DollarSign, 
  Search, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Plus 
} from 'lucide-react';
import { JobCard } from '../../types';
import { DesktopBillEditModal } from './DesktopBillEditModal';
import { syncEngine } from '../../state/syncEngine';

interface DesktopBillingViewProps {
  jobs: JobCard[];
  onOpenNewJob?: () => void;
}

export const DesktopBillingView: React.FC<DesktopBillingViewProps> = ({
  jobs,
  onOpenNewJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'INVOICED' | 'PARTIAL' | 'PAID'>('ALL');
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobCard | null>(null);

  // Financial Computations
  const totalInvoiced = jobs.reduce((sum, j) => sum + (j.totalCost || 0), 0);
  const totalCollected = jobs.reduce((sum, j) => sum + (j.paidAmount || (j.billingStatus === 'PAID' ? j.totalCost : 0)), 0);
  const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);
  const overdueCount = jobs.filter((j) => (j.billingStatus === 'PENDING' || j.billingStatus === 'INVOICED') && j.status === 'READY_DELIVERY').length;

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    const billStatus = j.billingStatus || 'PENDING';
    const matchesStatus = statusFilter === 'ALL' || billStatus === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      j.jobNumber.toLowerCase().includes(query) ||
      (j.invoiceNumber && j.invoiceNumber.toLowerCase().includes(query)) ||
      j.customerName.toLowerCase().includes(query) ||
      j.vehiclePlate.toLowerCase().includes(query) ||
      j.vehicleModel.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: JobCard['billingStatus']) => {
    switch (status) {
      case 'PAID':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: '#34d399',
          border: 'rgba(16, 185, 129, 0.3)',
          label: 'PAID IN FULL',
        };
      case 'PARTIAL':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          text: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.3)',
          label: 'PARTIAL DEPOSIT',
        };
      case 'INVOICED':
        return {
          bg: 'rgba(6, 182, 212, 0.15)',
          text: '#22d3ee',
          border: 'rgba(6, 182, 212, 0.3)',
          label: 'INVOICED',
        };
      case 'PENDING':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          text: '#94a3b8',
          border: 'rgba(148, 163, 184, 0.3)',
          label: 'PENDING ESTIMATE',
        };
    }
  };

  const handleQuickMarkPaid = (job: JobCard) => {
    syncEngine.updateJobCardBilling(job.id, {
      billingStatus: 'PAID',
      paidAmount: job.totalCost,
      paymentMethod: job.paymentMethod || 'Card',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Financial Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Billed &amp; Invoiced
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
              <Receipt size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '12px' }}>
            ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Across {jobs.length} workshop orders
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Collected Payments
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
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', marginTop: '12px' }}>
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Settled via Card, Cash &amp; Fleet
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Outstanding Receivables
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
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24', marginTop: '12px' }}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Uncollected balance on open jobs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Uncollected on Completed Jobs
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: overdueCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: overdueCount > 0 ? '#f87171' : '#94a3b8',
            }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: overdueCount > 0 ? '#f87171' : 'white', marginTop: '12px' }}>
            {overdueCount} Jobs
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Ready for customer pickup
          </div>
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
            placeholder="Search invoice, customer, plate..."
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

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'PENDING', 'INVOICED', 'PARTIAL', 'PAID'] as const).map((st) => (
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

        {/* Action Button */}
        {onOpenNewJob && (
          <button onClick={onOpenNewJob} className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={15} />
            <span>New Work Order</span>
          </button>
        )}
      </div>

      {/* Comprehensive Invoices & Work Orders Data Table */}
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
                <th style={{ padding: '14px 18px' }}>Invoice / Job #</th>
                <th style={{ padding: '14px 16px' }}>Customer &amp; Vehicle</th>
                <th style={{ padding: '14px 16px' }}>Technician / Bay</th>
                <th style={{ padding: '14px 14px', textAlign: 'right' }}>Labor ($)</th>
                <th style={{ padding: '14px 14px', textAlign: 'right' }}>Parts ($)</th>
                <th style={{ padding: '14px 14px', textAlign: 'right' }}>Tax ($)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Total ($)</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Billing Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No work orders found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const badge = getStatusBadge(job.billingStatus);
                  const effectiveLabor = job.estimatedLaborCost || 0;
                  const effectiveParts = job.partsCost || 0;
                  const effectiveTax = job.taxAmount || Math.round((job.totalCost || 0) * 0.08 * 100) / 100;
                  const effectiveTotal = job.totalCost || 0;
                  const paid = job.paidAmount || (job.billingStatus === 'PAID' ? effectiveTotal : 0);
                  const isFullyPaid = job.billingStatus === 'PAID' || paid >= effectiveTotal;

                  return (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s',
                      }}
                    >
                      {/* Invoice & Job # */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)' }}>
                          {job.invoiceNumber || `INV-${job.jobNumber.slice(-4)}`}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                          {job.jobNumber}
                        </div>
                      </td>

                      {/* Customer & Vehicle */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>{job.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {job.vehicleModel} • <strong>{job.vehiclePlate}</strong>
                        </div>
                      </td>

                      {/* Technician & Bay */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-main)' }}>{job.assignedTechName || 'Shop Master'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {job.assignedBay || 'Main Bay'}
                        </div>
                      </td>

                      {/* Labor */}
                      <td style={{ padding: '14px 14px', textAlign: 'right', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        ${effectiveLabor.toFixed(2)}
                      </td>

                      {/* Parts */}
                      <td style={{ padding: '14px 14px', textAlign: 'right', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        ${effectiveParts.toFixed(2)}
                      </td>

                      {/* Tax */}
                      <td style={{ padding: '14px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        ${effectiveTax.toFixed(2)}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: 'white', fontSize: '14px' }}>
                        ${effectiveTotal.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}>
                          {badge.label}
                        </span>
                        {paid > 0 && !isFullyPaid && (
                          <div style={{ fontSize: '10px', color: 'var(--accent-amber)', marginTop: '2px' }}>
                            Paid: ${paid.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Management Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedJobForEdit(job)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Edit bill & labor rates"
                          >
                            <Edit3 size={13} />
                            <span>Edit Bill</span>
                          </button>

                          {!isFullyPaid && (
                            <button
                              onClick={() => handleQuickMarkPaid(job)}
                              style={{
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                padding: '6px 10px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Mark full payment settled"
                            >
                              <CheckCircle2 size={13} />
                              <span>Settle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill & Invoice Editor Modal */}
      {selectedJobForEdit && (
        <DesktopBillEditModal
          isOpen={!!selectedJobForEdit}
          onClose={() => setSelectedJobForEdit(null)}
          job={selectedJobForEdit}
        />
      )}
    </div>
  );
};
