import React, { useState } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Receipt,
  Users,
  Package,
  ShieldCheck,
  Plus,
  Radio,
  ChevronDown,
  LogOut,
  CloudUpload,
  Wifi,
  WifiOff,
  Smartphone,
} from 'lucide-react';
import {
  JobCard,
  Employee,
  InventoryItem,
  GarageBranch,
  User,
  JobStatus,
  SyncMutation,
  Permission,
} from '../../types';
import { ROLE_METADATA, hasPermission, hasAnyPermission } from '../../auth/permissions';
import { DesktopAnalyticsView } from './DesktopAnalyticsView';
import { DesktopKanbanView } from './DesktopKanbanView';
import { DesktopBillingView } from './DesktopBillingView';
import { DesktopStaffView } from './DesktopStaffView';
import { DesktopInventoryView } from './DesktopInventoryView';
import { SystemAdminView } from '../mobile/SystemAdminView';
import { WifiDevSyncModal } from '../shared/WifiDevSyncModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { NewJobCardModal } from '../shared/NewJobCardModal';
import { VehicleInspectionModal } from '../shared/VehicleInspectionModal';
import { BarcodeScannerModal } from '../shared/BarcodeScannerModal';
import { OutboxSyncDrawer } from '../shared/OutboxSyncDrawer';
import { AvatarBadge } from '../shared/AvatarBadge';
import { syncEngine } from '../../state/syncEngine';
import { authEngine } from '../../auth/authEngine';

export type DesktopNavTab =
  | 'overview'
  | 'kanban'
  | 'billing'
  | 'staff'
  | 'inventory'
  | 'system';

