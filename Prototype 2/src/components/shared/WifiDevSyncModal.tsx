import React, { useState } from 'react';
import {
  X,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { syncEngine } from '../../state/syncEngine';

interface WifiDevSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WifiDevSyncModal: React.FC<WifiDevSyncModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <WifiDevSyncModalContent onClose={onClose} />;
};

const WifiDevSyncModalContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const relayInfo = syncEngine.getWifiRelayInfo();
  const [customUrl, setCustomUrl] = useState(relayInfo.serverUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async (targetUrl?: string) => {
    const urlToTest = (targetUrl ?? customUrl).trim().replace(/\/+$/, '');
    if (!/^https?:\/\/.+/i.test(urlToTest)) {
      setTestResult({
        success: false,
        message: 'Enter a valid http:// or https:// URL (e.g. http://192.168.1.2:5173).',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${urlToTest}/api/sync/status`, { mode: 'cors' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connected to PC Dev Server (${data.serverIp}:${data.port})! Active SSE clients: ${data.activeClients}.`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP ${res.status}. Verify Vite dev/preview server is running.`,
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: `Failed to reach ${urlToTest}. Ensure both devices share the same Wi-Fi network.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndReconnect = () => {
    const ok = syncEngine.setServerUrl(customUrl);
    if (!ok) {
      setTestResult({
        success: false,
        message: 'Invalid URL. Must start with http:// or https:// (e.g. http://192.168.1.2:5173).',
      });
      return;
    }
    void handleTestConnection(customUrl);
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Wi-Fi Dev Link">
      <div className="sg-modal" style={{ maxWidth: '500px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Wi-Fi Dev Link &bull; PC &amp; App Sync</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close Wi-Fi modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Schematic */}
          <div
            className="sg-grid-matrix"
            style={{ gridTemplateColumns: '1fr 1.1fr 1fr', textAlign: 'center' }}
          >
            <div className="sg-grid-cell" style={{ padding: '14px 10px' }}>
              <Laptop size={22} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '12px', fontWeight: 700 }}>Host PC Web</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                {relayInfo.serverUrl.replace(/^https?:\/\//, '')}
              </div>
            </div>

            <div
              className="sg-grid-cell"
              style={{
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'var(--bg-elevated)',
              }}
            >
              <span
                className="sg-badge"
                style={{
                  color: relayInfo.connected ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                  background: relayInfo.connected ? 'var(--accent-secondary-tint)' : 'var(--accent-amber-tint)',
                }}
              >
                {relayInfo.connected ? 'LIVE SSE LINK' : 'RECONNECTING'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Real-Time Stream
              </span>
            </div>

            <div className="sg-grid-cell" style={{ padding: '14px 10px' }}>
              <Smartphone size={22} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '12px', fontWeight: 700 }}>Bay Tablet App</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Wi-Fi Subnet
              </div>
            </div>
          </div>

          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                border: `1px solid ${testResult.success ? 'var(--accent-secondary)' : 'var(--accent-danger)'}`,
                background: testResult.success ? 'var(--accent-secondary-tint)' : 'var(--accent-danger-tint)',
                color: testResult.success ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div>
            <label className="sg-label">Host PC Server URL (Local IP &amp; Port)</label>
            <input
              type="text"
              className="sg-input sg-input-mono"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://192.168.1.2:5173"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Update this URL if your router assigns your PC a different local IPv4 address.
            </div>
          </div>

          <div className="sg-panel-muted" style={{ padding: '12px', fontSize: '12px', lineHeight: 1.6 }}>
            <strong>How Multi-Device Wi-Fi Sync Works:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>Connect both your PC and mobile device to the same Wi-Fi router.</li>
              <li>
                Client ID <code style={{ fontFamily: 'var(--font-mono)' }}>{relayInfo.clientId}</code> subscribes to SSE events at{' '}
                <code style={{ fontFamily: 'var(--font-mono)' }}>{relayInfo.serverUrl}/api/sync/events</code>.
              </li>
              <li>Job status updates, stock deductions, and registrations broadcast immediately across screens.</li>
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => void handleTestConnection()}
              disabled={testing}
              className="sg-btn sg-btn-secondary"
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSaveAndReconnect}
              className="sg-btn sg-btn-primary"
            >
              Save &amp; Reconnect <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
