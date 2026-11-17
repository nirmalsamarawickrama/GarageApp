import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { syncEngine } from './state/syncEngine';
import { authEngine } from './auth/authEngine';
import { hasPermission } from './auth/permissions';
import { INITIAL_BRANCHES } from './data/mockData';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav, MobileTab } from './components/mobile/MobileBottomNav';
import { WorkProgressView } from './components/mobile/WorkProgressView';
import { InventoryView } from './components/mobile/InventoryView';
import { EmployeesView } from './components/mobile/EmployeesView';
import { SalesInsightsView } from './components/mobile/SalesInsightsView';
import { SystemAdminView } from './components/mobile/SystemAdminView';
import { LoginScreen } from './components/auth/LoginScreen';
import { DesktopAuthScreen } from './components/desktop/DesktopAuthScreen';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { VehicleInspectionModal } from './components/shared/VehicleInspectionModal';
import { BarcodeScannerModal } from './components/shared/BarcodeScannerModal';
import { NewJobCardModal } from './components/shared/NewJobCardModal';
import { OutboxSyncDrawer } from './components/shared/OutboxSyncDrawer';
import { WifiDevSyncModal } from './components/shared/WifiDevSyncModal';
import { DesktopDashboardLayout } from './components/desktop/DesktopDashboardLayout';
import { JobCard, JobStatus, InventoryItem } from './types';
import { getAccessibleModules } from './modules/moduleRegistry';

