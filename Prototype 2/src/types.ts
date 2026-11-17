export type JobStatus =
  | 'INTAKE'
  | 'DIAGNOSIS'
  | 'IN_REPAIR'
  | 'QUALITY_CHECK'
  | 'READY_DELIVERY';

export type PartCategory =
  | 'Brakes'
  | 'Fluids & Oils'
  | 'Filters'
  | 'Suspension'
  | 'Electrical'
  | 'Engine';

export interface VehicleDamagePoint {
  id: string;
  part: string;
  type: 'Scratch' | 'Dent' | 'Crack' | 'Wear';
  severity: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface AllocatedPartLine {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

export interface JobCard {
  id: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vin: string;
  status: JobStatus;
  primaryComplaint: string;
  assignedTechId?: string;
  assignedTechName?: string;
  assignedBay?: string;
  estimatedLaborCost: number;
  partsCost: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  branchId: string;
  inspectionNotes?: string;
  damagePoints?: VehicleDamagePoint[];
  allocatedParts?: AllocatedPartLine[];
  billingStatus?: 'PENDING' | 'INVOICED' | 'PAID' | 'PARTIAL';
  paidAmount?: number;
  invoiceNumber?: string;
  paymentMethod?: 'Card' | 'Cash' | 'Fleet Account' | 'Bank Transfer';
  taxAmount?: number;
  discountAmount?: number;
  version: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  oemNumber: string;
  name: string;
  category: PartCategory;
  stockQty: number;
  minSafetyStock: number;
  unitCost: number;
  retailPrice: number;
  unitOfMeasure: 'Units' | 'Liters' | 'Sets';
  branchId: string;
  barcode: string;
  lastRestocked: string;
  version: number;
}

export interface Employee {
  id: string;
  userId?: string;
  name: string;
  role:
    | 'Master Technician'
    | 'Diagnostic Specialist'
    | 'Service Advisor'
    | 'Quick Lube Tech'
    | 'Workshop Manager';
  phone: string;
  branchId: string;
  activeBay?: string;
  currentJobCardId?: string;
  status: 'Available' | 'Working on Job' | 'On Break' | 'Off Duty';
  billedHoursThisMonth: number;
  actualHoursThisMonth: number;
  efficiencyRating: number;
  completedJobsCount: number;
  avatarUrl: string;
}

export interface GarageBranch {
  id: string;
  name: string;
  city: string;
  baysCount: number;
  activeJobsCount: number;
  monthlyRevenue: number;
  phone: string;
}

export interface SyncMutation {
  id: string;
  entityType: 'JOB_CARD' | 'INVENTORY' | 'EMPLOYEE' | 'USER';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export type UserRole =
  | 'OWNER'
  | 'MANAGER'
  | 'MECHANIC'
  | 'ACCOUNTANT'
  | 'IT_ADMIN';

export type Permission =
  // Job & Repair Operations
  | 'job:view'
  | 'job:create_intake'
  | 'job:advance_status'
  | 'job:assign_tech'
  | 'job:perform_dvi'
  | 'job:view_costs'
  // Inventory & Consumables
  | 'inventory:view'
  | 'inventory:scan_barcode'
  | 'inventory:adjust_stock'
  | 'inventory:transfer_branch'
  | 'inventory:create_po'
  // Employees & Bays
  | 'employee:view'
  | 'employee:clock_self'
  | 'employee:manage_roster'
  | 'employee:view_rates'
  // Financial & Accounting
  | 'finance:view_kpis'
  | 'finance:view_margins'
  | 'finance:manage_invoices'
  | 'finance:send_reminders'
  | 'finance:export_tax'
  // System & IT Administration
  | 'system:view_outbox'
  | 'system:force_sync'
  | 'system:manage_users'
  | 'system:device_audit'
  | 'system:switch_all_branches';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  avatarUrl: string;
  username?: string;
  password?: string;
  pinCode?: string;
  phone?: string;
  jobTitle?: string;
  isCloudSynced?: boolean;
  registeredAt?: string;
}

export type MobileTab = 'jobs' | 'inventory' | 'employees' | 'sales' | 'admin';

export interface AppModule {
  id: MobileTab;
  title: string;
  iconName: string;
  requiredPermission: Permission;
  order: number;
  badgeCount?: (state: {
    jobs: JobCard[];
    inventory: InventoryItem[];
    outbox: SyncMutation[];
  }) => number;
}

export interface PinResetRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  requestedAt: string;
  status: 'PENDING' | 'PROMPTED' | 'COMPLETED';
  verificationCode?: string;
  promptedAt?: string;
  completedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: 'OK' | 'SECURITY' | 'SYNC' | 'WARN';
}

export interface PasswordResetSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  username: string;
  verificationCode: string;
  expiresAt: string;
  status: 'PENDING' | 'VERIFIED' | 'COMPLETED';
}
