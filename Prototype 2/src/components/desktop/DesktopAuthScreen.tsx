import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  BadgeCheck,
  KeyRound,
  Check,
  Smartphone,
} from 'lucide-react';
import {
  authEngine,
  evaluatePasswordStrength,
  DEMO_USERS,
  PasswordStrengthResult,
} from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { UserRole } from '../../types';
import { INITIAL_BRANCHES } from '../../data/mockData';
import { AvatarBadge } from '../shared/AvatarBadge';

interface DesktopAuthScreenProps {
  onLoginSuccess: () => void;
  onSwitchToBayTerminal?: () => void;
}

type AuthMode = 'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AUTH_MODES: { id: AuthMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'SIGN_IN', label: 'Sign In', icon: Lock },
  { id: 'REGISTER', label: 'Register User', icon: BadgeCheck },
  { id: 'FORGOT_PASSWORD', label: 'Forgot Password', icon: KeyRound },
];

export const DesktopAuthScreen: React.FC<DesktopAuthScreenProps> = ({
  onLoginSuccess,
  onSwitchToBayTerminal,
}) => {
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');

  // Sign In State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('MANAGER');
  const [regBranchId, setRegBranchId] = useState(INITIAL_BRANCHES[0].id);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isOnline = syncEngine.getIsOnline();

  const regPasswordStrength: PasswordStrengthResult = evaluatePasswordStrength(regPassword);
  const newPasswordStrength: PasswordStrengthResult = evaluatePasswordStrength(newPassword);

  const handleSelectDemoUser = (demoUser: (typeof DEMO_USERS)[0]) => {
    setMode('SIGN_IN');
    setIdentifier(demoUser.username || demoUser.email);
    setPassword(demoUser.password || 'AutoPulse@2026!');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authEngine.loginWithCredentials(identifier, password, rememberWorkstation);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!regPasswordStrength.isValid) {
      setErrorMessage(`Password requirement not met: ${regPasswordStrength.errors.join(', ')}.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authEngine.registerDesktopUser({
        name: regName,
        username: regUsername,
        email: regEmail,
        role: regRole,
        branchId: regBranchId,
        password: regPassword,
        phone: regPhone,
      });
      setIsLoading(false);

      if (res.success) {
        setSuccessMessage(`Account created successfully for ${res.user?.name}! Logging you in...`);
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setErrorMessage(res.error || 'Failed to create user account.');
      }
    }, 300);
  };

  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authEngine.requestPasswordRecovery(recoveryIdentifier);
      setIsLoading(false);
      if (res.success && res.code) {
        setSimulatedCode(res.code);
        setRecoveryCode(res.code);
        setRecoveryStep(2);
        setSuccessMessage(
          `Security verification code dispatched to ${res.user?.email || 'work email'}.`
        );
      } else {
        setErrorMessage(res.error || 'Identifier not found in workspace staff directory.');
      }
    }, 300);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authEngine.verifyRecoveryCode(recoveryIdentifier, recoveryCode);
      setIsLoading(false);
      if (res.success) {
        setRecoveryStep(3);
        setSuccessMessage('Verification confirmed! Please set your new strong master password.');
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification code.');
      }
    }, 250);
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== newConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!newPasswordStrength.isValid) {
      setErrorMessage(`Password requirement not met: ${newPasswordStrength.errors.join(', ')}.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authEngine.completePasswordReset(recoveryIdentifier, recoveryCode, newPassword);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Password reset successfully! Authenticating your workstation...');
        setTimeout(() => {
          onLoginSuccess();
        }, 550);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    }, 300);
  };

  const activeModeIndex = AUTH_MODES.findIndex((m) => m.id === mode);

  const renderStrengthColor = (score: number) => {
    if (score === 4) return 'var(--accent-secondary)';
    if (score === 3) return 'var(--accent-primary)';
    if (score === 2) return 'var(--accent-amber)';
    return 'var(--accent-danger)';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div className="sg-auth-grid" style={{ position: 'relative' }}>
        {/* LEFT COLUMN: Diagnostic Bay Cabinet & Demo Directory */}
        <div
          style={{
            background: 'var(--bg-recessed)',
            color: 'var(--text-primary)',
            borderRight: '1px solid var(--border-strong)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div className="sg-hazard-strip" />
          <div style={{ padding: '32px 34px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '26px', flexWrap: 'wrap' }}>
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
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '0.03em' }}>
                    AUTOPULSE
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--accent-volt)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    GARAGE BAY OS // V2
                  </div>
                </div>
              </div>

              <span
                className={`sg-badge ${isOnline ? 'sg-badge-ready' : 'sg-badge-diagnosis'}`}
              >
                <span className={`sg-led ${isOnline ? 'sg-led-live' : 'sg-led-fault'}`} />
                {isOnline ? 'MESH NODE ACTIVE' : 'OFFLINE BUFFER'}
              </span>
            </div>

            <h1
              style={{
                fontSize: '34px',
                fontWeight: 800,
                lineHeight: 1.04,
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Automotive Service &amp; Multi-Bay Control
            </h1>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '24px' }}>
              Workshop command console for garage owners, service managers, auditors, and bay technicians.
              Real-time Wi-Fi sync, offline Room DB outbox, 360° chassis DVI, and repair invoicing.
            </p>

            {/* Quick Demo Access Directory */}
            <div className="sg-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--accent-primary)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    Quick Demo Profiles (1-Click Fill)
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  AutoPulse@2026!
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {DEMO_USERS.map((demo) => {
                  const meta = ROLE_METADATA[demo.role];
                  const isSelected = identifier === (demo.username || demo.email);
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemoUser(demo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 10px',
                        borderRadius: 'var(--radius-control)',
                        border: isSelected
                          ? '1px solid var(--accent-primary)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-recessed)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 140ms var(--ease-out-expo), background 140ms var(--ease-out-expo)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AvatarBadge src={demo.avatarUrl} name={demo.name} size={28} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>{demo.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                            @{demo.username} &middot; PIN {demo.pinCode}
                          </div>
                        </div>
                      </div>

                      <span
                        className="sg-badge"
                        style={{
                          background: meta.badgeBg,
                          color: meta.badgeColor,
                          borderColor: meta.borderColor,
                        }}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={14} color="var(--accent-primary)" />
              <span>RBAC Active &bull; Zero-Knowledge Wi-Fi Sync</span>
            </div>

            {onSwitchToBayTerminal && (
              <button
                type="button"
                onClick={onSwitchToBayTerminal}
                className="sg-btn sg-btn-volt sg-btn-sm"
              >
                <Smartphone size={13} /> Bay PIN Terminal
              </button>
            )}
          </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Auth Workbench */}
        <div
          style={{
            padding: '40px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div>
            {/* Sliding Navigation Tabs */}
            <div className="sg-segmented" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '26px' }}>
              <div
                className="sg-segmented-thumb"
                style={{
                  width: 'calc((100% - 6px) / 3)',
                  transform: `translateX(${activeModeIndex * 100}%)`,
                }}
              />
              {AUTH_MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className="sg-segmented-btn"
                    data-active={mode === m.id}
                    onClick={() => {
                      setMode(m.id);
                      if (m.id === 'FORGOT_PASSWORD') {
                        setRecoveryStep(1);
                        setRecoveryCode('');
                        setSimulatedCode(null);
                        setNewPassword('');
                        setNewConfirmPassword('');
                      }
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  background: 'var(--accent-danger-tint)',
                  border: '1px solid var(--accent-danger)',
                  color: 'var(--accent-danger)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  background: 'var(--accent-secondary-tint)',
                  border: '1px solid var(--accent-secondary)',
                  color: 'var(--accent-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. SIGN IN */}
            {mode === 'SIGN_IN' && (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="sg-label">Username or Work Email</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '13px' }}
                    />
                    <input
                      type="text"
                      className="sg-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. sarah.sterling or sarah.owner@autopulse.io"
                      required
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="sg-label" style={{ marginBottom: 0 }}>
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('FORGOT_PASSWORD');
                        setRecoveryIdentifier(identifier);
                        setRecoveryStep(1);
                        setRecoveryCode('');
                        setSimulatedCode(null);
                        setNewPassword('');
                        setNewConfirmPassword('');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '13px' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="sg-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your strong master password"
                      required
                      style={{ paddingLeft: '38px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '9px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberWorkstation}
                    onChange={(e) => setRememberWorkstation(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                  />
                  Remember this workstation for 30 days
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="sg-btn sg-btn-primary sg-btn-lg"
                  style={{ width: '100%' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Authenticating Workstation...
                    </>
                  ) : (
                    <>
                      Sign In to Workspace <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER NEW USER */}
            {mode === 'REGISTER' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="sg-label">Full Legal Name</label>
                    <input
                      type="text"
                      className="sg-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Liam Parker"
                      required
                    />
                  </div>
                  <div>
                    <label className="sg-label">Desired Username</label>
                    <input
                      type="text"
                      className="sg-input sg-input-mono"
                      value={regUsername}
                      onChange={(e) =>
                        setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                      }
                      placeholder="e.g. liam.parker"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div>
                    <label className="sg-label">Corporate Work Email</label>
                    <input
                      type="email"
                      className="sg-input"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="liam@autopulse.io"
                      required
                    />
                  </div>
                  <div>
                    <label className="sg-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="sg-input sg-input-mono"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 019-3321"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="sg-label">Organizational Role</label>
                    <select
                      className="sg-select"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                    >
                      <option value="OWNER">Franchise &amp; Garage Owner</option>
                      <option value="MANAGER">Workshop Manager / Foreman</option>
                      <option value="MECHANIC">Master Mechanic / Bay Tech</option>
                      <option value="ACCOUNTANT">Senior Accountant / Invoicing</option>
                      <option value="IT_ADMIN">IT &amp; Systems Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="sg-label">Assigned Garage Branch</label>
                    <select
                      className="sg-select"
                      value={regBranchId}
                      onChange={(e) => setRegBranchId(e.target.value)}
                    >
                      {INITIAL_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="sg-label">Strong Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className="sg-input"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Must be 8+ chars with uppercase, number & symbol"
                      required
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '9px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {regPassword.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                        <span style={{ fontWeight: 700, color: renderStrengthColor(regPasswordStrength.score) }}>
                          {regPasswordStrength.level}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '5px' }}>
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            style={{
                              background:
                                regPasswordStrength.score >= step
                                  ? renderStrengthColor(regPasswordStrength.score)
                                  : 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: regPasswordStrength.checks.minLength ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                          <Check size={12} /> 8+ Characters
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: regPasswordStrength.checks.hasUppercase && regPasswordStrength.checks.hasLowercase ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                          <Check size={12} /> Upper &amp; Lowercase
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: regPasswordStrength.checks.hasNumber ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                          <Check size={12} /> At least 1 Number
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: regPasswordStrength.checks.hasSpecial ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                          <Check size={12} /> Special Symbol (!@#$)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="sg-label">Confirm Password</label>
                  <input
                    type="password"
                    className="sg-input"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password exactly"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !regPasswordStrength.isValid}
                  className="sg-btn sg-btn-primary sg-btn-lg"
                  style={{ width: '100%' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Provisioning Credentials...
                    </>
                  ) : (
                    <>
                      Create Staff Account &amp; Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD 3-STEP WIZARD */}
            {mode === 'FORGOT_PASSWORD' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="sg-grid-matrix" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    { step: 1, label: '1. Identifier' },
                    { step: 2, label: '2. Verify Code' },
                    { step: 3, label: '3. New Password' },
                  ].map((item) => {
                    const active = recoveryStep >= item.step;
                    return (
                      <div
                        key={item.step}
                        className="sg-grid-cell"
                        style={{
                          padding: '10px',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: active ? 'var(--accent-primary)' : 'var(--bg-recessed)',
                          color: active ? 'var(--ink-on-accent)' : 'var(--text-muted)',
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>

                {recoveryStep === 1 && (
                  <form onSubmit={handleRequestRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Enter your AutoPulse username or registered work email. A 6-digit verification code will be
                      generated to reset your master credentials.
                    </p>
                    <div>
                      <label className="sg-label">Account Identifier</label>
                      <input
                        type="text"
                        className="sg-input"
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="e.g. sarah.sterling or marcus.mgr@autopulse.io"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="sg-btn sg-btn-primary sg-btn-lg" style={{ width: '100%' }}>
                      {isLoading ? 'Searching Directory...' : 'Dispatch Verification Code'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {recoveryStep === 2 && (
                  <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {simulatedCode && (
                      <div
                        style={{
                          padding: '12px 14px',
                          background: 'var(--accent-volt)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-control)',
                          color: 'var(--ink-on-accent)',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                          Simulated Corporate Email / SMS Relay:
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>
                          Your 6-Digit Security Code is:{' '}
                          <strong className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', letterSpacing: '2px' }}>
                            {simulatedCode}
                          </strong>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="sg-label">Enter 6-Digit Recovery Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="sg-input sg-input-mono tabular"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        required
                        style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', letterSpacing: '8px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || recoveryCode.length < 6}
                      className="sg-btn sg-btn-primary sg-btn-lg"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Verifying Code...' : 'Confirm Security Code'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {recoveryStep === 3 && (
                  <form onSubmit={handleCompleteReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="sg-label">New Strong Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="sg-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, uppercase, number & symbol"
                          required
                          style={{ paddingRight: '42px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '9px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {newPassword.length > 0 && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                            <span style={{ fontWeight: 700, color: renderStrengthColor(newPasswordStrength.score) }}>
                              {newPasswordStrength.level}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '5px' }}>
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                style={{
                                  background:
                                    newPasswordStrength.score >= step
                                      ? renderStrengthColor(newPasswordStrength.score)
                                      : 'var(--bg-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="sg-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="sg-input"
                        value={newConfirmPassword}
                        onChange={(e) => setNewConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !newPasswordStrength.isValid}
                      className="sg-btn sg-btn-primary sg-btn-lg"
                      style={{ width: '100%' }}
                    >
                      {isLoading ? 'Updating Master Password...' : 'Save Password & Authenticate'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            AutoPulse Enterprise &bull; RBAC Active &bull; Zero-Knowledge Sync
          </div>
        </div>
      </div>
    </div>
  );
};
