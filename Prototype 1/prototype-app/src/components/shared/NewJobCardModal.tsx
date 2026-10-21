import React, { useState } from 'react';
import { X, Wrench, CheckCircle } from 'lucide-react';
import { Employee, JobCard } from '../../types';

interface NewJobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  activeBranchId: string;
  onCreateJob: (job: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>) => void;
}

export const NewJobCardModal: React.FC<NewJobCardModalProps> = ({
  isOpen,
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
  const [assignedBay, setAssignedBay] = useState('Bay 1 (2-Post Lift)');
  const [estimatedLaborCost, setEstimatedLaborCost] = useState(150);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !vehicleModel || !vehiclePlate) return;

    const assignedTech = employees.find((e) => e.id === assignedTechId);

    onCreateJob({
      customerName,
      customerPhone: customerPhone || '+1 (555) 000-0000',
      vehicleModel,
      vehiclePlate,
      vin: vin || `1HGCR2F8${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'INTAKE',
      primaryComplaint: primaryComplaint || 'General multi-point inspection & diagnostic review.',
      assignedTechId: assignedTech?.id,
      assignedTechName: assignedTech?.name,
      assignedBay,
      estimatedLaborCost: Number(estimatedLaborCost),
      partsCost: 0,
      totalCost: Number(estimatedLaborCost),
      branchId: activeBranchId,
      damagePoints: [],
      allocatedParts: [],
    });

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Create Vehicle Intake Job Card</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Liam Anderson"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2831"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Vehicle info */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Make / Model *</label>
              <input
                required
                type="text"
                placeholder="e.g. 2023 Honda CR-V AWD"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>License Plate *</label>
              <input
                required
                type="text"
                placeholder="e.g. 5XYZ91"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                }}
              />
            </div>
          </div>

          {/* VIN */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VIN Number (17 digits or Auto-generated)</label>
            <input
              type="text"
              placeholder="e.g. 1HGCR2F84HA019283"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'white',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Customer Complaint */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Primary Customer Complaint / Service Request</label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, warning lights, brake noise, or scheduled maintenance requested..."
              value={primaryComplaint}
              onChange={(e) => setPrimaryComplaint(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'white',
                fontSize: '13px',
                resize: 'none',
              }}
            />
          </div>

          {/* Technician & Bay Assignment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Assign Technician</label>
              <select
                value={assignedTechId}
                onChange={(e) => setAssignedTechId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                <option value="">-- Auto-dispatch later --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Repair Bay</label>
              <select
                value={assignedBay}
                onChange={(e) => setAssignedBay(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                <option value="Bay 1 (2-Post Lift)">Bay 1 (2-Post Lift)</option>
                <option value="Bay 2 (Quick Lube Pit)">Bay 2 (Quick Lube Pit)</option>
                <option value="Bay 3 (ECU Diagnostic Lab)">Bay 3 (ECU Diagnostic Lab)</option>
                <option value="Bay 4 (Alignment Rack)">Bay 4 (Alignment Rack)</option>
              </select>
            </div>
          </div>

          {/* Estimated Labor Cost */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Initial Estimated Labor ($)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={estimatedLaborCost}
              onChange={(e) => setEstimatedLaborCost(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'white',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              <CheckCircle size={16} /> Open Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
