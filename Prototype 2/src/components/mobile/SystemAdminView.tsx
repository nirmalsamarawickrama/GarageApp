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
  Link2,
  Wifi,
  WifiOff,
  RotateCcw,
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { RegisterUserModal } from '../auth/RegisterUserModal';
import { User } from '../../types';
import { AvatarBadge } from '../shared/AvatarBadge';

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

  const handleSendResetPrompt = (requestId: string) => {
    const res = authEngine.sendResetPrompt(requestId);
    if (res.success) {
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage(res.message);
    }
  };

  const handleResetDemo = () => {
    syncEngine.resetDemoData();
    setStatusMessage('Workshop demo dataset restored to baseline state.');
    setTimeout(() => setStatusMessage(null), 3000);
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
      {statusMessage && (
        <div
          style={{
            background: 'var(--accent-secondary-tint)',
            border: '2px solid var(--accent-secondary)',
            padding: '12px 16px',
            color: 'var(--accent-secondary)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTOR 1: Device & Offline Sync Monitor */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title" style={{ color: 'var(--accent-danger)' }}>
            <Database size={14} /> Sector 1 &bull; Device &amp; Offline Sync Monitor
          </span>
          <span className="sg-sector-subtitle">Room SQLite Engine</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Database Status</div>
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{isOnline ? 'Online Synced' : 'Room DB Offline'}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Local storage active
              </div>
            </div>

            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Outbox Queue</div>
              <div
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: outbox.length > 0 ? 'var(--accent-amber)' : 'var(--text-primary)',
                }}
              >
                {outbox.length}{' '}
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>mutations</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {outbox.length === 0 ? 'All records flushed' : 'Awaiting network push'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => syncEngine.setOnlineStatus(!isOnline)}
              className={`sg-btn ${isOnline ? 'sg-btn-secondary' : 'sg-btn-emerald'}`}
              style={{ flex: 1 }}
            >
              {isOnline ? <WifiOff size={15} /> : <Wifi size={15} />}
              {isOnline ? 'Simulate Offline Mode' : 'Reconnect Network'}
            </button>

            <button
              type="button"
              onClick={handleForceSync}
              disabled={isFlushing || outbox.length === 0}
              className="sg-btn sg-btn-primary"
              style={{ flex: 1 }}
            >
              <RefreshCw size={15} className={isFlushing ? 'animate-spin' : ''} />
              {isFlushing
                ? 'Flushing Outbox...'
                : outbox.length > 0
                ? `Force Flush (${outbox.length})`
                : 'Outbox Fully Synced'}
            </button>

            <button
              type="button"
              onClick={handleResetDemo}
              className="sg-btn sg-btn-secondary"
              title="Reset job cards, inventory, and roster to baseline demo dataset"
            >
              <RotateCcw size={14} /> Reset Demo
            </button>
          </div>
        </div>
      </section>

      {/* SECTOR 2: Staff Credentials & Two-Way PIN Reset */}
      <section>
        <div className="sg-sector-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <span className="sg-sector-title">
              <Key size={14} color="var(--accent-primary)" /> Sector 2 &bull; Staff Credentials &amp; Accounts
            </span>
            <span className="sg-sector-subtitle tabular" style={{ marginLeft: '10px' }}>
              {users.length} active on terminal
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setRegisterMode('REGISTER');
                setIsRegisterModalOpen(true);
              }}
              className="sg-btn sg-btn-volt sg-btn-sm"
            >
              <UserPlus size={12} /> Register Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMode('LINK');
                setIsRegisterModalOpen(true);
              }}
              className="sg-btn sg-btn-secondary sg-btn-sm"
            >
              <Link2 size={12} /> Link Cloud
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            padding: '12px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <ShieldAlert size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Strict Privacy Protocol:</strong> User PINs are zero-knowledge encrypted and cannot be viewed or
            overwritten by IT Administrators. You may dispatch a reset prompt <em>only</em> after the user submits a request.
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div
            style={{
              background: 'var(--accent-amber-tint)',
              border: '2px solid var(--accent-amber)',
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-amber)' }}>
                <AlertTriangle size={15} />
                <span>Pending PIN Reset Requests ({pendingRequests.length})</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>ACTION REQUIRED</span>
            </div>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="sg-panel"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{req.userName}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Role: {req.userRole} &bull; Requested{' '}
                    {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendResetPrompt(req.id)}
                  className="sg-btn sg-btn-primary sg-btn-sm"
                >
                  <Send size={12} /> Send Reset Prompt
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map((u, idx) => {
            const roleMeta = ROLE_METADATA[u.role];
            const activeReq = authEngine.getActiveRequestForUser(u.id);
            const isPending = activeReq?.status === 'PENDING';
            const isPrompted = activeReq?.status === 'PROMPTED';

            return (
              <div
                key={u.id}
                className="sg-panel stagger-item"
                style={{
                  '--stagger-index': idx,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderColor: isPending ? 'var(--accent-amber)' : 'var(--border-strong)',
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AvatarBadge src={u.avatarUrl} name={u.name} size={40} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className="sg-badge"
                    style={{
                      color: roleMeta.badgeColor,
                      background: roleMeta.badgeBg,
                      borderColor: roleMeta.borderColor,
                    }}
                  >
                    {u.role}
                  </span>
                </div>

                <div
                  className="sg-panel-muted"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={12} />
                    <span>PIN Code:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '3px' }}>
                      ••••
                    </strong>
                    <span style={{ fontSize: '10px' }}>(Protected)</span>
                  </div>

                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => activeReq && handleSendResetPrompt(activeReq.id)}
                      className="sg-btn sg-btn-primary sg-btn-sm"
                    >
                      <Send size={11} /> Send Reset Prompt
                    </button>
                  ) : isPrompted ? (
                    <span className="sg-badge sg-badge-ready">
                      <Clock size={11} /> Prompt Dispatched
                    </span>
                  ) : (
                    <span className="sg-badge sg-badge-intake" title="User must submit a PIN reset request first.">
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
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Activity size={14} color="var(--accent-amber)" /> Sector 3 &bull; System Security &amp; Audit Trail
          </span>
          <span className="sg-sector-subtitle">Live events</span>
        </div>

        <div className="sg-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '12px',
              }}
            >
              <span
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {log.timestamp}
              </span>
              <span className="sg-badge sg-badge-intake">{log.status}</span>
              <div style={{ flex: 1, color: 'var(--text-primary)' }}>{log.event}</div>
            </div>
          ))}

          <div
            style={{
              marginTop: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>Build: AutoPulse-v2.0 (SpecGrid / Capacitor 8)</span>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>● Zero-Knowledge PIN Vault</span>
          </div>
        </div>
      </section>

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
