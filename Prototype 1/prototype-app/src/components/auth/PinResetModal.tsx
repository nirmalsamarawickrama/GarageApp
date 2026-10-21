import React, { useState } from 'react';
import { X, KeyRound, ShieldAlert, CheckCircle2, Send, Lock, ArrowRight } from 'lucide-react';
import { authEngine, DEMO_USERS } from '../../auth/authEngine';

interface PinResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: string;
  onPinResetComplete?: () => void;
}

export const PinResetModal: React.FC<PinResetModalProps> = ({
  isOpen,
  onClose,
  preselectedUserId,
  onPinResetComplete,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    preselectedUserId || DEMO_USERS[2].id // Default to Mechanic Dave Miller
  );
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const users = DEMO_USERS;
  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];
  const activeRequest = authEngine.getActiveRequestForUser(targetUser.id);
  const isPrompted = activeRequest?.status === 'PROMPTED';
  const isPending = activeRequest?.status === 'PENDING';

  const handleSendRequest = () => {
    const res = authEngine.requestPinReset(targetUser.id);
    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
  };

  const handleCompleteReset = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setFeedbackMessage({ text: 'PIN must be exactly 4 numeric digits.', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setFeedbackMessage({ text: 'PIN confirmation does not match.', type: 'error' });
      return;
    }

    const res = authEngine.completePinReset(targetUser.id, newPin);
    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        onClose();
        if (onPinResetComplete) onPinResetComplete();
      }, 1500);
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.75)',
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
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
            <KeyRound size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              Two-Way PIN Reset Authorization
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
          
          {/* User Account Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Staff Member Account</label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setFeedbackMessage(null);
                setNewPin('');
                setConfirmPin('');
              }}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'white',
                fontSize: '13px',
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.jobTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Banner */}
          {feedbackMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              background: feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              color: feedbackMessage.type === 'success' ? '#34d399' : '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Status Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Current Authorization Status
            </div>

            {isPrompted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Reset Authorized by IT Admin! You may set your new PIN.</span>
              </div>
            ) : isPending ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
                <ShieldAlert size={16} />
                <span>Request Pending IT Administrator Approval.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Lock size={16} />
                <span>No active reset request. Submit a request to notify IT.</span>
              </div>
            )}
          </div>

          {/* CASE 1: Prompt is Authorized -> User can set new PIN */}
          {isPrompted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Choose a new 4-digit PIN for {targetUser.name}:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)' }}>New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '4px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '4px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteReset}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                Save New PIN &amp; Complete Reset <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            /* CASE 2: No Prompt yet -> User can send request to IT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                For security compliance, IT Administrators cannot view your PIN or arbitrarily overwrite it. 
                Submitting a request notifies the IT Administrator to dispatch an authorization prompt directly to your device.
              </p>

              <button
                onClick={handleSendRequest}
                disabled={isPending}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: isPending ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  color: isPending ? 'var(--text-dim)' : 'white',
                  borderColor: isPending ? 'var(--border-subtle)' : 'rgba(6, 182, 212, 0.5)',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={15} />
                {isPending ? 'Request Pending IT Review' : 'Send PIN Reset Request to IT'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
