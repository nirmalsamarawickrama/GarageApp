import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Link2,
  Globe,
  Radio,
  Delete,
  Monitor,
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { User } from '../../types';
import { PinResetModal } from './PinResetModal';
import { PinChallengeModal } from './PinChallengeModal';
import { RegisterUserModal } from './RegisterUserModal';
import { WifiDevSyncModal } from '../shared/WifiDevSyncModal';
import { AvatarBadge } from '../shared/AvatarBadge';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSwitchToDesktopPortal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSwitchToDesktopPortal,
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(authEngine.getAvailableUsers());
  const [loginMode, setLoginMode] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [enteredPin, setEnteredPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(() => {
    const initial = authEngine.getAvailableUsers();
    return initial.length > 0 ? initial[0].email : '';
  });
  const [password, setPassword] = useState('AutoPulse@2026!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUserId, setResetTargetUserId] = useState<string | undefined>(undefined);
  const [challengeTargetUser, setChallengeTargetUser] = useState<User | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerInitialMode, setRegisterInitialMode] = useState<'REGISTER' | 'LINK'>('REGISTER');
  const [isWifiSyncOpen, setIsWifiSyncOpen] = useState(false);
  const pinTimerRef = useRef<number | null>(null);

  const isOnline = syncEngine.getIsOnline();

  useEffect(() => {
    const unsubAuth = authEngine.subscribe(() => {
      const users = authEngine.getAvailableUsers();
      setAvailableUsers(users);
      setSelectedEmail((prev) => prev || (users.length > 0 ? users[0].email : ''));
    });
    return () => {
      unsubAuth();
      if (pinTimerRef.current !== null) {
        window.clearTimeout(pinTimerRef.current);
      }
    };
  }, []);

  const allRequests = authEngine.getAllPinResetRequests();
  const promptedRequests = allRequests.filter((r) => r.status === 'PROMPTED');

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (isVerifyingPin || enteredPin.length >= 4) return;
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMessage(null);

      if (nextPin.length === 4) {
        setIsVerifyingPin(true);
        pinTimerRef.current = window.setTimeout(() => {
          const res = authEngine.loginWithPin(nextPin);
          setIsVerifyingPin(false);
          if (res.success) {
            onLoginSuccess();
          } else {
            setErrorMessage(res.error || 'Invalid 4-digit PIN');
            setEnteredPin('');
          }
        }, 120);
      }
    },
    [enteredPin, isVerifyingPin, onLoginSuccess]
  );

  const handlePinBackspace = useCallback(() => {
    if (isVerifyingPin) return;
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  }, [isVerifyingPin]);

  const handlePinClear = useCallback(() => {
    if (isVerifyingPin) return;
    setEnteredPin('');
    setErrorMessage(null);
  }, [isVerifyingPin]);

  useEffect(() => {
    if (
      loginMode !== 'PIN' ||
      isResetModalOpen ||
      !!challengeTargetUser ||
      isRegisterModalOpen ||
      isWifiSyncOpen
    ) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    challengeTargetUser,
    handlePinBackspace,
    handlePinDigit,
    isRegisterModalOpen,
    isResetModalOpen,
    isWifiSyncOpen,
    loginMode,
  ]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authEngine.loginWithEmail(selectedEmail, password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.error || 'Authentication failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-strong)',
        borderRight: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div className="sg-hazard-strip" />
      <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-control)',
                background: 'var(--accent-primary)',
                color: 'var(--ink-on-accent)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '22px',
              }}
            >
              AP
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                AutoPulse
              </h1>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-primary)',
                }}
              >
                BAY TERMINAL // GARAGE OS
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className={`sg-badge ${isOnline ? 'sg-badge-ready' : 'sg-badge-diagnosis'}`}>
              <Globe size={11} />
              {isOnline ? 'Global Cloud Directory' : 'Offline Room DB'}
            </span>

            <button
              type="button"
              onClick={() => setIsWifiSyncOpen(true)}
              className="sg-btn sg-btn-secondary sg-btn-sm"
              style={{ minHeight: '28px', padding: '3px 10px', fontSize: '11px' }}
            >
              <Radio size={12} color="var(--accent-primary)" />
              <span>PC Wi-Fi Link</span>
            </button>

            {onSwitchToDesktopPortal && (
              <button
                type="button"
                onClick={onSwitchToDesktopPortal}
                className="sg-btn sg-btn-volt sg-btn-sm"
                style={{ minHeight: '28px', padding: '3px 10px', fontSize: '11px' }}
              >
                <Monitor size={12} />
                <span>Desktop Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Authorized PIN Reset Banners */}
        {promptedRequests.map((req) => (
          <button
            key={req.id}
            type="button"
            onClick={() => {
              setResetTargetUserId(req.userId);
              setIsResetModalOpen(true);
            }}
            style={{
              width: '100%',
              marginTop: '12px',
              background: 'var(--accent-secondary-tint)',
              border: '2px solid var(--accent-secondary)',
              padding: '12px 14px',
              color: 'var(--accent-secondary)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>Reset Prompt Ready for {req.userName}:</strong> Tap to verify &amp; set your new PIN.
              </span>
            </div>
            <ArrowRight size={14} />
          </button>
        ))}

        {/* Sliding Mode Tabs */}
        <div
          className="sg-segmented"
          style={{
            gridTemplateColumns: '1fr 1fr',
            marginTop: '20px',
          }}
        >
          <div
            className="sg-segmented-thumb"
            style={{
              width: 'calc((100% - 6px) / 2)',
              transform: `translateX(${loginMode === 'PIN' ? 0 : 100}%)`,
            }}
          />
          <button
            type="button"
            className="sg-segmented-btn"
            data-active={loginMode === 'PIN'}
            onClick={() => {
              setLoginMode('PIN');
              setErrorMessage(null);
            }}
          >
            <KeyRound size={14} /> Mechanic Bay PIN
          </button>
          <button
            type="button"
            className="sg-segmented-btn"
            data-active={loginMode === 'PASSWORD'}
            onClick={() => {
              setLoginMode('PASSWORD');
              setErrorMessage(null);
            }}
          >
            <Mail size={14} /> Email / Password
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              marginTop: '14px',
              background: 'var(--accent-danger-tint)',
              border: '1px solid var(--accent-danger)',
              color: 'var(--accent-danger)',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* PIN MODE */}
        {loginMode === 'PIN' && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', textAlign: 'center' }}>
              Enter your 4-digit workshop tablet PIN
            </p>

            {/* PIN Indicator Squares */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid var(--border-strong)',
                      background: isFilled ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      transition: 'background 140ms var(--ease-out-expo)',
                    }}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                width: '100%',
                maxWidth: '290px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((val) => {
                if (val === 'C') {
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isVerifyingPin}
                      onClick={handlePinClear}
                      className="sg-btn sg-btn-secondary"
                      style={{ height: '54px', fontSize: '13px' }}
                    >
                      Clear
                    </button>
                  );
                }
                if (val === 'DEL') {
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isVerifyingPin}
                      onClick={handlePinBackspace}
                      className="sg-btn sg-btn-secondary"
                      style={{ height: '54px' }}
                      aria-label="Backspace"
                    >
                      <Delete size={18} />
                    </button>
                  );
                }
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={isVerifyingPin}
                    onClick={() => handlePinDigit(val)}
                    className="sg-btn sg-btn-secondary tabular"
                    style={{
                      height: '54px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setResetTargetUserId(undefined);
                setIsResetModalOpen(true);
              }}
              style={{
                marginTop: '14px',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <KeyRound size={13} /> Forgot PIN? Request Reset from IT
            </button>

            <div
              style={{
                marginTop: '14px',
                width: '100%',
                maxWidth: '290px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('REGISTER');
                  setIsRegisterModalOpen(true);
                }}
                className="sg-btn sg-btn-volt sg-btn-sm"
              >
                <UserPlus size={13} /> Register User
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('LINK');
                  setIsRegisterModalOpen(true);
                }}
                className="sg-btn sg-btn-secondary sg-btn-sm"
              >
                <Link2 size={13} /> Link Account
              </button>
            </div>
          </div>
        )}

        {/* PASSWORD MODE */}
        {loginMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="sg-label">Select Staff Account</label>
              <select
                className="sg-select"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} — {u.role} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="sg-label">Password</label>
              <input
                type="password"
                required
                className="sg-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="sg-btn sg-btn-primary sg-btn-lg" style={{ width: '100%' }}>
              Sign In to Workshop <ArrowRight size={15} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('REGISTER');
                  setIsRegisterModalOpen(true);
                }}
                className="sg-btn sg-btn-volt sg-btn-sm"
              >
                <UserPlus size={13} /> Register User
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('LINK');
                  setIsRegisterModalOpen(true);
                }}
                className="sg-btn sg-btn-secondary sg-btn-sm"
              >
                <Link2 size={13} /> Link Account
              </button>
            </div>
          </form>
        )}
      </div>

      {/* BOTTOM: Quick Switch Persona Bar */}
      <div className="sg-panel-muted" style={{ marginTop: '24px', padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            Switch Account ({availableUsers.length} active on device)
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            PIN Verification Enforced
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {availableUsers.map((u) => {
            const meta = ROLE_METADATA[u.role];
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setChallengeTargetUser(u)}
                className="sg-btn sg-btn-sm"
                style={{
                  background: meta.badgeBg,
                  color: meta.badgeColor,
                  borderColor: meta.borderColor,
                  flexShrink: 0,
                }}
              >
                <AvatarBadge src={u.avatarUrl} name={u.name} size={20} />
                <span>{u.name.split(' ')[0]}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>({meta.shortLabel})</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setRegisterInitialMode('REGISTER');
              setIsRegisterModalOpen(true);
            }}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            style={{ borderStyle: 'dashed', flexShrink: 0 }}
          >
            <UserPlus size={12} /> + Add User
          </button>
        </div>
      </div>

      <PinResetModal
        isOpen={isResetModalOpen}
        preselectedUserId={resetTargetUserId}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetTargetUserId(undefined);
        }}
        onPinResetComplete={() => {
          setIsResetModalOpen(false);
          setResetTargetUserId(undefined);
        }}
      />

      <PinChallengeModal
        isOpen={!!challengeTargetUser}
        onClose={() => setChallengeTargetUser(null)}
        targetUser={challengeTargetUser}
        onSuccess={() => {
          setChallengeTargetUser(null);
          onLoginSuccess();
        }}
      />

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialMode={registerInitialMode}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          onLoginSuccess();
        }}
      />

      <WifiDevSyncModal
        isOpen={isWifiSyncOpen}
        onClose={() => setIsWifiSyncOpen(false)}
      />
      </div>
    </div>
  );
};
