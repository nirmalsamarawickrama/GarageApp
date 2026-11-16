import { UserRole, Permission, User } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'job:view',
    'job:create_intake',
    'job:advance_status',
    'job:assign_tech',
    'job:perform_dvi',
    'job:view_costs',
    'inventory:view',
    'inventory:scan_barcode',
    'inventory:adjust_stock',
    'inventory:transfer_branch',
    'inventory:create_po',
    'employee:view',
    'employee:clock_self',
    'employee:manage_roster',
    'employee:view_rates',
    'finance:view_kpis',
    'finance:view_margins',
    'finance:manage_invoices',
    'finance:send_reminders',
    'finance:export_tax',
    'system:view_outbox',
    'system:force_sync',
    'system:manage_users',
    'system:device_audit',
    'system:switch_all_branches',
  ],

  MANAGER: [
    'job:view',
    'job:create_intake',
    'job:advance_status',
    'job:assign_tech',
    'job:perform_dvi',
    'job:view_costs',
    'inventory:view',
    'inventory:scan_barcode',
    'inventory:adjust_stock',
    'inventory:transfer_branch',
    'inventory:create_po',
    'employee:view',
    'employee:clock_self',
    'employee:manage_roster',
    'finance:view_kpis',
    'finance:manage_invoices',
    'finance:send_reminders',
    'system:view_outbox',
    'system:force_sync',
  ],

  MECHANIC: [
    'job:view',
    'job:advance_status',
    'job:perform_dvi',
    'inventory:view',
    'inventory:scan_barcode',
    'employee:view',
    'employee:clock_self',
  ],

  ACCOUNTANT: [
    'job:view',
    'job:view_costs',
    'inventory:view',
    'inventory:adjust_stock',
    'inventory:create_po',
    'employee:view_rates',
    'finance:view_kpis',
    'finance:view_margins',
    'finance:manage_invoices',
    'finance:send_reminders',
    'finance:export_tax',
    'system:switch_all_branches',
  ],

  IT_ADMIN: [
    'job:view',
    'inventory:view',
    'inventory:adjust_stock',
    'inventory:transfer_branch',
    'employee:view',
    'system:view_outbox',
    'system:force_sync',
    'system:manage_users',
    'system:device_audit',
    'system:switch_all_branches',
  ],
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
}

export const ROLE_METADATA: Record<
  UserRole,
  {
    label: string;
    shortLabel: string;
    badgeColor: string;
    badgeBg: string;
    borderColor: string;
    description: string;
  }
> = {
  OWNER: {
    label: 'Garage Owner',
    shortLabel: 'OWNER',
    badgeColor: 'var(--ink-on-accent)',
    badgeBg: 'var(--accent-volt)',
    borderColor: 'var(--accent-volt)',
    description: 'Multi-branch executive control, global margins, business administration.',
  },
  MANAGER: {
    label: 'Workshop Manager',
    shortLabel: 'MGR',
    badgeColor: 'var(--accent-primary)',
    badgeBg: 'var(--accent-primary-tint)',
    borderColor: 'var(--accent-primary)',
    description: 'Bay stationing, vehicle intake triage, parts catalog & daily operations.',
  },
  MECHANIC: {
    label: 'Bay Technician',
    shortLabel: 'MECH',
    badgeColor: 'var(--accent-secondary)',
    badgeBg: 'var(--accent-secondary-tint)',
    borderColor: 'var(--accent-secondary)',
    description: 'Fast shop-floor workflow: active jobs, 360° DVI inspection, barcode deductions.',
  },
  ACCOUNTANT: {
    label: 'Financial Auditor',
    shortLabel: 'ACCT',
    badgeColor: 'var(--accent-violet)',
    badgeBg: 'var(--accent-violet-tint)',
    borderColor: 'var(--accent-violet)',
    description: 'Accounts receivable, gross margins, invoicing, tax audit exports.',
  },
  IT_ADMIN: {
    label: 'IT Systems Admin',
    shortLabel: 'IT',
    badgeColor: 'var(--accent-danger)',
    badgeBg: 'var(--accent-danger-tint)',
    borderColor: 'var(--accent-danger)',
    description: 'Device sync telemetry, Room DB outbox audit, staff credentials & security.',
  },
};
