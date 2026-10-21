import React from 'react';
import { X, CloudUpload, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { SyncMutation } from '../../types';

interface OutboxSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  outbox: SyncMutation[];
  isOnline: boolean;
  onTriggerSync: () => void;
}

export const OutboxSyncDrawer: React.FC<OutboxSyncDrawerProps> = ({
  isOpen,
  onClose,
  outbox,
  isOnline,
  onTriggerSync,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 99999,
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: '1px solid var(--border-accent)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudUpload size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Offline Outbox Queue</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Status banner */}
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: isOnline ? 'var(--accent-emerald)' : '#f87171' }}>
              {isOnline ? '● Network: Online (Sync Ready)' : '● Network: Offline (Queueing in Room DB)'}
            </span>
            {isOnline && outbox.length > 0 && (
              <button
                onClick={onTriggerSync}
                style={{
                  background: 'var(--accent-cyan)',
                  color: '#080b11',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Sync Now
              </button>
            )}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {outbox.length} pending local mutation{outbox.length === 1 ? '' : 's'} waiting to be pushed to cloud PostgreSQL.
          </p>
        </div>

        {/* Mutation list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {outbox.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              <CheckCircle2 size={40} color="var(--accent-emerald)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>All Changes Fully Synced</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Local Room DB is in 100% parity with cloud server.
              </p>
            </div>
          ) : (
            outbox.map((mut) => (
              <div
                key={mut.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(6,182,212,0.15)',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {mut.action} &bull; {mut.entityType}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: mut.status === 'SYNCED' ? 'var(--accent-emerald)' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Clock size={10} /> {mut.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {JSON.stringify(mut.payload).slice(0, 90)}...
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Logged at: {new Date(mut.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
