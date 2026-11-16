import { AppModule, User } from '../types';
import { hasPermission } from '../auth/permissions';

export const APP_MODULES: AppModule[] = [
  {
    id: 'jobs',
    title: 'Work Progress',
    iconName: 'Wrench',
    requiredPermission: 'job:view',
    order: 10,
    badgeCount: (state) => {
      const jobs = state?.jobs || [];
      return jobs.filter((j) => j.status !== 'READY_DELIVERY').length;
    },
  },
  {
    id: 'inventory',
    title: 'Inventory',
    iconName: 'Boxes',
    requiredPermission: 'inventory:view',
    order: 20,
    badgeCount: (state) => {
      const inventory = state?.inventory || [];
      return inventory.filter((i) => i.stockQty <= i.minSafetyStock).length;
    },
  },
  {
    id: 'employees',
    title: 'Staff & Bays',
    iconName: 'Users',
    requiredPermission: 'employee:view',
    order: 30,
  },
  {
    id: 'sales',
    title: 'Financials',
    iconName: 'DollarSign',
    requiredPermission: 'finance:view_kpis',
    order: 40,
  },
  {
    id: 'admin',
    title: 'IT & System',
    iconName: 'ShieldCheck',
    requiredPermission: 'system:view_outbox',
    order: 50,
    badgeCount: (state) => {
      const outbox = state?.outbox || [];
      return outbox.length;
    },
  },
];

export function getAccessibleModules(user: User | null): AppModule[] {
  if (!user) return [];
  return APP_MODULES.filter((module) =>
    hasPermission(user, module.requiredPermission)
  ).sort((a, b) => a.order - b.order);
}
