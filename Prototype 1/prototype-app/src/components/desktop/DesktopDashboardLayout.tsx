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
  LogOut 
} from 'lucide-react';
import { JobCard, Employee, InventoryItem, GarageBranch, User, JobStatus } from '../../types';
import { ROLE_METADATA } from '../../auth/permissions';
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
  employees: Employee[];
  inventory: InventoryItem[];
  isOnline: boolean;
  onAdvanceJobStatus: (jobId: string, nextStatus: JobStatus) => void;
  onCreateJob: (jobData: any) => void;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => void;
  onToggleClock: (empId: string) => void;
}

export const DesktopDashboardLayout: React.FC<DesktopDashboardLayoutProps> = ({
  currentUser,
  branches,
  activeBranchId,
  onSelectBranch,
  jobs,
  employees,
  inventory,
  isOnline,
  onAdvanceJobStatus,
  onCreateJob,
  onUpdateStock,
  onTransferStock,
  onToggleClock,
}) => {
  const [activeTab, setActiveTab] = useState<DesktopNavTab>('overview');
  const [isWifiSyncOpen, setIsWifiSyncOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJobForInspection, setSelectedJobForInspection] = useState<JobCard | null>(null);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const roleMeta = ROLE_METADATA[currentUser.role];
  const relayInfo = syncEngine.getWifiRelayInfo();

  const handleSaveInspection = (points: Parameters<typeof syncEngine.saveInspectionPoints>[1]) => {
    if (selectedJobForInspection) {
      syncEngine.saveInspectionPoints(selectedJobForInspection.id, points);
      setSelectedJobForInspection(null);
    }
  };

  const navItems: { id: DesktopNavTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Executive Analytics', icon: LayoutDashboard },
    { id: 'kanban', label: 'Repair Pipeline (Kanban)', icon: Kanban, badge: jobs.length },
    { id: 'billing', label: 'Bills & Invoicing', icon: Receipt },
    { id: 'staff', label: 'Staff & Bay Operations', icon: Users, badge: employees.filter(e => e.status === 'Working on Job').length },
    { id: 'inventory', label: 'Parts & Warehouse', icon: Package, badge: inventory.filter(i => i.stockQty <= i.minSafetyStock).length || undefined },
    { id: 'system', label: 'IT Security & Sync Relay', icon: ShieldCheck },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-dark)',
      color: 'var(--text-main)',
      overflowX: 'hidden',
    }}>
      {/* =========================================
          LEFT NAVIGATION SIDEBAR (Persistent Desktop)
         ========================================= */}
      <aside style={{
        width: '280px',
        background: '#0d1322',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        flexShrink: 0,
      }}>
        {/* Top: Brand & Branch Picker */}
        <div>
          {/* Brand Header */}
          <div style={{
            padding: '24px 20px 20px 20px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '17px',
              color: 'white',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            }}>
              AP
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                  AutoPulse
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}>
                  ENTERPRISE
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Web Console</span>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#ef4444',
                }} />
                <span style={{ color: isOnline ? '#34d399' : '#f87171', fontSize: '10px', fontWeight: 600 }}>
                  {isOnline ? 'Mesh Online' : 'Offline Buffer'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Branch Selector Dropdown */}
          <div style={{ padding: '16px 20px 12px 20px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Operating Hub
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activeBranchId}
                onChange={(e) => onSelectBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-card)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} style={{ background: '#0f172a', color: 'white' }}>
                    {b.name} ({b.baysCount} Bays)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-dim)'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#000' : 'var(--text-muted)',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom of Sidebar: User Profile & Quick Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-card)', background: 'rgba(0, 0, 0, 0.2)' }}>
          {/* User Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              onClick={() => setIsProfileOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '11px', color: roleMeta?.badgeColor || 'var(--accent-cyan)', fontWeight: 600 }}>
                  {roleMeta?.label || currentUser.role}
                </div>
              </div>
            </div>

            <button
              onClick={() => authEngine.logout()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================
          RIGHT MAIN CONTENT AREA
         ========================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Header Bar */}
        <header style={{
          height: '72px',
          background: 'rgba(10, 15, 29, 0.95)',
          borderBottom: '1px solid var(--border-card)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
        }}>
          {/* Breadcrumb / Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Console</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{activeBranch.name}</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Right Header Badges & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Wi-Fi Dev Sync Relay Pill */}
            <button
              onClick={() => setIsWifiSyncOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--accent-cyan)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Click to check local Wi-Fi relay status"
            >
              <Radio size={14} className="animate-pulse-glow" />
              <span>Wi-Fi Link: {relayInfo.serverUrl.replace('http://', '')}</span>
            </button>

            {/* Quick Action: New Intake Job */}
            <button
              onClick={() => setIsNewJobOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={16} />
              <span>New Job Intake</span>
            </button>
          </div>
        </header>

        {/* Main Body Workspace */}
        <main style={{ padding: '32px', flex: 1 }}>
          {activeTab === 'overview' && (
            <DesktopAnalyticsView
              jobs={jobs}
              employees={employees}
              branches={branches}
              activeBranchId={activeBranchId}
            />
          )}

          {activeTab === 'kanban' && (
            <DesktopKanbanView
              jobs={jobs}
              onAdvanceStatus={onAdvanceJobStatus}
              onOpenNewJob={() => setIsNewJobOpen(true)}
              onOpenInspection={(job) => setSelectedJobForInspection(job)}
            />
          )}

          {activeTab === 'billing' && (
            <DesktopBillingView
              jobs={jobs}
              onOpenNewJob={() => setIsNewJobOpen(true)}
            />
          )}

          {activeTab === 'staff' && (
            <DesktopStaffView
              employees={employees}
              jobs={jobs}
              onToggleClock={onToggleClock}
            />
          )}

          {activeTab === 'inventory' && (
            <DesktopInventoryView
              inventory={inventory}
              branches={branches}
              activeBranchId={activeBranchId}
              onUpdateStock={onUpdateStock}
              onTransferStock={onTransferStock}
            />
          )}

          {activeTab === 'system' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <SystemAdminView />
            </div>
          )}
        </main>
      </div>

      {/* Global Shared Modals */}
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
    </div>
  );
};
