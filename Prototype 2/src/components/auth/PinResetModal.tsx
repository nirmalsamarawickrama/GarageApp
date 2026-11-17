import React, { useState, useEffect, useRef } from 'react';
import { X, KeyRound, ShieldAlert, CheckCircle2, Send, Lock, ArrowRight } from 'lucide-react';
import { authEngine } from '../../auth/authEngine';

interface PinResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: string;
  lockToPreselectedUser?: boolean;
  onPinResetComplete?: () => void;
}

export const PinResetModal: React.FC<PinResetModalProps> = ({
  isOpen,
  onClose,
  preselectedUserId,
  lockToPreselectedUser = false,
  onPinResetComplete,
}) => {
  if (!isOpen) return null;
  return (
    <PinResetModalContent
      key={preselectedUserId || 'default'}
      onClose={onClose}
      preselectedUserId={preselectedUserId}
      lockToPreselectedUser={lockToPreselectedUser}
      onPinResetComplete={onPinResetComplete}
    />
  );
};

const PinResetModalContent: React.FC<{
  onClose: () => void;
  preselectedUserId?: string;
  lockToPreselectedUser: boolean;
  onPinResetComplete?: () => void;
}> = ({ onClose, preselectedUserId, lockToPreselectedUser, onPinResetComplete }) => {
  const users = authEngine.getAvailableUsers();
  const currentUser = authEngine.getCurrentUser();
  const [selectedUserId, setSelectedUserId] = useState<string>(
    preselectedUserId || users[2]?.id || users[0]?.id || 'user-mech-1'
  );
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'CODE' | 'PASSWORD'>('CODE');
  const [dispatchCode, setDispatchCode] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];
  const activeRequest = targetUser ? authEngine.getActiveRequestForUser(targetUser.id) : undefined;
  const isPrompted = activeRequest?.status === 'PROMPTED';
  const isPending = activeRequest?.status === 'PENDING';
  const isSelfAuthenticated = !!currentUser && !!targetUser && currentUser.id === targetUser.id;

  const handleSendRequest = () => {
    if (!targetUser) return;
    const res = authEngine.requestPinReset(targetUser.id);
    setFeedbackMessage({
      text: res.message,
      type: res.success ? 'success' : 'error',
    });
  };

  const handleCompleteReset = () => {
    if (!targetUser) return;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setFeedbackMessage({ text: 'PIN must be exactly 4 numeric digits.', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setFeedbackMessage({ text: 'PIN confirmation does not match.', type: 'error' });
      return;
    }

    if (!isSelfAuthenticated) {
      if (verificationMethod === 'CODE' && dispatchCode.trim().length < 6) {
        setFeedbackMessage({
          text: 'Enter the 6-digit IT dispatch code (or switch to Account Password).',
          type: 'error',
        });
        return;
      }
      if (verificationMethod === 'PASSWORD' && !accountPassword.trim()) {
        setFeedbackMessage({
          text: 'Enter your account password to authorize this PIN reset.',
          type: 'error',
        });
        return;
      }
    }

    const res = authEngine.completePinReset(
      targetUser.id,
      newPin,
      isSelfAuthenticated
        ? undefined
        : verificationMethod === 'CODE'
        ? { dispatchCode }
        : { password: accountPassword }
    );

    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
      closeTimerRef.current = window.setTimeout(() => {
        onClose();
        if (onPinResetComplete) onPinResetComplete();
      }, 1100);
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Two-Way PIN Reset Authorization">
      <div className="sg-modal" style={{ maxWidth: '480px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Two-Way PIN Reset Authorization</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close PIN reset modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="sg-label">Staff Member Account</label>
            <select
              className="sg-select"
              value={targetUser?.id || ''}
              disabled={lockToPreselectedUser}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setFeedbackMessage(null);
                setNewPin('');
                setConfirmPin('');
                setDispatchCode('');
                setAccountPassword('');
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.jobTitle})
                </option>
              ))}
            </select>
          </div>

          {feedbackMessage && (
            <div
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 600,
                background:
                  feedbackMessage.type === 'success'
                    ? 'var(--accent-secondary-tint)'
                    : 'var(--accent-danger-tint)',
                border: `1px solid ${
                  feedbackMessage.type === 'success'
                    ? 'var(--accent-secondary)'
                    : 'var(--accent-danger)'
                }`,
                color:
                  feedbackMessage.type === 'success'
                    ? 'var(--accent-secondary)'
                    : 'var(--accent-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <ShieldAlert size={16} />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          <div className="sg-panel-muted" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="sg-label" style={{ marginBottom: 0 }}>
              Current Authorization Status
            </div>

            {isPrompted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontSize: '13px', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Reset Authorized by IT Admin! Verify &amp; set your new PIN below.</span>
              </div>
            ) : isPending ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 700 }}>
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

          {isPrompted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!isSelfAuthenticated && (
                <div className="sg-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="sg-label" style={{ marginBottom: 0 }}>
                      Identity Verification Required
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('CODE')}
                        className={`sg-btn sg-btn-sm ${verificationMethod === 'CODE' ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
                        style={{ minHeight: '26px', fontSize: '11px', padding: '2px 8px' }}
                      >
                        IT Dispatch Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('PASSWORD')}
                        className={`sg-btn sg-btn-sm ${verificationMethod === 'PASSWORD' ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
                        style={{ minHeight: '26px', fontSize: '11px', padding: '2px 8px' }}
                      >
                        Account Password
                      </button>
                    </div>
                  </div>

                  {verificationMethod === 'CODE' ? (
                    <div>
                      <label className="sg-label">6-Digit IT Dispatch Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="sg-input sg-input-mono tabular"
                        value={dispatchCode}
                        onChange={(e) => setDispatchCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code from IT Admin"
                        style={{ textAlign: 'center', fontSize: '15px', letterSpacing: '4px' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="sg-label">Account Password for {targetUser?.name}</label>
                      <input
                        type="password"
                        className="sg-input"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="Enter your account password"
                      />
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Choose a new 4-digit PIN for <strong>{targetUser?.name}</strong>:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="sg-label">New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="sg-input sg-input-mono"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '4px' }}
                  />
                </div>

                <div>
                  <label className="sg-label">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="sg-input sg-input-mono"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '4px' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteReset}
                className="sg-btn sg-btn-primary"
                style={{ width: '100%' }}
              >
                Save New PIN &amp; Complete Reset <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                For strict security compliance, IT Administrators cannot view or overwrite your PIN.
                Submitting a request notifies IT to dispatch an authorization code for your terminal.
              </p>

              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isPending}
                className="sg-btn sg-btn-primary"
                style={{ width: '100%' }}
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