export function App() {
  const [, setTick] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [surfaceOverride, setSurfaceOverride] = useState<'auto' | 'desktop' | 'mobile'>('auto');

  const jobs = syncEngine.getJobs();
  const inventory = syncEngine.getInventory();
  const employees = syncEngine.getEmployees();
  const outbox = syncEngine.getOutbox();
  const isOnline = syncEngine.getIsOnline();
  const activeBranchId = syncEngine.getActiveBranchId();
  const currentUser = authEngine.getCurrentUser();

  const isNativeApp = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('jobs');

  // Modals
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWifiSyncOpen, setIsWifiSyncOpen] = useState(false);
  const [inspectionJobId, setInspectionJobId] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubSync = syncEngine.subscribe(() => setTick((t) => t + 1));
    const unsubAuth = authEngine.subscribe(() => setTick((t) => t + 1));
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      unsubSync();
      unsubAuth();
      window.removeEventListener('resize', handleResize);
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const showNotice = (msg: string) => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    setPermissionNotice(msg);
    noticeTimerRef.current = window.setTimeout(() => {
      setPermissionNotice(null);
      noticeTimerRef.current = null;
    }, 3500);
  };

  const useDesktopSurface =
    !isNativeApp &&
    (surfaceOverride === 'desktop' ||
      (surfaceOverride === 'auto' && viewportWidth >= 1024));

  const accessibleModules = currentUser ? getAccessibleModules(currentUser) : [];
  const currentMobileTab: MobileTab = accessibleModules.some((m) => m.id === activeMobileTab)
    ? activeMobileTab
    : ((accessibleModules[0]?.id as MobileTab) ?? 'jobs');

  if (!currentUser) {
    if (useDesktopSurface) {
      return (
        <DesktopAuthScreen
          onLoginSuccess={() => setTick((t) => t + 1)}
          onSwitchToBayTerminal={() => setSurfaceOverride('mobile')}
        />
      );
    }
    return (
      <LoginScreen
        onLoginSuccess={() => setTick((t) => t + 1)}
        onSwitchToDesktopPortal={
          !isNativeApp ? () => setSurfaceOverride('desktop') : undefined
        }
      />
    );
  }

  const canSwitchBranches = hasPermission(currentUser, 'system:switch_all_branches');
  const effectiveBranchId = canSwitchBranches ? activeBranchId : currentUser.branchId;
  const activeBranch =
    INITIAL_BRANCHES.find((b) => b.id === effectiveBranchId) || INITIAL_BRANCHES[0];

  const branchJobs = jobs.filter((j) => j.branchId === effectiveBranchId);
  const branchInventory = inventory.filter((i) => i.branchId === effectiveBranchId);
  const branchEmployees = employees.filter((e) => e.branchId === effectiveBranchId);

  const selectedJobForInspection = inspectionJobId
    ? branchJobs.find((j) => j.id === inspectionJobId) || null
    : null;

  const canCreateIntake = hasPermission(currentUser, 'job:create_intake');
  const canAdvanceStatus = hasPermission(currentUser, 'job:advance_status');
  const canPerformDvi = hasPermission(currentUser, 'job:perform_dvi');
  const canAdjustStock = hasPermission(currentUser, 'inventory:adjust_stock');
  const canTransferStock = hasPermission(currentUser, 'inventory:transfer_branch');
  const canScanBarcode = hasPermission(currentUser, 'inventory:scan_barcode');
  const canManageRoster = hasPermission(currentUser, 'employee:manage_roster');
  const canClockSelf = hasPermission(currentUser, 'employee:clock_self');
  const canSendReminders = hasPermission(currentUser, 'finance:send_reminders');
  const canViewOutbox = hasPermission(currentUser, 'system:view_outbox');
  const canForceSync = hasPermission(currentUser, 'system:force_sync');

  const handleSelectBranch = (id: string) => {
    if (!canSwitchBranches) {
      showNotice('Branch switching requires Owner, Accountant, or IT Admin permissions.');
      return;
    }
    syncEngine.setActiveBranchId(id);
  };

  const handleToggleNetwork = () => {
    if (!canForceSync) {
      showNotice('Network offline toggle requires Manager or IT Admin permissions.');
      return;
    }
    syncEngine.setOnlineStatus(!isOnline);
  };

  const handleAdvanceStatus = (jobId: string, nextStatus: JobStatus) => {
    if (!canAdvanceStatus) {
      showNotice('Advancing repair stages requires Mechanic, Manager, or Owner role.');
      return;
    }
    syncEngine.advanceJobStatus(jobId, nextStatus);
  };

  const handleCreateJob = (
    jobData: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>
  ) => {
    if (!canCreateIntake) {
      showNotice('Vehicle intake requires Manager or Owner role permissions.');
      return;
    }
    syncEngine.createJobCard(jobData);
  };

  const handleUpdateStock = (itemId: string, delta: number) => {
    if (!canAdjustStock) {
      showNotice('Adjusting inventory stock directly requires Manager, Owner, Accountant, or IT Admin role.');
      return;
    }
    syncEngine.updateInventoryStock(itemId, delta);
  };

  const handleTransferStock = (itemId: string, targetBranchId: string, qty: number): boolean => {
    if (!canTransferStock) {
      showNotice('Inter-branch stock transfers require Manager, Owner, or IT Admin role.');
      return false;
    }
    return syncEngine.transferStock(itemId, targetBranchId, qty);
  };

  const handleToggleClock = (empId: string) => {
    const target = employees.find((e) => e.id === empId);
    const isSelf =
      !!target &&
      (target.userId === currentUser.id ||
        target.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase());
    if (!canManageRoster && !(canClockSelf && isSelf)) {
      showNotice('You can only clock your own shift unless you hold Manager or Owner permissions.');
      return;
    }
    syncEngine.toggleEmployeeClock(empId);
  };

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

  if (useDesktopSurface) {
    return (
      <DesktopDashboardLayout
        currentUser={currentUser}
        branches={INITIAL_BRANCHES}
        activeBranchId={effectiveBranchId}
        onSelectBranch={handleSelectBranch}
        jobs={branchJobs}
        allJobs={jobs}
        employees={branchEmployees}
        inventory={branchInventory}
        outbox={outbox}
        isOnline={isOnline}
        onToggleNetwork={handleToggleNetwork}
        onAdvanceJobStatus={handleAdvanceStatus}
        onCreateJob={handleCreateJob}
        onUpdateStock={handleUpdateStock}
        onTransferStock={handleTransferStock}
        onToggleClock={handleToggleClock}
        onSwitchToBayTerminal={() => setSurfaceOverride('mobile')}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-canvas)',
        borderLeft: '1px solid var(--border-strong)',
        borderRight: '1px solid var(--border-strong)',
        position: 'relative',
      }}
    >
      <MobileHeader
        branches={INITIAL_BRANCHES}
        activeBranchId={effectiveBranchId}
        onSelectBranch={handleSelectBranch}
        isOnline={isOnline}
        outboxCount={outbox.length}
        onOpenOutbox={() => canViewOutbox && setIsOutboxOpen(true)}
        onToggleNetwork={handleToggleNetwork}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWifiSync={() => setIsWifiSyncOpen(true)}
        onSwitchToDesktop={!isNativeApp ? () => setSurfaceOverride('desktop') : undefined}
        canSwitchBranches={canSwitchBranches}
        canViewOutbox={canViewOutbox}
        canForceSync={canForceSync}
      />

      {permissionNotice && (
        <div
          style={{
            margin: '12px 16px 0',
            padding: '10px 14px',
            background: 'var(--accent-danger-tint)',
            border: '1px solid var(--accent-danger)',
            color: 'var(--accent-danger)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {permissionNotice}
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '92px' }}>
        {currentMobileTab === 'jobs' && hasPermission(currentUser, 'job:view') && (
          <WorkProgressView
            jobs={branchJobs}
            onAdvanceStatus={handleAdvanceStatus}
            onOpenNewJob={() => {
              if (canCreateIntake) {
                setIsNewJobOpen(true);
              } else {
                showNotice('Vehicle intake requires Manager or Owner role permissions.');
              }
            }}
            onOpenInspection={(job) => canPerformDvi && setInspectionJobId(job.id)}
            canCreateIntake={canCreateIntake}
            canAdvanceStatus={canAdvanceStatus}
            canPerformDvi={canPerformDvi}
          />
        )}

        {currentMobileTab === 'inventory' && hasPermission(currentUser, 'inventory:view') && (
          <InventoryView
            inventory={branchInventory}
            onOpenScanner={() => canScanBarcode && setIsScannerOpen(true)}
            onUpdateStock={handleUpdateStock}
            onTransferStock={handleTransferStock}
            canAdjustStock={canAdjustStock}
            canTransferStock={canTransferStock}
            canScanBarcode={canScanBarcode}
          />
        )}

        {currentMobileTab === 'employees' && hasPermission(currentUser, 'employee:view') && (
          <EmployeesView
            employees={branchEmployees}
            onToggleClock={handleToggleClock}
            currentUser={currentUser}
            canManageRoster={canManageRoster}
            canClockSelf={canClockSelf}
          />
        )}

        {currentMobileTab === 'sales' && hasPermission(currentUser, 'finance:view_kpis') && (
          <SalesInsightsView
            activeBranch={activeBranch}
            jobs={branchJobs}
            canSendReminders={canSendReminders}
          />
        )}

        {currentMobileTab === 'admin' && hasPermission(currentUser, 'system:view_outbox') && (
          <SystemAdminView currentUser={currentUser} />
        )}
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '680px',
          zIndex: 40,
        }}
      >
        <MobileBottomNav
          activeTab={currentMobileTab}
          onTabChange={setActiveMobileTab}
          user={currentUser}
          state={{ jobs: branchJobs, inventory: branchInventory, outbox }}
        />
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={() => authEngine.logout()}
      />

      <NewJobCardModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        employees={branchEmployees}
        activeBranchId={effectiveBranchId}
        onCreateJob={handleCreateJob}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={branchInventory}
        onItemScanned={handleScannedItem}
        canRestock={canAdjustStock}
        canDeduct={canAdjustStock || canScanBarcode}
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

      <OutboxSyncDrawer
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        outbox={outbox}
        isOnline={isOnline}
        canTriggerSync={canForceSync}
        onTriggerSync={() => syncEngine.processOutbox()}
      />

      <WifiDevSyncModal
        isOpen={isWifiSyncOpen}
        onClose={() => setIsWifiSyncOpen(false)}
      />
    </div>
  );
}

export default App;
