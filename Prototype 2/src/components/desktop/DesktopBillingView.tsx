import React, { useState } from 'react';
import { Receipt, DollarSign, Search, Edit3, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { JobCard } from '../../types';
import { DesktopBillEditModal } from './DesktopBillEditModal';
import { syncEngine } from '../../state/syncEngine';

interface DesktopBillingViewProps {
  jobs: JobCard[];
  onOpenNewJob?: () => void;
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'INVOICED', 'PARTIAL', 'PAID'] as const;

export const DesktopBillingView: React.FC<DesktopBillingViewProps> = ({
  jobs,
  onOpenNewJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobCard | null>(null);

  const totalInvoiced = jobs.reduce((sum, j) => sum + (j.totalCost || 0), 0);
  const totalCollected = jobs.reduce(
    (sum, j) => sum + (j.paidAmount || (j.billingStatus === 'PAID' ? j.totalCost : 0)),
    0
  );
  const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);
  const overdueCount = jobs.filter(
    (j) =>
      (j.billingStatus === 'PENDING' || j.billingStatus === 'INVOICED') &&
      j.status === 'READY_DELIVERY'
  ).length;

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
        return { cls: 'sg-badge sg-badge-ready', label: 'PAID IN FULL' };
      case 'PARTIAL':
        return { cls: 'sg-badge sg-badge-diagnosis', label: 'PARTIAL DEPOSIT' };
      case 'INVOICED':
        return { cls: 'sg-badge sg-badge-repair', label: 'INVOICED' };
      case 'PENDING':
      default:
        return { cls: 'sg-badge sg-badge-intake', label: 'PENDING ESTIMATE' };
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Financial KPI Grid */}
      <div className="sg-kpi-4">
        <div className="sg-grid-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Total Billed &amp; Invoiced</span>
            <Receipt size={18} color="var(--accent-primary)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, marginTop: '6px' }}>
            ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {jobs.length} workshop orders
          </div>
        </div>

        <div className="sg-grid-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Collected Payments</span>
            <CheckCircle2 size={18} color="var(--accent-secondary)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '6px' }}>
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Settled via Card, Cash &amp; Fleet
          </div>
        </div>

        <div className="sg-grid-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Outstanding Receivables</span>
            <DollarSign size={18} color="var(--accent-amber)" />
          </div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '6px' }}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Uncollected balance on open jobs
          </div>
        </div>

        <div
          className="sg-grid-cell"
          style={{ background: overdueCount > 0 ? 'var(--accent-danger-tint)' : 'var(--bg-surface)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="sg-label">Uncollected Completed</span>
            <AlertCircle size={18} color={overdueCount > 0 ? 'var(--accent-danger)' : 'var(--text-muted)'} />
          </div>
          <div
            className="tabular"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 700,
              color: overdueCount > 0 ? 'var(--accent-danger)' : 'var(--text-primary)',
              marginTop: '6px',
            }}
          >
            {overdueCount} Jobs
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ready for customer pickup
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className="sg-panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
          <input
            type="text"
            className="sg-input"
            placeholder="Search invoice, customer, plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`sg-btn sg-btn-sm ${statusFilter === st ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
            >
              {st}
            </button>
          ))}
        </div>

        {onOpenNewJob && (
          <button type="button" onClick={onOpenNewJob} className="sg-btn sg-btn-volt">
            <Plus size={15} /> New Work Order
          </button>
        )}
      </div>

      {/* Invoices Data Table */}
      <div className="sg-table-wrap">
        <table className="sg-table">
          <thead>
            <tr>
              <th>Invoice / Job #</th>
              <th>Customer &amp; Vehicle</th>
              <th>Technician / Bay</th>
              <th style={{ textAlign: 'right' }}>Labor ($)</th>
              <th style={{ textAlign: 'right' }}>Parts ($)</th>
              <th style={{ textAlign: 'right' }}>Tax ($)</th>
              <th style={{ textAlign: 'right' }}>Total ($)</th>
              <th style={{ textAlign: 'center' }}>Billing Status</th>
              <th style={{ textAlign: 'center' }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                  <tr key={job.id}>
                    <td>
                      <div className="tabular" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {job.invoiceNumber || `INV-${job.jobNumber.slice(-4)}`}
                      </div>
                      <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-primary)' }}>
                        {job.jobNumber}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{job.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span>{job.vehicleModel}</span>
                        <span className="sg-plate tabular" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {job.vehiclePlate}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>{job.assignedTechName || 'Shop Master'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {job.assignedBay || 'Main Bay'}
                      </div>
                    </td>

                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ${effectiveLabor.toFixed(2)}
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-amber)' }}>
                      ${effectiveParts.toFixed(2)}
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ${effectiveTax.toFixed(2)}
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>
                      ${effectiveTotal.toFixed(2)}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={badge.cls}>{badge.label}</span>
                      {paid > 0 && !isFullyPaid && (
                        <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-amber)', marginTop: '3px' }}>
                          Paid: ${paid.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedJobForEdit(job)}
                          className="sg-btn sg-btn-secondary sg-btn-sm"
                          title="Edit bill & labor rates"
                        >
                          <Edit3 size={12} /> Edit Bill
                        </button>

                        {!isFullyPaid && (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkPaid(job)}
                            className="sg-btn sg-btn-emerald sg-btn-sm"
                            title="Mark full payment settled"
                          >
                            <CheckCircle2 size={12} /> Settle
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
