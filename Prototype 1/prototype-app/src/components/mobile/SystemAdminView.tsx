import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Key, 
  RefreshCw, 
  Activity, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Clock,
  ShieldAlert,
  UserPlus,
  Link2
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { RegisterUserModal } from '../auth/RegisterUserModal';
import { User } from '../../types';

export const SystemAdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(authEngine.getAvailableUsers());
  const [outbox, setOutbox] = useState(syncEngine.getOutbox());
  const [isOnline, setIsOnline] = useState(syncEngine.getIsOnline());
  const [pendingRequests, setPendingRequests] = useState(authEngine.getPendingPinResetRequests());

  const [isFlushing, setIsFlushing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState<'REGISTER' | 'LINK'>('REGISTER');

  useEffect(() => {
    const unsubAuth = authEngine.subscribe(() => {
      setUsers(authEngine.getAvailableUsers());
      setPendingRequests(authEngine.getPendingPinResetRequests());
    });
    const unsubSync = syncEngine.subscribe(() => {
      setOutbox(syncEngine.getOutbox());
      setIsOnline(syncEngine.getIsOnline());
    });
    return () => {
      unsubAuth();
      unsubSync();
    };
  }, []);

  const handleForceSync = async () => {
    setIsFlushing(true);
    await syncEngine.processOutbox();
    setIsFlushing(false);
    setStatusMessage('Room SQLite Outbox successfully processed and synced with cloud.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSendResetPrompt = (requestId: string, _userName: string) => {
    const res = authEngine.sendResetPrompt(requestId);
    if (res.success) {
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const auditLogs = [
    { id: 'log-1', timestamp: '17:04:12', event: 'Room SQLite outbox queue processed (3 mutations dispatched)', status: 'OK' },
    { id: 'log-2', timestamp: '16:58:30', event: 'Mechanic Dave Miller submitted PIN Reset Request from Bay 2 tablet', status: 'SECURITY' },
    { id: 'log-3', timestamp: '16:42:19', event: 'Inventory deduction conflict resolved (Last-Write-Wins precedence)', status: 'SYNC' },
    { id: 'log-4', timestamp: '16:10:05', event: 'Device token refreshed for Samsung Galaxy Tab Active3 (MAC: 48:2C:6A:11)', status: 'OK' },
    { id: 'log-5', timestamp: '15:30:00', event: 'Room DB automatic backup snapshot saved to internal storage', status: 'OK' },
  ];

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Alert Message */}
      {statusMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#34d399',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTOR 1: Device & Room DB Sync Diagnostics */}
      <section>
        <div className="sector-header">
          <span className="sector-title" style={{ color: '#f43f5e' }}>
            <Database size={14} /> Sector 1 &bull; Device &amp; Offline Sync Monitor
          </span>
          <span className="sector-subtitle">Room SQLite Engine</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Database Status</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#f59e0b',
                }} />
                {isOnline ? 'Online Synced' : 'Room DB Offline'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Local storage active
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Outbox Queue</div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: outbox.length > 0 ? '#f59e0b' : 'white',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px',
              }}>
                {outbox.length} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>mutations</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {outbox.length === 0 ? 'All records flushed' : 'Awaiting network push'}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleForceSync}
            disabled={isFlushing || outbox.length === 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13px',
              borderRadius: '12px',
              background: outbox.length > 0 ? 'linear-gradient(135deg, #f43f5e, #be123c)' : 'rgba(255,255,255,0.06)',
              color: outbox.length > 0 ? 'white' : 'var(--text-dim)',
              borderColor: outbox.length > 0 ? 'rgba(244, 63, 94, 0.5)' : 'var(--border-subtle)',
              cursor: outbox.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <RefreshCw size={16} className={isFlushing ? 'animate-spin' : ''} />
            {isFlushing ? 'Flushing Outbox...' : outbox.length > 0 ? `Force Flush Outbox (${outbox.length} pending)` : 'Outbox Fully Synced'}
          </button>
        </div>
      </section>

      {/* SECTOR 2: User Security & Two-Way PIN Reset Authorizations */}
      <section>
        <div className="sector-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="sector-title" style={{ color: 'var(--accent-cyan)' }}>
              <Key size={14} /> Sector 2 &bull; Staff Credentials &amp; Accounts
            </span>
            <span className="sector-subtitle" style={{ marginLeft: '8px' }}>{users.length} active on terminal</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => {
                setRegisterMode('REGISTER');
                setIsRegisterModalOpen(true);
              }}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '8px',
                padding: '5px 10px',
                color: 'var(--accent-cyan)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <UserPlus size={12} /> Register Staff
            </button>
            <button
              onClick={() => {
                setRegisterMode('LINK');
                setIsRegisterModalOpen(true);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '5px 10px',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Link2 size={12} /> Link Cloud
            </button>
          </div>
        </div>

        {/* Security Policy Alert Banner */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '14px',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#a5f3fc',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          marginBottom: '14px',
        }}>
          <ShieldAlert size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Strict Privacy Protocol:</strong> User PINs are encrypted and cannot be viewed or overwritten by IT Administrators. 
            You may dispatch a reset prompt <em>only</em> if the user has formally submitted a reset request.
          </div>
        </div>

        {/* Pending Requests Highlight Card */}
        {pendingRequests.length > 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
                <AlertTriangle size={16} />
                <span>Pending PIN Reset Requests ({pendingRequests.length})</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Action Required</span>
            </div>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{req.userName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Role: {req.userRole} &bull; Requested {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  onClick={() => handleSendResetPrompt(req.id, req.userName)}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(6,182,212,0.3)',
                  }}
                >
                  <Send size={12} /> Send Reset Prompt
                </button>
              </div>
            ))}
          </div>
        )}

        {/* User Account Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((u) => {
            const roleMeta = ROLE_METADATA[u.role];
            const activeReq = authEngine.getActiveRequestForUser(u.id);
            const isPending = activeReq?.status === 'PENDING';
            const isPrompted = activeReq?.status === 'PROMPTED';

            return (
              <div
                key={u.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderColor: isPending ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{u.email}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    color: roleMeta.badgeColor,
                    background: roleMeta.badgeBg,
                    border: `1px solid ${roleMeta.borderColor}`,
                  }}>
                    {u.role}
                  </span>
                </div>

                {/* Secure Credential & Authorization Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={12} />
                    <span>PIN Code:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '3px' }}>
                      ••••
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>(Protected)</span>
                  </div>

                  {/* Actions / Status restricted to Two-Way authorization */}
                  {isPending ? (
                    <button
                      onClick={() => activeReq && handleSendResetPrompt(activeReq.id, u.name)}
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Send size={11} /> Send Reset Prompt
                    </button>
                  ) : isPrompted ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: 'var(--accent-cyan)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                    }}>
                      <Clock size={11} /> Prompt Dispatched
                    </span>
                  ) : (
                    <span
                      title="User must formally submit a PIN reset request before a reset prompt can be sent."
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-dim)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'not-allowed',
                      }}
                    >
                      No Reset Request
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTOR 3: System Security & Audit Trail */}
      <section>
        <div className="sector-header">
          <span className="sector-title" style={{ color: 'var(--accent-amber)' }}>
            <Activity size={14} /> Sector 3 &bull; System Security &amp; Audit Trail
          </span>
          <span className="sector-subtitle">Live events</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '12px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}>
                {log.timestamp}
              </span>
              <div style={{ flex: 1, color: 'var(--text-muted)' }}>
                {log.event}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Build: AutoPulse-v1.1 (Capacitor 8 / Android 34)</span>
            <span style={{ color: 'var(--accent-emerald)' }}>● Zero-Knowledge PIN Vault</span>
          </div>
        </div>
      </section>

      {/* Register / Link Cloud User Modal */}
      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialMode={registerMode}
        onSuccess={(newUser) => {
          setStatusMessage(`Staff account ${newUser.name} successfully registered and synchronized!`);
          setTimeout(() => setStatusMessage(null), 4000);
        }}
      />
    </div>
  );
};
