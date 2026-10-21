import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  CreditCard 
} from 'lucide-react';
import { JobCard } from '../../types';
import { syncEngine } from '../../state/syncEngine';

interface DesktopBillEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobCard | null;
  onSaved?: () => void;
}

export const DesktopBillEditModal: React.FC<DesktopBillEditModalProps> = (props) => {
  if (!props.isOpen || !props.job) return null;
  return <DesktopBillEditModalContent {...props} job={props.job} />;
};

const DesktopBillEditModalContent: React.FC<DesktopBillEditModalProps & { job: JobCard }> = ({
  onClose,
  job,
  onSaved,
}) => {
  const [laborCost, setLaborCost] = useState<number>(job.estimatedLaborCost || 0);
  const [laborHours, setLaborHours] = useState<number>(Math.max(1, Math.round((job.estimatedLaborCost || 120) / 95)));
  const [hourlyRate, setHourlyRate] = useState<number>(95);
  const [billingStatus, setBillingStatus] = useState<any>(job.billingStatus || 'INVOICED');
  const [paymentMethod, setPaymentMethod] = useState<any>(job.paymentMethod || 'Card');
  const [paidAmount, setPaidAmount] = useState<number>(job.paidAmount || (job.billingStatus === 'PAID' ? job.totalCost : 0));
  const [discountAmount, setDiscountAmount] = useState<number>(job.discountAmount || 0);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(job.invoiceNumber || `INV-2026-${job.jobNumber.slice(-4)}`);
  
  // Allocated Parts list
  const [parts, setParts] = useState<{ partId: string; partName: string; quantity: number; unitPrice: number }[]>(
    job.allocatedParts && job.allocatedParts.length > 0
      ? [...job.allocatedParts]
      : [
          { partId: 'inv-1', partName: 'Standard Service Consumables & Fluids', quantity: 1, unitPrice: job.partsCost || 45.0 }
        ]
  );

  // New Part item inputs
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(25);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Calculations
  const calculatedPartsTotal = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const effectiveLaborTotal = laborCost;
  const subtotal = Math.max(0, effectiveLaborTotal + calculatedPartsTotal - discountAmount);
  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
  const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;
  const balanceDue = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  const handleLaborHoursChange = (hrs: number) => {
    setLaborHours(hrs);
    setLaborCost(hrs * hourlyRate);
  };

  const handleHourlyRateChange = (rate: number) => {
    setHourlyRate(rate);
    setLaborCost(laborHours * rate);
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    setParts([
      ...parts,
      {
        partId: `part-custom-${Date.now()}`,
        partName: newPartName.trim(),
        quantity: Math.max(1, newPartQty),
        unitPrice: Math.max(0, newPartPrice),
      },
    ]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartPrice(25);
    setIsAddingPart(false);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSaveBill = () => {
    let resolvedStatus = billingStatus;
    if (paidAmount >= grandTotal && grandTotal > 0) {
      resolvedStatus = 'PAID';
    } else if (paidAmount > 0 && paidAmount < grandTotal) {
      resolvedStatus = 'PARTIAL';
    }

    syncEngine.updateJobCardBilling(job.id, {
      estimatedLaborCost: effectiveLaborTotal,
      partsCost: calculatedPartsTotal,
      totalCost: grandTotal,
      taxAmount,
      discountAmount,
      billingStatus: resolvedStatus,
      paidAmount,
      paymentMethod,
      invoiceNumber,
      allocatedParts: parts,
    });

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 130,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-accent)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: showPrintPreview ? '850px' : '900px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.2)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.9)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>
                  {showPrintPreview ? 'Official Invoice & Tax Receipt' : 'Work Order Bill & Invoicing Manager'}
                </h2>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}>
                  {invoiceNumber}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Job: {job.jobNumber} • {job.customerName} ({job.vehicleModel} - {job.vehiclePlate})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              <Printer size={15} />
              <span>{showPrintPreview ? 'Back to Editor' : 'Print Preview'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {showPrintPreview ? (
            /* Official Printable Receipt Layout */
            <div id="invoice-print-sheet" style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '36px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              fontFamily: 'sans-serif',
            }}>
              {/* Receipt Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    AUTOPULSE™ MOTORS &amp; FLEET
                  </h1>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    1024 Industrial Pkwy, Sector 4 • Downtown Metro<br />
                    Direct Phone: +1 (555) 234-8901 • GST/Tax ID: AP-89214-TX
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>INVOICE</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>#{invoiceNumber}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Date: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '2026-10-15'}</div>
                </div>
              </div>

              {/* Bill To & Vehicle Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '24px 0', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Customer Information</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>{job.customerName}</div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>Phone: {job.customerPhone}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Job Card: {job.jobNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Vehicle Information</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>{job.vehicleModel}</div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>Plate: <strong>{job.vehiclePlate}</strong> • VIN: {job.vin}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Assigned Tech: {job.assignedTechName || 'Shop Master'}</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 6px' }}>Item / Service Description</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty / Hrs</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Rate ($)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Labor */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong>Mechanical Labor &amp; Diagnostic Bay Service</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Primary Complaint: {job.primaryComplaint}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{laborHours} hrs</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>${hourlyRate.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>${effectiveLaborTotal.toFixed(2)}</td>
                  </tr>

                  {/* Parts */}
                  {parts.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span>{p.partName}</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{p.quantity}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>${p.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>
                        ${(p.quantity * p.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <div style={{ width: '280px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                    <span>Labor Subtotal:</span>
                    <span>${effectiveLaborTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                    <span>Parts &amp; Consumables:</span>
                    <span>${calculatedPartsTotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#16a34a' }}>
                      <span>Loyalty Discount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                    <span>Sales Tax (8%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderTop: '2px solid #0f172a',
                    borderBottom: '2px solid #0f172a',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '8px 0',
                  }}>
                    <span>Grand Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700, color: '#0284c7' }}>
                    <span>Paid to Date ({paymentMethod}):</span>
                    <span>${paidAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 800, color: balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
                    <span>Balance Remaining:</span>
                    <span>${balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                All repairs guaranteed for 12 months or 20,000 km. Thank you for your business at AutoPulse Motors!
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ background: '#0284c7', color: 'white' }}
                >
                  <Printer size={16} />
                  <span>Send to System Printer</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Bill Editor Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Row 1: Quick Financial KPI Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Labor Charges
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    ${effectiveLaborTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {laborHours} hrs @ ${hourlyRate}/hr
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Parts &amp; Materials
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                    ${calculatedPartsTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {parts.length} line items
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total (Tax Inc.)
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginTop: '4px' }}>
                    ${grandTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Includes ${taxAmount.toFixed(2)} tax
                  </div>
                </div>

                <div style={{
                  background: balanceDue > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${balanceDue > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: balanceDue > 0 ? '#f87171' : '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
                    Balance Outstanding
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: balanceDue > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
                    ${balanceDue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Paid: ${paidAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Row 2: Labor Rates & Billing Configuration */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-card)',
                borderRadius: '18px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} color="var(--accent-cyan)" />
                  <span>Labor Hours &amp; Shop Rates</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Billed Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={laborHours}
                      onChange={(e) => handleLaborHoursChange(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Hourly Shop Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Total Labor Subtotal ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={laborCost}
                      onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'var(--accent-cyan)',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Allocated Parts Table & Quick Add */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-card)',
                borderRadius: '18px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={16} color="var(--accent-amber)" />
                    <span>Allocated Parts &amp; Consumables ({parts.length})</span>
                  </div>

                  <button
                    onClick={() => setIsAddingPart(!isAddingPart)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                {isAddingPart && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}>
                    <input
                      type="text"
                      placeholder="Part description or name..."
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      style={{
                        flex: 2,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '13px',
                      }}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(parseInt(e.target.value) || 1)}
                      style={{
                        width: '70px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '13px',
                      }}
                    />
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Price ($)"
                      value={newPartPrice}
                      onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      onClick={handleAddPart}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      Add
                    </button>
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-card)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>Description</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '80px' }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', width: '100px' }}>Unit ($)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', width: '110px' }}>Total ($)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '10px 12px', color: 'white', fontWeight: 600 }}>{p.partName}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <input
                              type="number"
                              min="1"
                              value={p.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const updated = [...parts];
                                updated[idx].quantity = val;
                                setParts(updated);
                              }}
                              style={{
                                width: '55px',
                                textAlign: 'center',
                                padding: '4px',
                                borderRadius: '6px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-card)',
                                color: 'white',
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <input
                              type="number"
                              step="0.5"
                              value={p.unitPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...parts];
                                updated[idx].unitPrice = val;
                                setParts(updated);
                              }}
                              style={{
                                width: '75px',
                                textAlign: 'right',
                                padding: '4px',
                                borderRadius: '6px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-card)',
                                color: 'white',
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-amber)', fontWeight: 700 }}>
                            ${(p.quantity * p.unitPrice).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemovePart(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 4: Payment Details, Status & Discounts */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-card)',
                borderRadius: '18px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} color="var(--accent-emerald)" />
                  <span>Invoice Status, Discounts &amp; Payment Collection</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Payment Status
                    </label>
                    <select
                      value={billingStatus}
                      onChange={(e) => setBillingStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '13px',
                      }}
                    >
                      <option value="PENDING">PENDING (Unbilled)</option>
                      <option value="INVOICED">INVOICED (Sent to Customer)</option>
                      <option value="PARTIAL">PARTIAL (Deposit Received)</option>
                      <option value="PAID">PAID (Full Settlement)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: 'white',
                        fontSize: '13px',
                      }}
                    >
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Cash">Cash in Hand</option>
                      <option value="Fleet Account">Fleet Corporate Account</option>
                      <option value="Bank Transfer">Direct Wire / EFT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Discount Applied ($)
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        color: '#f87171',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Amount Collected / Paid ($)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-card)',
                          color: '#34d399',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      />
                      <button
                        onClick={() => setPaidAmount(grandTotal)}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '8px 10px', whiteSpace: 'nowrap' }}
                        title="Mark fully settled"
                      >
                        All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.95)',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            * Updates will instantly propagate to all bay tablets and mobile apps over Wi-Fi.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveBill} className="btn-primary">
              <CheckCircle2 size={16} />
              <span>Save &amp; Sync Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
