import React, { useState } from 'react';
import { X, Wrench, CheckCircle } from 'lucide-react';
import { Employee, JobCard } from '../../types';
import { WORKSHOP_BAYS } from '../../data/mockData';

interface NewJobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  activeBranchId: string;
  onCreateJob: (
    job: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>
  ) => void;
}

function generateFallbackVin(): string {
  return `1HGCR2F8${Math.floor(100000000 + Math.random() * 900000000)}`;
}

export const NewJobCardModal: React.FC<NewJobCardModalProps> = ({
  isOpen,
  onClose,
  employees,
  activeBranchId,
  onCreateJob,
}) => {
  if (!isOpen) return null;
  return (
    <NewJobCardModalContent
      key={activeBranchId}
      onClose={onClose}
      employees={employees}
      activeBranchId={activeBranchId}
      onCreateJob={onCreateJob}
    />
  );
};

const NewJobCardModalContent: React.FC<Omit<NewJobCardModalProps, 'isOpen'>> = ({
  onClose,
  employees,
  activeBranchId,
  onCreateJob,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vin, setVin] = useState('');
  const [primaryComplaint, setPrimaryComplaint] = useState('');
  const [assignedTechId, setAssignedTechId] = useState('');
  const [assignedBay, setAssignedBay] = useState<string>(WORKSHOP_BAYS[0].name);
  const [estimatedLaborCost, setEstimatedLaborCost] = useState(150);

  const branchEmployees = employees.filter((emp) => emp.branchId === activeBranchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !vehicleModel.trim() || !vehiclePlate.trim()) return;

    const assignedTech = branchEmployees.find((emp) => emp.id === assignedTechId);
    const labor = Math.max(0, Number(estimatedLaborCost) || 0);
    const taxAmount = Math.round(labor * 0.08 * 100) / 100;
    const totalCost = Math.round((labor + taxAmount) * 100) / 100;

    onCreateJob({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+1 (555) 000-0000',
      vehicleModel: vehicleModel.trim(),
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vin: vin.trim() || generateFallbackVin(),
      status: 'INTAKE',
      primaryComplaint:
        primaryComplaint.trim() || 'General multi-point inspection & diagnostic review.',
      assignedTechId: assignedTech?.id,
      assignedTechName: assignedTech?.name,
      assignedBay,
      estimatedLaborCost: labor,
      partsCost: 0,
      totalCost,
      branchId: activeBranchId,
      damagePoints: [],
      allocatedParts: [],
      billingStatus: 'PENDING',
      taxAmount,
      discountAmount: 0,
    });

    onClose();
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create Vehicle Intake Job Card">
      <div className="sg-modal" style={{ maxWidth: '540px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Create Vehicle Intake Job Card</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                FORM // INTAKE-01 &bull; STAGE: INTAKE
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="sg-label">Customer Name *</label>
              <input
                required
                type="text"
                className="sg-input"
                placeholder="e.g. Liam Anderson"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="sg-label">Phone Number</label>
              <input
                type="tel"
                className="sg-input sg-input-mono"
                placeholder="+1 (555) 019-2831"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="sg-label">Vehicle Make / Model *</label>
              <input
                required
                type="text"
                className="sg-input"
                placeholder="e.g. 2023 Honda CR-V AWD"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
              />
            </div>
            <div>
              <label className="sg-label">License Plate *</label>
              <input
                required
                type="text"
                className="sg-input sg-input-mono"
                placeholder="5XYZ91"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div>
            <label className="sg-label">VIN Number (17 digits or Auto-generated)</label>
            <input
              type="text"
              className="sg-input sg-input-mono"
              placeholder="e.g. 1HGCR2F84HA019283"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="sg-label">Primary Customer Complaint / Service Request</label>
            <textarea
              rows={3}
              className="sg-textarea"
              placeholder="Describe symptoms, warning lights, brake noise, or scheduled maintenance..."
              value={primaryComplaint}
              onChange={(e) => setPrimaryComplaint(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="sg-label">Assign Technician</label>
              <select
                className="sg-select"
                value={assignedTechId}
                onChange={(e) => setAssignedTechId(e.target.value)}
              >
                <option value="">-- Auto-dispatch later --</option>
                {branchEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="sg-label">Repair Bay</label>
              <select
                className="sg-select"
                value={assignedBay}
                onChange={(e) => setAssignedBay(e.target.value)}
              >
                {WORKSHOP_BAYS.map((bay) => (
                  <option key={bay.id} value={bay.name}>
                    {bay.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="sg-label">Initial Estimated Labor ($)</label>
            <input
              type="number"
              min="0"
              step="10"
              className="sg-input sg-input-mono"
              value={estimatedLaborCost}
              onChange={(e) => setEstimatedLaborCost(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="sg-btn sg-btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="sg-btn sg-btn-primary" style={{ flex: 1 }}>
              <CheckCircle size={16} /> Open Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
