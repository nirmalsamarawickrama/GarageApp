import React, { useState, useEffect } from 'react';
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
import { Capacitor } from '@capacitor/core';

export function App() {
  const [, setTick] = useState(0);
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
  const [selectedJobForInspection, setSelectedJobForInspection] = useState<JobCard | null>(null);

  useEffect(() => {
    const unsubSync = syncEngine.subscribe(() => setTick((t) => t + 1));
    const unsubAuth = authEngine.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsubSync();
      unsubAuth();
    };
  }, []);

  const accessibleModules = currentUser ? getAccessibleModules(currentUser) : [];
  const currentMobileTab: MobileTab = accessibleModules.some((m) => m.id === activeMobileTab)
    ? activeMobileTab
    : ((accessibleModules[0]?.id as MobileTab) ?? 'jobs');

  // If user is not logged in:
  // Web Browser: Sophisticated enterprise authentication (Username + Strong Password, Registration, Forgot Password)
  // Native APK: Fast PIN-pad authentication for workshop tablets
  if (!currentUser) {
    if (!isNativeApp) {
      return <DesktopAuthScreen onLoginSuccess={() => setTick((t) => t + 1)} />;
    }
    return (
      <LoginScreen onLoginSuccess={() => setTick((t) => t + 1)} />
    );
  }

  const activeBranch = INITIAL_BRANCHES.find((b) => b.id === activeBranchId) || INITIAL_BRANCHES[0];

  const handleAdvanceStatus = (jobId: string, nextStatus: JobStatus) => {
    syncEngine.advanceJobStatus(jobId, nextStatus);
  };

  const handleCreateJob = (jobData: any) => {
    syncEngine.createJobCard(jobData);
  };

  const handleUpdateStock = (itemId: string, delta: number) => {
    syncEngine.updateInventoryStock(itemId, delta);
  };

  const handleTransferStock = (itemId: string, targetBranchId: string, qty: number) => {
    syncEngine.transferStock(itemId, targetBranchId, qty);
  };

  const handleToggleClock = (empId: string) => {
    syncEngine.toggleEmployeeClock(empId);
  };

  const handleSaveInspection = (points: Parameters<typeof syncEngine.saveInspectionPoints>[1]) => {
    if (selectedJobForInspection) {
      syncEngine.saveInspectionPoints(selectedJobForInspection.id, points);
      setSelectedJobForInspection(null);
    }
  };

  const handleScannedItem = (item: InventoryItem, action: 'INSPECT' | 'DEDUCT' | 'RESTOCK') => {
    if (action === 'DEDUCT') {
      syncEngine.updateInventoryStock(item.id, -1);
    } else if (action === 'RESTOCK') {
      syncEngine.updateInventoryStock(item.id, 5);
    }
  };

  // On the web (browser), ALWAYS render the Full Web Management Dashboard (no mobile view on web)
  if (!isNativeApp) {
    return (
      <DesktopDashboardLayout
        currentUser={currentUser}
        branches={INITIAL_BRANCHES}
        activeBranchId={activeBranchId}
        onSelectBranch={(id) => syncEngine.setActiveBranchId(id)}
        jobs={jobs}
        employees={employees}
        inventory={inventory}
        isOnline={isOnline}
        onAdvanceJobStatus={handleAdvanceStatus}
        onCreateJob={handleCreateJob}
        onUpdateStock={handleUpdateStock}
        onTransferStock={handleTransferStock}
        onToggleClock={handleToggleClock}
      />
    );
  }

  // Pure Native Mobile App Interface (Runs inside the Android APK on phones/tablets)
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-dark)',
      position: 'relative',
      boxShadow: '0 0 50px rgba(0, 0, 0, 0.6)',
    }}>

      {/* Native Mobile Top Bar with User Profile Pill */}
      <MobileHeader
        branches={INITIAL_BRANCHES}
        activeBranchId={activeBranchId}
        onSelectBranch={(id) => syncEngine.setActiveBranchId(id)}
        isOnline={isOnline}
        outboxCount={outbox.length}
        onOpenOutbox={() => setIsOutboxOpen(true)}
        onToggleNetwork={() => syncEngine.setOnlineStatus(!isOnline)}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWifiSync={() => setIsWifiSyncOpen(true)}
      />

      {/* Screen Body */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '96px' }}>
        {currentMobileTab === 'jobs' && hasPermission(currentUser, 'job:view') && (
          <WorkProgressView
            jobs={jobs}
            onAdvanceStatus={handleAdvanceStatus}
            onOpenNewJob={() => {
              if (hasPermission(currentUser, 'job:create_intake')) {
                setIsNewJobOpen(true);
              } else {
                alert('Vehicle intake requires Manager or Owner role permissions.');
              }
            }}
            onOpenInspection={(job) => setSelectedJobForInspection(job)}
          />
        )}
        
        {currentMobileTab === 'inventory' && hasPermission(currentUser, 'inventory:view') && (
          <InventoryView
            inventory={inventory}
            onOpenScanner={() => setIsScannerOpen(true)}
            onUpdateStock={handleUpdateStock}
            onTransferStock={handleTransferStock}
          />
        )}

        {currentMobileTab === 'employees' && hasPermission(currentUser, 'employee:view') && (
          <EmployeesView
            employees={employees}
            onToggleClock={handleToggleClock}
          />
        )}

        {currentMobileTab === 'sales' && hasPermission(currentUser, 'finance:view_kpis') && (
          <SalesInsightsView
            activeBranchName={activeBranch.name}
          />
        )}

        {currentMobileTab === 'admin' && hasPermission(currentUser, 'system:view_outbox') && (
          <SystemAdminView />
        )}
      </main>

      {/* Dynamic Bottom Navigation based on Accessible Modules */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '680px',
        zIndex: 40,
      }}>
        <MobileBottomNav
          activeTab={currentMobileTab}
          onTabChange={setActiveMobileTab}
          user={currentUser}
          state={{ jobs, inventory, outbox }}
        />
      </div>

      {/* User Profile & Role Switcher Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={() => authEngine.logout()}
      />

      {/* Shared Modals */}
      <NewJobCardModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        employees={employees}
        activeBranchId={activeBranchId}
        onCreateJob={handleCreateJob}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={inventory}
        onItemScanned={handleScannedItem}
      />

      {selectedJobForInspection && (
        <VehicleInspectionModal
          isOpen={!!selectedJobForInspection}
          onClose={() => setSelectedJobForInspection(null)}
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
