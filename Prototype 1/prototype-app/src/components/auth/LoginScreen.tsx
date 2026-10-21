import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  KeyRound, 
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Link2,
  Globe,
  Radio,
  Delete
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { User } from '../../types';
import { PinResetModal } from './PinResetModal';
import { PinChallengeModal } from './PinChallengeModal';
import { RegisterUserModal } from './RegisterUserModal';
import { WifiDevSyncModal } from '../shared/WifiDevSyncModal';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(authEngine.getAvailableUsers());
  const [loginMode, setLoginMode] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(() => {
    const initial = authEngine.getAvailableUsers();
    return initial.length > 0 ? initial[0].email : '';
  });
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [challengeTargetUser, setChallengeTargetUser] = useState<User | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerInitialMode, setRegisterInitialMode] = useState<'REGISTER' | 'LINK'>('REGISTER');
  const [isWifiSyncOpen, setIsWifiSyncOpen] = useState(false);

  const isOnline = syncEngine.getIsOnline();

  useEffect(() => {
    const unsubAuth = authEngine.subscribe(() => {
      const users = authEngine.getAvailableUsers();
      setAvailableUsers(users);
      setSelectedEmail((prev) => prev || (users.length > 0 ? users[0].email : ''));
    });
    return () => unsubAuth();
  }, []);

  // Check if any user has an authorized prompt ready
  const allRequests = authEngine.getAllPinResetRequests();
  const promptedRequest = allRequests.find((r) => r.status === 'PROMPTED');

  // Handle PIN input
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMessage(null);

      // Auto submit on 4th digit
      if (nextPin.length === 4) {
        setTimeout(() => {
          const res = authEngine.loginWithPin(nextPin);
          if (res.success) {
            onLoginSuccess();
          } else {
            setErrorMessage(res.error || 'Invalid 4-digit PIN');
            setEnteredPin('');
          }
        }, 150);
      }
    }
  };

  const handlePinBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handlePinClear = () => {
    setEnteredPin('');
    setErrorMessage(null);
  };

  // Handle Password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authEngine.loginWithEmail(selectedEmail);
    if (success) {
      onLoginSuccess();
    } else {
      setErrorMessage('User account not found');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      background: 'var(--bg-dark)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 20px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
    }}>
      {/* Top Brand Header */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              color: 'white',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
            }}>
              AP
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                AutoPulse
              </h1>
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Garage &amp; Network OS
              </div>
            </div>
          </div>

          {/* Cloud Sync & Wi-Fi Relay Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '11px',
              color: isOnline ? 'var(--accent-emerald)' : '#fbbf24',
              fontWeight: 600,
            }}>
              <Globe size={12} />
              <span>{isOnline ? 'Global Cloud Directory' : 'Offline Room DB'}</span>
            </div>

            <button
              onClick={() => setIsWifiSyncOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Radio size={12} />
              <span>PC Wi-Fi Link</span>
            </button>
          </div>
        </div>

        {/* Authorized PIN Reset Banner Notification (if IT has approved a request) */}
        {promptedRequest && (
          <button
            onClick={() => setIsResetModalOpen(true)}
            style={{
              width: '100%',
              marginTop: '16px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '12px 14px',
              color: '#34d399',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              animation: 'pulse 2s infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>Reset Prompt Ready for {promptedRequest.userName}:</strong> IT has authorized your reset. Tap to choose your new PIN.
              </span>
            </div>
            <ArrowRight size={14} />
          </button>
        )}

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '14px',
          padding: '4px',
          marginTop: promptedRequest ? '14px' : '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => {
              setLoginMode('PIN');
              setErrorMessage(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: loginMode === 'PIN' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: loginMode === 'PIN' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={15} /> Mechanic Bay PIN
          </button>

          <button
            onClick={() => {
              setLoginMode('PASSWORD');
              setErrorMessage(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: loginMode === 'PASSWORD' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: loginMode === 'PASSWORD' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Mail size={15} /> Email / Password
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            marginTop: '16px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {errorMessage}
          </div>
        )}

        {/* PIN MODE */}
        {loginMode === 'PIN' && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', textAlign: 'center' }}>
              Enter your 4-digit workshop tablet PIN
            </p>

            {/* PIN Dots Indicator */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: isFilled ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                      border: isFilled ? '2px solid rgba(6, 182, 212, 0.6)' : '1px solid var(--border-subtle)',
                      boxShadow: isFilled ? '0 0 10px rgba(6, 182, 212, 0.6)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              width: '100%',
              maxWidth: '300px',
            }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((val) => {
                if (val === 'C') {
                  return (
                    <button
                      key={val}
                      onClick={handlePinClear}
                      style={{
                        height: '56px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-dim)',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  );
                }
                if (val === 'DEL') {
                  return (
                    <button
                      key={val}
                      onClick={handlePinBackspace}
                      style={{
                        height: '56px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-dim)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Delete size={18} />
                    </button>
                  );
                }
                return (
                  <button
                    key={val}
                    onClick={() => handlePinDigit(val)}
                    style={{
                      height: '56px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-card)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s, background-color 0.1s',
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Forgot PIN Link */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              style={{
                marginTop: '12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              <KeyRound size={13} /> Forgot PIN? Request Reset from IT
            </button>

            {/* Account Registration & Cloud Linking Actions */}
            <div style={{
              marginTop: '16px',
              width: '100%',
              maxWidth: '300px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              <button
                onClick={() => {
                  setRegisterInitialMode('REGISTER');
                  setIsRegisterModalOpen(true);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <UserPlus size={13} /> Register User
              </button>

              <button
                onClick={() => {
                  setRegisterInitialMode('LINK');
                  setIsRegisterModalOpen(true);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <Link2 size={13} /> Link Account
              </button>
            </div>
          </div>
        )}

        {/* PASSWORD MODE */}
        {loginMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Staff Account</label>
              <select
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} — {u.role} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                marginTop: '4px',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Sign In to Workshop <ArrowRight size={15} />
            </button>

            {/* Registration & Link Buttons in Password Mode */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '4px',
            }}>
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('REGISTER');
                  setIsRegisterModalOpen(true);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <UserPlus size={13} /> Register User
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterInitialMode('LINK');
                  setIsRegisterModalOpen(true);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <Link2 size={13} /> Link Account
              </button>
            </div>
          </form>
        )}
      </div>

      {/* BOTTOM: Quick Switch Persona Bar with Registered Users */}
      <div style={{
        marginTop: '28px',
        padding: '14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Switch Account ({availableUsers.length} active on device)
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            PIN Verification Enforced
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
        }}>
          {availableUsers.map((u) => {
            const meta = ROLE_METADATA[u.role];
            return (
              <button
                key={u.id}
                onClick={() => setChallengeTargetUser(u)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: `1px solid ${meta.borderColor}`,
                  background: meta.badgeBg,
                  color: meta.badgeColor,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.name}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>{u.name.split(' ')[0]}</span>
                <span style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase' }}>({u.role})</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setRegisterInitialMode('REGISTER');
              setIsRegisterModalOpen(true);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px dashed var(--accent-cyan)',
              background: 'rgba(6, 182, 212, 0.08)',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <UserPlus size={12} /> + Add User
          </button>
        </div>
      </div>

      {/* Two-Way PIN Reset Modal */}
      <PinResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onPinResetComplete={() => setIsResetModalOpen(false)}
      />

      {/* PIN Challenge Modal for Switching Accounts */}
      <PinChallengeModal
        isOpen={!!challengeTargetUser}
        onClose={() => setChallengeTargetUser(null)}
        targetUser={challengeTargetUser}
        onSuccess={() => {
          setChallengeTargetUser(null);
          onLoginSuccess();
        }}
      />

      {/* Register New User & Link Account Modal */}
      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialMode={registerInitialMode}
        onSuccess={(_newUser) => {
          setIsRegisterModalOpen(false);
          onLoginSuccess();
        }}
      />

      {/* PC Local Wi-Fi Relay Modal */}
      <WifiDevSyncModal
        isOpen={isWifiSyncOpen}
        onClose={() => setIsWifiSyncOpen(false)}
      />
    </div>
  );
};