interface DesktopDashboardLayoutProps {
  currentUser: User;
  branches: GarageBranch[];
  activeBranchId: string;
  onSelectBranch: (id: string) => void;
  jobs: JobCard[];
  allJobs?: JobCard[];
  employees: Employee[];
  inventory: InventoryItem[];
  outbox: SyncMutation[];
  isOnline: boolean;
  onToggleNetwork: () => void;
  onAdvanceJobStatus: (jobId: string, nextStatus: JobStatus) => void;
  onCreateJob: (jobData: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => boolean;
  onToggleClock: (empId: string) => void;
  onSwitchToBayTerminal?: () => void;
}

export const DesktopDashboardLayout: React.FC<DesktopDashboardLayoutProps> = ({
  currentUser,
  branches,
  activeBranchId,
  onSelectBranch,
  jobs,
  allJobs,
  employees,
  inventory,
  outbox,
  isOnline,
  onToggleNetwork,
  onAdvanceJobStatus,
  onCreateJob,
  onUpdateStock,
  onTransferStock,
  onToggleClock,
  onSwitchToBayTerminal,
}) => {
  const [activeTab, setActiveTab] = useState<DesktopNavTab>('overview');
  const [isWifiSyncOpen, setIsWifiSyncOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [inspectionJobId, setInspectionJobId] = useState<string | null>(null);

  const selectedJobForInspection = inspectionJobId
    ? jobs.find((j) => j.id === inspectionJobId) || null
    : null;

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const roleMeta = ROLE_METADATA[currentUser.role];
  const relayInfo = syncEngine.getWifiRelayInfo();

  // RBAC capabilities
  const canSwitchBranches = hasPermission(currentUser, 'system:switch_all_branches');
  const canViewOutbox = hasPermission(currentUser, 'system:view_outbox');
  const canForceSync = hasPermission(currentUser, 'system:force_sync');
  const canCreateIntake = hasPermission(currentUser, 'job:create_intake');
  const canAdvanceStatus = hasPermission(currentUser, 'job:advance_status');
  const canPerformDvi = hasPermission(currentUser, 'job:perform_dvi');
  const canManageInvoices = hasPermission(currentUser, 'finance:manage_invoices');
  const canManageRoster = hasPermission(currentUser, 'employee:manage_roster');
  const canClockSelf = hasPermission(currentUser, 'employee:clock_self');
  const canAdjustStock = hasPermission(currentUser, 'inventory:adjust_stock');
  const canTransferStock = hasPermission(currentUser, 'inventory:transfer_branch');
  const canScanBarcode = hasPermission(currentUser, 'inventory:scan_barcode');

  const handleSaveInspection = (points: Parameters<typeof syncEngine.saveInspectionPoints>[1]) => {
    if (selectedJobForInspection && canPerformDvi) {
      syncEngine.saveInspectionPoints(selectedJobForInspection.id, points);
      setInspectionJobId(null);
    }
  };

  const handleScannedItem = (
    item: InventoryItem,
    action: 'INSPECT' | 'DEDUCT' | 'RESTOCK'
  ) => {
    if (action === 'DEDUCT' && (canAdjustStock || canScanBarcode)) {
      syncEngine.updateInventoryStock(item.id, -1);
    } else if (action === 'RESTOCK' && canAdjustStock) {
      syncEngine.updateInventoryStock(item.id, 5);
    }
  };

  const allNavItems: {
    id: DesktopNavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    requiredPermissions: Permission[];
    badge?: number;
  }[] = [
    {
      id: 'overview',
      label: 'Executive Analytics',
      icon: LayoutDashboard,
      requiredPermissions: ['finance:view_kpis'],
    },
    {
      id: 'kanban',
      label: 'Repair Pipeline (Kanban)',
      icon: Kanban,
      requiredPermissions: ['job:view'],
      badge: jobs.length,
    },
    {
      id: 'billing',
      label: 'Bills & Invoicing',
      icon: Receipt,
      requiredPermissions: ['finance:manage_invoices', 'finance:view_kpis'],
    },
    {
      id: 'staff',
      label: 'Staff & Bay Operations',
      icon: Users,
      requiredPermissions: ['employee:view', 'employee:view_rates'],
      badge: employees.filter((e) => e.status === 'Working on Job').length,
    },
    {
      id: 'inventory',
      label: 'Parts & Warehouse',
      icon: Package,
      requiredPermissions: ['inventory:view'],
      badge: inventory.filter((i) => i.stockQty <= i.minSafetyStock).length || undefined,
    },
    {
      id: 'system',
      label: 'IT Security & Sync Relay',
      icon: ShieldCheck,
      requiredPermissions: ['system:view_outbox', 'system:manage_users'],
      badge: outbox.length || undefined,
    },
  ];

  const navItems = allNavItems.filter((item) =>
    hasAnyPermission(currentUser, item.requiredPermissions)
  );
  const currentTab: DesktopNavTab = navItems.some((item) => item.id === activeTab)
    ? activeTab
    : navItems[0]?.id ?? 'kanban';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* LEFT NAVIGATION RAIL */}
      <aside
        style={{
          width: '272px',
          background: 'var(--bg-surface)',
          borderRight: '2px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div>
          <div className="sg-hazard-strip" />
          {/* Brand Header */}
          <div
            style={{
              padding: '18px 18px',
              borderBottom: '2px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-control)',
                background: 'var(--accent-primary)',
                color: 'var(--ink-on-accent)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              AP
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  AutoPulse
                </span>
                <span className="sg-badge sg-badge-volt" style={{ padding: '1px 5px', fontSize: '9px' }}>
                  BAY OS
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span className={`sg-led ${isOnline ? 'sg-led-live' : 'sg-led-fault'}`} />
                <span>{isOnline ? 'MESH ONLINE' : 'OFFLINE BUFFER'}</span>
              </div>
            </div>
          </div>

          {/* Operating Hub Selector */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <label className="sg-label">
              Operating Hub {!canSwitchBranches && '(Locked)'}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="sg-select"
                value={activeBranchId}
                disabled={!canSwitchBranches}
                onChange={(e) => canSwitchBranches && onSelectBranch(e.target.value)}
                style={{
                  paddingRight: '28px',
                  fontSize: '12px',
                  fontWeight: 700,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  opacity: canSwitchBranches ? 1 : 0.78,
                  cursor: canSwitchBranches ? 'pointer' : 'not-allowed',
                }}
                aria-label="Select operating garage hub"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.baysCount} Bays)
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav aria-label="Primary Desktop Navigation" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                    borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 140ms var(--ease-out-expo), color 140ms var(--ease-out-expo)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className="tabular"
                      style={{
                        padding: '1px 6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: isActive ? 'var(--accent-volt)' : 'var(--bg-elevated)',
                        color: isActive ? 'var(--ink-on-accent)' : 'var(--text-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '2px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '2px solid var(--border-strong)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
            }}
          >
            <AvatarBadge src={currentUser.avatarUrl} name={currentUser.name} size={36} />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {roleMeta?.label || currentUser.role}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => authEngine.logout()}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            style={{ minHeight: '32px', width: '32px', padding: 0 }}
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Command Header */}
        <header
          style={{
            minHeight: '68px',
            background: 'var(--bg-surface)',
            borderBottom: '2px solid var(--border-strong)',
            padding: '10px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              CONSOLE
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
              {activeBranch.name}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
              {navItems.find((n) => n.id === currentTab)?.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {canViewOutbox && (
              <button
                type="button"
                onClick={() => setIsOutboxOpen(true)}
                className="sg-btn sg-btn-secondary sg-btn-sm tabular"
                title="Open Offline Outbox Queue"
              >
                <CloudUpload size={14} color={outbox.length > 0 ? 'var(--accent-amber)' : 'var(--text-primary)'} />
                <span>Outbox ({outbox.length})</span>
              </button>
            )}

            {canForceSync ? (
              <button
                type="button"
                onClick={onToggleNetwork}
                className="sg-btn sg-btn-sm"
                style={{
                  background: isOnline ? 'var(--accent-secondary-tint)' : 'var(--accent-danger-tint)',
                  color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                  borderColor: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                }}
                title="Toggle Online / Offline Room DB mode"
              >
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </button>
            ) : (
              <span
                className="sg-badge"
                style={{
                  background: isOnline ? 'var(--accent-secondary-tint)' : 'var(--accent-danger-tint)',
                  color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                  borderColor: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                }}
              >
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsWifiSyncOpen(true)}
              className="sg-btn sg-btn-secondary sg-btn-sm"
              title="Check local Wi-Fi SSE relay status"
            >
              <Radio size={14} color="var(--accent-primary)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {relayInfo.serverUrl.replace(/^https?:\/\//, '')}
              </span>
            </button>

            {onSwitchToBayTerminal && (
              <button
                type="button"
                onClick={onSwitchToBayTerminal}
                className="sg-btn sg-btn-volt sg-btn-sm"
                title="Preview Mobile Bay Terminal View"
              >
                <Smartphone size={14} /> Bay Terminal
              </button>
            )}

            {canCreateIntake && (
              <button
                type="button"
                onClick={() => setIsNewJobOpen(true)}
                className="sg-btn sg-btn-primary sg-btn-sm"
              >
                <Plus size={15} /> New Job Intake
              </button>
            )}
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ padding: '24px 26px', flex: 1 }}>
          {currentTab === 'overview' && (
            <DesktopAnalyticsView
              jobs={jobs}
              allJobs={allJobs}
              employees={employees}
              branches={branches}
              activeBranchId={activeBranchId}
            />
          )}

          {currentTab === 'kanban' && (
            <DesktopKanbanView
              jobs={jobs}
              onAdvanceStatus={onAdvanceJobStatus}
              onOpenNewJob={() => canCreateIntake && setIsNewJobOpen(true)}
              onOpenInspection={(job) => canPerformDvi && setInspectionJobId(job.id)}
              canCreateIntake={canCreateIntake}
              canAdvanceStatus={canAdvanceStatus}
              canPerformDvi={canPerformDvi}
              canManageInvoices={canManageInvoices}
            />
          )}

          {currentTab === 'billing' && (
            <DesktopBillingView
              jobs={jobs}
              onOpenNewJob={() => canCreateIntake && setIsNewJobOpen(true)}
              canManageInvoices={canManageInvoices}
              canCreateIntake={canCreateIntake}
            />
          )}

          {currentTab === 'staff' && (
            <DesktopStaffView
              employees={employees}
              jobs={jobs}
              onToggleClock={onToggleClock}
              currentUser={currentUser}
              canManageRoster={canManageRoster}
              canClockSelf={canClockSelf}
            />
          )}

          {currentTab === 'inventory' && (
            <DesktopInventoryView
              inventory={inventory}
              branches={branches}
              activeBranchId={activeBranchId}
              onUpdateStock={onUpdateStock}
              onTransferStock={onTransferStock}
              onOpenScanner={() => setIsScannerOpen(true)}
              canAdjustStock={canAdjustStock}
              canTransferStock={canTransferStock}
              canScanBarcode={canScanBarcode}
            />
          )}

          {currentTab === 'system' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <SystemAdminView currentUser={currentUser} />
            </div>
          )}
        </main>
      </div>

      {/* Shared Modals & Drawers */}
      <WifiDevSyncModal
        isOpen={isWifiSyncOpen}
        onClose={() => setIsWifiSyncOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={() => authEngine.logout()}
      />

      <NewJobCardModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        employees={employees}
        activeBranchId={activeBranchId}
        onCreateJob={onCreateJob}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={inventory}
        onItemScanned={handleScannedItem}
        canRestock={canAdjustStock}
        canDeduct={canAdjustStock || canScanBarcode}
      />

      <OutboxSyncDrawer
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        outbox={outbox}
        isOnline={isOnline}
        canTriggerSync={canForceSync}
        onTriggerSync={() => syncEngine.processOutbox()}
      />

      {selectedJobForInspection && (
        <VehicleInspectionModal
          isOpen={!!selectedJobForInspection}
          onClose={() => setInspectionJobId(null)}
          jobNumber={selectedJobForInspection.jobNumber}
          vehicleModel={selectedJobForInspection.vehicleModel}
          initialPoints={selectedJobForInspection.damagePoints}
          onSave={handleSaveInspection}
        />
      )}
    </div>
  );
};
