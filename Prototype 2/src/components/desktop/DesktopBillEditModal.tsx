import React, { useState } from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  CreditCard,
} from 'lucide-react';
import { JobCard, AllocatedPartLine } from '../../types';
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

const DesktopBillEditModalContent: React.FC<
  DesktopBillEditModalProps & { job: JobCard }
> = ({ onClose, job, onSaved }) => {
  const [laborCost, setLaborCost] = useState<number>(job.estimatedLaborCost || 0);
  const [laborHours, setLaborHours] = useState<number>(
    Math.max(1, Math.round((job.estimatedLaborCost || 120) / 95))
  );
  const [hourlyRate, setHourlyRate] = useState<number>(95);
  const [billingStatus, setBillingStatus] = useState<NonNullable<JobCard['billingStatus']>>(
    job.billingStatus || 'INVOICED'
  );
  const [paymentMethod, setPaymentMethod] = useState<NonNullable<JobCard['paymentMethod']>>(
    job.paymentMethod || 'Card'
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    job.paidAmount || (job.billingStatus === 'PAID' ? job.totalCost : 0)
  );
  const [discountAmount, setDiscountAmount] = useState<number>(job.discountAmount || 0);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    job.invoiceNumber || `INV-2026-${job.jobNumber.slice(-4)}`
  );

  const [parts, setParts] = useState<AllocatedPartLine[]>(
    job.allocatedParts && job.allocatedParts.length > 0
      ? [...job.allocatedParts]
      : [
          {
            partId: 'inv-1',
            partName: 'Standard Service Consumables & Fluids',
            quantity: 1,
            unitPrice: job.partsCost || 45.0,
          },
        ]
  );

  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(25);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const calculatedPartsTotal = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const effectiveLaborTotal = laborCost;
  const subtotal = Math.max(0, effectiveLaborTotal + calculatedPartsTotal - discountAmount);
  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
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
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Work Order Bill Manager">
      <div className="sg-modal" style={{ maxWidth: '880px' }}>
        <div className="sg-modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
                  {showPrintPreview ? 'Official Invoice & Tax Receipt' : 'Work Order Bill & Invoicing Manager'}
                </h2>
                <span className="sg-badge sg-badge-volt tabular">{invoiceNumber}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {job.jobNumber} &bull; {job.customerName} ({job.vehicleModel} &middot; {job.vehiclePlate})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className="sg-btn sg-btn-secondary sg-btn-sm"
            >
              <Printer size={14} />
              <span>{showPrintPreview ? 'Back to Editor' : 'Print Preview'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sg-btn sg-btn-secondary sg-btn-sm"
              aria-label="Close bill editor"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="sg-modal-body">
          {showPrintPreview ? (
            <div
              id="invoice-print-sheet"
              style={{
                background: '#FFFFFF',
                color: '#111317',
                padding: '32px',
                border: '2px solid #111317',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #111317',
                  paddingBottom: '18px',
                }}
              >
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 700 }}>AUTOPULSE MOTORS &amp; FLEET</h1>
                  <p style={{ fontSize: '12px', color: '#4B515B', marginTop: '4px' }}>
                    1024 Industrial Pkwy, Sector 4 &bull; Downtown Metro
                    <br />
                    Direct Phone: +1 (555) 234-8901 &bull; Tax ID: AP-89214-TX
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#CC2914' }}>
                    TAX INVOICE
                  </div>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                    #{invoiceNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4B515B' }}>
                    Date: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '2026-10-15'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  margin: '20px 0',
                  padding: '14px',
                  background: '#F4F4F0',
                  border: '1px solid #111317',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: '#4B515B', textTransform: 'uppercase' }}>
                    Customer Information
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>{job.customerName}</div>
                  <div style={{ fontSize: '13px' }}>Phone: {job.customerPhone}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4B515B', marginTop: '4px' }}>
                    Job Card: {job.jobNumber}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: '#4B515B', textTransform: 'uppercase' }}>
                    Vehicle Information
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>{job.vehicleModel}</div>
                  <div style={{ fontSize: '13px' }}>
                    Plate: <strong>{job.vehiclePlate}</strong> &bull; VIN: {job.vin}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4B515B', marginTop: '4px' }}>
                    Assigned Tech: {job.assignedTechName || 'Shop Master'}
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#111317', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Item / Service Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty / Hrs</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate ($)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #C9C9C0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>Mechanical Labor &amp; Diagnostic Bay Service</strong>
                      <div style={{ fontSize: '11px', color: '#4B515B' }}>Primary Complaint: {job.primaryComplaint}</div>
                    </td>
                    <td className="tabular" style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {laborHours} hrs
                    </td>
                    <td className="tabular" style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ${hourlyRate.toFixed(2)}
                    </td>
                    <td className="tabular" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ${effectiveLaborTotal.toFixed(2)}
                    </td>
                  </tr>

                  {parts.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #C9C9C0' }}>
                      <td style={{ padding: '10px 12px' }}>{p.partName}</td>
                      <td className="tabular" style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {p.quantity}
                      </td>
                      <td className="tabular" style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ${p.unitPrice.toFixed(2)}
                      </td>
                      <td className="tabular" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ${(p.quantity * p.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '280px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Labor Subtotal:</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${effectiveLaborTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Parts &amp; Consumables:</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${calculatedPartsTotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#0E7A53' }}>
                      <span>Loyalty Discount:</span>
                      <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Sales Tax (8%):</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderTop: '2px solid #111317',
                      borderBottom: '2px solid #111317',
                      fontSize: '16px',
                      fontWeight: 700,
                      margin: '6px 0',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${grandTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 700, color: '#0E7A53' }}>
                    <span>Paid ({paymentMethod}):</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${paidAmount.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      fontWeight: 700,
                      color: balanceDue > 0 ? '#CC2914' : '#0E7A53',
                    }}
                  >
                    <span>Balance Remaining:</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>${balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '28px',
                  paddingTop: '14px',
                  borderTop: '1px dashed #4B515B',
                  fontSize: '11px',
                  color: '#4B515B',
                  textAlign: 'center',
                }}
              >
                All repairs guaranteed for 12 months or 20,000 km. Thank you for choosing AutoPulse Motors.
              </div>

              <div className="no-print" style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
                <button type="button" onClick={() => window.print()} className="sg-btn sg-btn-primary">
                  <Printer size={16} /> Send to System Printer
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Live Financial Summary Matrix */}
              <div className="sg-kpi-4">
                <div className="sg-grid-cell" style={{ padding: '14px' }}>
                  <div className="sg-label">Labor Charges</div>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ${effectiveLaborTotal.toFixed(2)}
                  </div>
                  <div className="tabular" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {laborHours} hrs @ ${hourlyRate}/hr
                  </div>
                </div>

                <div className="sg-grid-cell" style={{ padding: '14px' }}>
                  <div className="sg-label">Parts &amp; Materials</div>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    ${calculatedPartsTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{parts.length} line items</div>
                </div>

                <div className="sg-grid-cell" style={{ padding: '14px' }}>
                  <div className="sg-label">Total (Tax Inc.)</div>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700 }}>
                    ${grandTotal.toFixed(2)}
                  </div>
                  <div className="tabular" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Includes ${taxAmount.toFixed(2)} tax
                  </div>
                </div>

                <div
                  className="sg-grid-cell"
                  style={{
                    padding: '14px',
                    background: balanceDue > 0 ? 'var(--accent-danger-tint)' : 'var(--accent-secondary-tint)',
                  }}
                >
                  <div className="sg-label">Balance Due</div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: balanceDue > 0 ? 'var(--accent-danger)' : 'var(--accent-secondary)',
                    }}
                  >
                    ${balanceDue.toFixed(2)}
                  </div>
                  <div className="tabular" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Paid: ${paidAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Labor Hours & Shop Rates */}
              <div className="sg-panel-muted" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700 }}>
                  <DollarSign size={16} color="var(--accent-primary)" />
                  <span>Labor Hours &amp; Shop Rates</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="sg-label">Billed Labor Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="sg-input sg-input-mono"
                      value={laborHours}
                      onChange={(e) => handleLaborHoursChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="sg-label">Hourly Shop Rate ($/hr)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      className="sg-input sg-input-mono"
                      value={hourlyRate}
                      onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="sg-label">Total Labor Subtotal ($)</label>
                    <input
                      type="number"
                      step="1"
                      className="sg-input sg-input-mono"
                      value={laborCost}
                      onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Allocated Parts Table */}
              <div className="sg-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Receipt size={16} color="var(--accent-amber)" />
                    <span>Allocated Parts &amp; Consumables ({parts.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingPart(!isAddingPart)}
                    className="sg-btn sg-btn-volt sg-btn-sm"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {isAddingPart && (
                  <div
                    className="sg-panel-muted"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                      padding: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <input
                      type="text"
                      className="sg-input"
                      placeholder="Part description or name..."
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      style={{ flex: '2 1 180px' }}
                    />
                    <input
                      type="number"
                      min="1"
                      className="sg-input sg-input-mono"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(parseInt(e.target.value, 10) || 1)}
                      style={{ width: '80px' }}
                    />
                    <input
                      type="number"
                      step="0.5"
                      className="sg-input sg-input-mono"
                      value={newPartPrice}
                      onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                      style={{ width: '100px' }}
                    />
                    <button type="button" onClick={handleAddPart} className="sg-btn sg-btn-primary sg-btn-sm">
                      Add
                    </button>
                  </div>
                )}

                <div className="sg-table-wrap">
                  <table className="sg-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                        <th style={{ textAlign: 'right', width: '100px' }}>Unit ($)</th>
                        <th style={{ textAlign: 'right', width: '110px' }}>Total ($)</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{p.partName}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              min="1"
                              className="sg-input sg-input-mono"
                              value={p.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                const updated = [...parts];
                                updated[idx] = { ...updated[idx], quantity: val };
                                setParts(updated);
                              }}
                              style={{ padding: '4px 6px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <input
                              type="number"
                              step="0.5"
                              className="sg-input sg-input-mono"
                              value={p.unitPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...parts];
                                updated[idx] = { ...updated[idx], unitPrice: val };
                                setParts(updated);
                              }}
                              style={{ padding: '4px 6px', textAlign: 'right' }}
                            />
                          </td>
                          <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
                            ${(p.quantity * p.unitPrice).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemovePart(idx)}
                              aria-label={`Remove ${p.partName}`}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-danger)',
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

              {/* Payment Status & Settlement */}
              <div className="sg-panel-muted" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700 }}>
                  <CreditCard size={16} color="var(--accent-secondary)" />
                  <span>Invoice Status, Discounts &amp; Payment Collection</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div>
                    <label className="sg-label">Invoice Number</label>
                    <input
                      type="text"
                      className="sg-input sg-input-mono"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="sg-label">Payment Status</label>
                    <select
                      className="sg-select"
                      value={billingStatus}
                      onChange={(e) => setBillingStatus(e.target.value as NonNullable<JobCard['billingStatus']>)}
                    >
                      <option value="PENDING">PENDING (Unbilled)</option>
                      <option value="INVOICED">INVOICED (Sent)</option>
                      <option value="PARTIAL">PARTIAL (Deposit)</option>
                      <option value="PAID">PAID (Full Settlement)</option>
                    </select>
                  </div>
                  <div>
                    <label className="sg-label">Payment Method</label>
                    <select
                      className="sg-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as NonNullable<JobCard['paymentMethod']>)}
                    >
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Cash">Cash in Hand</option>
                      <option value="Fleet Account">Fleet Corporate Account</option>
                      <option value="Bank Transfer">Direct Wire / EFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="sg-label">Discount Applied ($)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      className="sg-input sg-input-mono"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="sg-label">Amount Collected ($)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        className="sg-input sg-input-mono"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      />
                      <button
                        type="button"
                        onClick={() => setPaidAmount(grandTotal)}
                        className="sg-btn sg-btn-secondary sg-btn-sm"
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

        <div className="sg-modal-footer no-print">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            * Updates broadcast immediately to bay tablets over Wi-Fi.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="sg-btn sg-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSaveBill} className="sg-btn sg-btn-primary">
              <CheckCircle2 size={16} /> Save &amp; Sync Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
