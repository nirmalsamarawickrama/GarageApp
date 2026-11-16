import React, { useState } from 'react';
import { X, Radio, RefreshCw, CheckCircle2, AlertCircle, Laptop, Smartphone, ArrowRight } from 'lucide-react';
import { syncEngine } from '../../state/syncEngine';

interface WifiDevSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WifiDevSyncModal: React.FC<WifiDevSyncModalProps> = ({ isOpen, onClose }) => {
  const relayInfo = syncEngine.getWifiRelayInfo();
  const [customUrl, setCustomUrl] = useState(relayInfo.serverUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = customUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/api/sync/status`, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connected successfully to PC Dev Server (${data.serverIp}:${data.port})! Active clients: ${data.activeClients}.`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP ${res.status}. Verify Vite server is running.`,
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: `Failed to connect to ${customUrl}. Check that phone and PC are on the same Wi-Fi network.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndReconnect = () => {
    syncEngine.setServerUrl(customUrl);
    handleTestConnection();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#0d1322',
        borderRadius: '20px',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              Wi-Fi Dev Link &bull; PC &amp; App Sync
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Status Diagram */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Laptop size={24} color="var(--accent-cyan)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>Host PC Website</span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>192.168.1.2:5173</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                background: relayInfo.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${relayInfo.connected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                color: relayInfo.connected ? 'var(--accent-emerald)' : '#fbbf24',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: relayInfo.connected ? '#10b981' : '#f59e0b',
                }} />
                {relayInfo.connected ? 'Live Wi-Fi Link' : 'Reconnecting...'}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Real-Time SSE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Smartphone size={24} color="var(--accent-cyan)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>Mobile Phone App</span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Same Wi-Fi Subnet</span>
            </div>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              color: testResult.success ? '#34d399' : '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Server URL Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Host PC Server URL (Local IP &amp; Port)
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://192.168.1.2:5173"
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'white',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              If your Wi-Fi router assigns your PC a different IP address, update it here.
            </span>
          </div>

          {/* Quick Instructions */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '11px',
            color: '#a5f3fc',
            lineHeight: '1.6',
          }}>
            <strong>How It Works During Development:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              <li>Connect both your PC and mobile phone to the <strong>same Wi-Fi router</strong>.</li>
              <li>Launch the app on your phone — it connects to your PC at <code>{relayInfo.serverUrl}</code>.</li>
              <li>Any job card status change, parts deduction, or staff registration on your phone instantly syncs with your PC screen and vice versa!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={handleSaveAndReconnect}
              className="btn-primary"
              style={{
                padding: '12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Save &amp; Reconnect <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
