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
    <div className="sg-drawer-backdrop" role="dialog" aria-modal="true" aria-label="Offline Outbox Queue">
      <div className="sg-drawer">
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudUpload size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Offline Outbox Queue</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close outbox drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              padding: '12px 14px',
              border: `1px solid ${isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)'}`,
              background: isOnline ? 'var(--accent-secondary-tint)' : 'var(--accent-danger-tint)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                }}
              >
                {isOnline ? 'ONLINE // SYNC READY' : 'OFFLINE // ROOM DB QUEUEING'}
              </span>

              {isOnline && outbox.length > 0 && (
                <button
                  type="button"
                  onClick={onTriggerSync}
                  className="sg-btn sg-btn-volt sg-btn-sm"
                >
                  <RefreshCw size={12} /> Sync Now
                </button>
              )}
            </div>

            <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '6px' }}>
              {outbox.length} pending local mutation{outbox.length === 1 ? '' : 's'} queued for cloud PostgreSQL dispatch.
            </p>
          </div>

          {outbox.length === 0 ? (
            <div className="sg-panel-muted" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="var(--accent-secondary)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
                All Changes Fully Synced
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Local Room DB is in 100% parity with the cloud server.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {outbox.map((mut, idx) => (
                <div
                  key={mut.id}
                  className="sg-panel stagger-item"
                  style={{ '--stagger-index': idx, padding: '12px' } as React.CSSProperties}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="sg-badge sg-badge-intake">
                      {mut.action} &bull; {mut.entityType}
                    </span>
                    <span
                      className="sg-badge"
                      style={{
                        color: mut.status === 'SYNCED' ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                        background: mut.status === 'SYNCED' ? 'var(--accent-secondary-tint)' : 'var(--accent-amber-tint)',
                      }}
                    >
                      <Clock size={10} /> {mut.status}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-elevated)',
                      padding: '8px',
                      border: '1px solid var(--border-subtle)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {JSON.stringify(mut.payload).slice(0, 120)}
                  </div>

                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Logged at: {new Date(mut.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
