/**
 * AutoPulse™ Garage Management System - Interactive UI Architecture & State
 * Designed for High-Performance Desktop & Mobile UI Showcase
 */

// Initial Seed Data
const AutoPulseData = {
  activeBranchId: 'branch-1',
  currentUser: {
    id: 'usr-1',
    name: 'Alex Vance',
    role: 'Managing Director & Owner',
    email: 'alex.vance@autopulse.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    branch: 'Apex Downtown Service Hub'
  },
  branches: [
    {
      id: 'branch-1',
      name: 'Apex Downtown Service Hub',
      city: 'Downtown Metro',
      baysCount: 8,
      activeJobsCount: 5,
      monthlyRevenue: 64200,
      phone: '+1 (555) 234-8901'
    },
    {
      id: 'branch-2',
      name: 'Apex West Airport Express',
      city: 'Westside Logistics',
      baysCount: 6,
      activeJobsCount: 3,
      monthlyRevenue: 48900,
      phone: '+1 (555) 876-5432'
    },
    {
      id: 'branch-3',
      name: 'Apex North Bay Heavy Depot',
      city: 'North Industrial Area',
      baysCount: 10,
      activeJobsCount: 4,
      monthlyRevenue: 82500,
      phone: '+1 (555) 345-6789'
    }
  ],
  employees: [
    {
      id: 'emp-1',
      name: 'Marcus Vance',
      role: 'Master Technician',
      phone: '+1 (555) 321-9870',
      branchId: 'branch-1',
      activeBay: 'Bay 1 (2-Post Lift)',
      status: 'Working on Job',
      efficiency: 118,
      hoursMonth: 142,
      jobsCompleted: 34,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'emp-2',
      name: 'Elena Rostova',
      role: 'Diagnostic Specialist',
      phone: '+1 (555) 432-1098',
      branchId: 'branch-1',
      activeBay: 'Bay 3 (ECU Lab)',
      status: 'Working on Job',
      efficiency: 110,
      hoursMonth: 138,
      jobsCompleted: 29,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'emp-3',
      name: 'David Kim',
      role: 'Quick Lube Tech',
      phone: '+1 (555) 543-2109',
      branchId: 'branch-1',
      activeBay: 'Bay 2 (Quick Lube Pit)',
      status: 'Available',
      efficiency: 97,
      hoursMonth: 145,
      jobsCompleted: 48,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'emp-4',
      name: 'Sophia Patel',
      role: 'Service Advisor',
      phone: '+1 (555) 654-3210',
      branchId: 'branch-1',
      activeBay: 'Front Service Desk',
      status: 'Available',
      efficiency: 104,
      hoursMonth: 160,
      jobsCompleted: 65,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'emp-5',
      name: 'Jake Reynolds',
      role: 'Alignment Tech',
      phone: '+1 (555) 765-4321',
      branchId: 'branch-2',
      activeBay: 'Bay 1 (Laser Alignment)',
      status: 'Working on Job',
      efficiency: 111,
      hoursMonth: 140,
      jobsCompleted: 31,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  inventory: [
    {
      id: 'inv-1',
      sku: 'BRK-CER-042',
      name: 'Ceramic Front Brake Pads (BMW 3/5 Series)',
      category: 'Brakes',
      stockQty: 8,
      minStock: 12,
      cost: 45.0,
      price: 95.0,
      unit: 'Sets',
      branchId: 'branch-1',
      barcode: '8901234567890'
    },
    {
      id: 'inv-2',
      sku: 'OIL-SYN-5W30',
      name: 'Castrol Edge 5W-30 Full Synthetic Oil',
      category: 'Fluids & Oils',
      stockQty: 145,
      minStock: 50,
      cost: 8.5,
      price: 18.0,
      unit: 'Liters',
      branchId: 'branch-1',
      barcode: '8901234567891'
    },
    {
      id: 'inv-3',
      sku: 'FLT-OIL-TYT',
      name: 'OEM Oil Filter Insert (Toyota / Lexus)',
      category: 'Filters',
      stockQty: 32,
      minStock: 15,
      cost: 4.2,
      price: 14.5,
      unit: 'Units',
      branchId: 'branch-1',
      barcode: '8901234567892'
    },
    {
      id: 'inv-4',
      sku: 'SPK-IRID-NGK',
      name: 'NGK Laser Iridium Spark Plug',
      category: 'Engine',
      stockQty: 4,
      minStock: 16,
      cost: 6.8,
      price: 19.5,
      unit: 'Units',
      branchId: 'branch-1',
      barcode: '8901234567893'
    },
    {
      id: 'inv-5',
      sku: 'ROTR-VENT-FRT',
      name: 'Bosch QuietCast Front Vented Brake Rotor',
      category: 'Brakes',
      stockQty: 10,
      minStock: 8,
      cost: 38.0,
      price: 85.0,
      unit: 'Units',
      branchId: 'branch-1',
      barcode: '8901234567894'
    },
    {
      id: 'inv-6',
      sku: 'SUSP-LNK-FRT',
      name: 'Moog Front Stabilizer Sway Bar Link',
      category: 'Suspension',
      stockQty: 14,
      minStock: 6,
      cost: 19.5,
      price: 42.0,
      unit: 'Sets',
      branchId: 'branch-2',
      barcode: '8901234567895'
    }
  ],
  jobs: [
    {
      id: 'job-101',
      jobNumber: 'AP-2026-0891',
      customer: 'Robert Vance',
      phone: '+1 (555) 789-0123',
      vehicle: '2022 BMW 330i xDrive',
      plate: '7XYZ892',
      vin: 'WBA5R1C50NFP19842',
      status: 'IN_REPAIR',
      complaint: 'High-pitched brake squeal at low speed. Requesting 40k inspection.',
      techName: 'Marcus Vance',
      bay: 'Bay 1 (2-Post Lift)',
      laborCost: 220.0,
      partsCost: 190.0,
      totalCost: 410.0,
      billingStatus: 'PENDING',
      invoiceNumber: 'INV-2026-0891',
      branchId: 'branch-1',
      damagePoints: [
        { id: 'd-1', part: 'Front Bumper', type: 'Scratch', severity: 'Low', x: 25, y: 12 },
        { id: 'd-2', part: 'Passenger Door', type: 'Dent', severity: 'Medium', x: 70, y: 54 }
      ]
    },
    {
      id: 'job-102',
      jobNumber: 'AP-2026-0892',
      customer: 'Sarah Jenkins',
      phone: '+1 (555) 890-1234',
      vehicle: '2021 Audi A4 2.0T',
      plate: '8ABC451',
      vin: 'WAUZZZF45MA091823',
      status: 'DIAGNOSIS',
      complaint: 'Check Engine light illuminated with rough idle at stoplights.',
      techName: 'Elena Rostova',
      bay: 'Bay 3 (ECU Lab)',
      laborCost: 180.0,
      partsCost: 78.0,
      totalCost: 258.0,
      billingStatus: 'UNBILLED',
      invoiceNumber: 'INV-2026-0892',
      branchId: 'branch-1',
      damagePoints: [
        { id: 'd-3', part: 'Rear Quarter', type: 'Chip', severity: 'Low', x: 82, y: 80 }
      ]
    },
    {
      id: 'job-103',
      jobNumber: 'AP-2026-0893',
      customer: 'Carlos Gomez',
      phone: '+1 (555) 901-2345',
      vehicle: '2020 Toyota Tacoma TRD 4x4',
      plate: '5KMN109',
      vin: '3TMCZ5AN1LM039481',
      status: 'INTAKE',
      complaint: 'Synthetic oil service + multipoint safety check before road trip.',
      techName: 'David Kim',
      bay: 'Bay 2 (Quick Lube Pit)',
      laborCost: 65.0,
      partsCost: 48.0,
      totalCost: 113.0,
      billingStatus: 'UNBILLED',
      invoiceNumber: 'INV-2026-0893',
      branchId: 'branch-1',
      damagePoints: []
    },
    {
      id: 'job-104',
      jobNumber: 'AP-2026-0894',
      customer: 'Michael Chang',
      phone: '+1 (555) 012-3456',
      vehicle: '2023 Tesla Model Y',
      plate: '9ELC801',
      vin: '7SAYGDEE1PF918234',
      status: 'QUALITY_CHECK',
      complaint: 'Wheel alignment and front suspension rattle over road dips.',
      techName: 'Elena Rostova',
      bay: 'Bay 4 (EV Clean Bay)',
      laborCost: 240.0,
      partsCost: 110.0,
      totalCost: 350.0,
      billingStatus: 'READY_TO_INVOICE',
      invoiceNumber: 'INV-2026-0894',
      branchId: 'branch-1',
      damagePoints: [
        { id: 'd-4', part: 'Alloy Wheel Rim', type: 'Curb Rash', severity: 'Medium', x: 22, y: 76 }
      ]
    },
    {
      id: 'job-105',
      jobNumber: 'AP-2026-0895',
      customer: 'Jennifer Adams',
      phone: '+1 (555) 123-4567',
      vehicle: '2019 Porsche Macan GTS',
      plate: '6POR990',
      vin: 'WP1AA2AY5KLB10928',
      status: 'READY',
      complaint: '60,000-mile major service and transmission fluid flush.',
      techName: 'Marcus Vance',
      bay: 'Bay 1 (2-Post Lift)',
      laborCost: 450.0,
      partsCost: 395.0,
      totalCost: 845.0,
      billingStatus: 'PAID',
      invoiceNumber: 'INV-2026-0895',
      branchId: 'branch-1',
      damagePoints: []
    }
  ],
  outbox: [
    { id: 'ob-1', action: 'STOCK_DEDUCT', entity: 'BRK-CER-042', timestamp: '2 mins ago', status: 'SYNCHRONIZED' },
    { id: 'ob-2', action: 'STATUS_ADVANCE', entity: 'AP-2026-0891', timestamp: '5 mins ago', status: 'SYNCHRONIZED' }
  ],
  isOnline: true
};

// Helper Formatters
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// Status Badges Generator
function getStatusBadge(status) {
  switch (status) {
    case 'INTAKE':
      return `<span class="badge-status badge-intake"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Vehicle Intake</span>`;
    case 'DIAGNOSIS':
      return `<span class="badge-status badge-diagnosis"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Diagnostic Bay</span>`;
    case 'IN_REPAIR':
      return `<span class="badge-status badge-repair"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Active Repair</span>`;
    case 'QUALITY_CHECK':
      return `<span class="badge-status badge-qc"><span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Quality Check</span>`;
    case 'READY':
      return `<span class="badge-status badge-ready"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Work Completed</span>`;
    default:
      return `<span class="badge-status badge-intake">${status}</span>`;
  }
}

// Global UI Controller
window.AutoPulseApp = {
  data: AutoPulseData,

  initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Toggle Branch Filter
  setBranch(branchId) {
    this.data.activeBranchId = branchId;
    const branch = this.data.branches.find(b => b.id === branchId);
    document.querySelectorAll('.active-branch-label').forEach(el => el.textContent = branch ? branch.name : 'All Garages');
    if (typeof this.renderDesktopKanban === 'function') this.renderDesktopKanban();
    if (typeof this.renderMobileJobs === 'function') this.renderMobileJobs();
    if (typeof this.renderInventoryTable === 'function') this.renderInventoryTable();
    this.showToast(`Switched active branch to ${branch ? branch.name : 'All'}`);
  },

  // Advance Job Status
  advanceJobStatus(jobId) {
    const job = this.data.jobs.find(j => j.id === jobId);
    if (!job) return;
    const sequence = ['INTAKE', 'DIAGNOSIS', 'IN_REPAIR', 'QUALITY_CHECK', 'READY'];
    const curIdx = sequence.indexOf(job.status);
    if (curIdx < sequence.length - 1) {
      job.status = sequence[curIdx + 1];
      this.showToast(`Job ${job.jobNumber} moved to ${job.status.replace('_', ' ')}`);
      if (typeof this.renderDesktopKanban === 'function') this.renderDesktopKanban();
      if (typeof this.renderMobileJobs === 'function') this.renderMobileJobs();
      if (typeof this.updateDesktopKPIs === 'function') this.updateDesktopKPIs();
    }
  },

  // Quick Stock Update
  updateStock(itemId, delta) {
    const item = this.data.inventory.find(i => i.id === itemId);
    if (!item) return;
    item.stockQty = Math.max(0, item.stockQty + delta);
    this.showToast(`${delta > 0 ? 'Restocked' : 'Deducted'} ${item.name}: ${item.stockQty} ${item.unit} remaining`);
    if (typeof this.renderInventoryTable === 'function') this.renderInventoryTable();
    if (typeof this.renderMobileInventory === 'function') this.renderMobileInventory();
  },

  // Toggle Employee Clock
  toggleEmployeeClock(empId) {
    const emp = this.data.employees.find(e => e.id === empId);
    if (!emp) return;
    if (emp.status === 'Working on Job' || emp.status === 'Available') {
      emp.status = 'Clocked Out';
    } else {
      emp.status = 'Available';
    }
    this.showToast(`${emp.name} is now ${emp.status}`);
    if (typeof this.renderStaffTable === 'function') this.renderStaffTable();
    if (typeof this.renderMobileStaff === 'function') this.renderMobileStaff();
  },

  // Toast Notification
  showToast(message) {
    let toast = document.getElementById('autopulse-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'autopulse-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-slate-100 text-sm font-medium shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
      <span>${message}</span>
    `;
    toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
    }, 2800);
  },

  // Modal Controllers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      this.initIcons();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  // Quick Open Vehicle Inspection Modal
  openInspection(jobId) {
    const job = this.data.jobs.find(j => j.id === jobId);
    if (!job) return;
    const inspectTitle = document.getElementById('inspect-modal-title');
    const inspectSub = document.getElementById('inspect-modal-subtitle');
    if (inspectTitle) inspectTitle.textContent = `DVI 360° Inspection - ${job.vehicle}`;
    if (inspectSub) inspectSub.textContent = `Job #${job.jobNumber} | VIN: ${job.vin} | Assigned to ${job.techName}`;
    this.openModal('vehicleInspectionModal');
  },

  // Quick Open Invoice Print Preview
  openInvoiceModal(jobId) {
    const job = this.data.jobs.find(j => j.id === jobId) || this.data.jobs[0];
    const elInvNum = document.getElementById('inv-preview-number');
    const elInvCust = document.getElementById('inv-preview-cust');
    const elInvVeh = document.getElementById('inv-preview-veh');
    const elInvLabor = document.getElementById('inv-preview-labor');
    const elInvParts = document.getElementById('inv-preview-parts');
    const elInvTotal = document.getElementById('inv-preview-total');
    if (elInvNum) elInvNum.textContent = job.invoiceNumber || 'INV-2026-0891';
    if (elInvCust) elInvCust.textContent = job.customer;
    if (elInvVeh) elInvVeh.textContent = `${job.vehicle} (${job.plate})`;
    if (elInvLabor) elInvLabor.textContent = formatCurrency(job.laborCost);
    if (elInvParts) elInvParts.textContent = formatCurrency(job.partsCost);
    if (elInvTotal) elInvTotal.textContent = formatCurrency(job.totalCost);
    this.openModal('invoiceDetailsModal');
  }
};
