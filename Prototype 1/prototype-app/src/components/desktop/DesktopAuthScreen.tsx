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
  Check 
} from 'lucide-react';
import { authEngine, evaluatePasswordStrength, DEMO_USERS, PasswordStrengthResult } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { UserRole } from '../../types';
import { INITIAL_BRANCHES } from '../../data/mockData';

interface DesktopAuthScreenProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD';

export const DesktopAuthScreen: React.FC<DesktopAuthScreenProps> = ({ onLoginSuccess }) => {
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

  // Evaluate password strength in real time
  const regPasswordStrength: PasswordStrengthResult = evaluatePasswordStrength(regPassword);
  const newPasswordStrength: PasswordStrengthResult = evaluatePasswordStrength(newPassword);

  // Quick Demo User Preset Filler
  const handleSelectDemoUser = (demoUser: typeof DEMO_USERS[0]) => {
    setMode('SIGN_IN');
    setIdentifier(demoUser.username || demoUser.email);
    setPassword(demoUser.password || 'AutoPulse@2026!');
    setErrorMessage(null);
  };

  // -------------------------------------------------------------
  // Sign In Handler
  // -------------------------------------------------------------
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authEngine.loginWithCredentials(identifier, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 350);
  };

  // -------------------------------------------------------------
  // Register Handler
  // -------------------------------------------------------------
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
        }, 600);
      } else {
        setErrorMessage(res.error || 'Failed to create user account.');
      }
    }, 450);
  };

  // -------------------------------------------------------------
  // Password Recovery Handlers
  // -------------------------------------------------------------
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
        setRecoveryCode(res.code); // Pre-fill in prototype for frictionless testing!
        setRecoveryStep(2);
        setSuccessMessage(`Security verification code dispatched to ${res.user?.email || 'work email'}.`);
      } else {
        setErrorMessage(res.error || 'Identifier not found in workspace staff directory.');
      }
    }, 400);
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
    }, 350);
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
        }, 700);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    }, 450);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(ellipse at 15% 25%, #0d1a33 0%, #060b14 65%, #02050a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      boxSizing: 'border-box',
      position: 'relative',
      overflowX: 'hidden',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Background Cyber Mesh Glow Highlights */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '5%',
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(50px)',
      }} />

      {/* Main Enterprise Container */}
      <div style={{
        width: '100%',
        maxWidth: '1240px',
        minHeight: '680px',
        borderRadius: '24px',
        background: 'rgba(13, 20, 36, 0.7)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1.15fr',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Enterprise Telemetry & Quick Credentials   */}
        {/* ======================================================== */}
        <div style={{
          padding: '48px 44px',
          background: 'linear-gradient(160deg, rgba(17, 27, 49, 0.8) 0%, rgba(8, 14, 26, 0.95) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Header Badge & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                  fontWeight: 900,
                  fontSize: '20px',
                  letterSpacing: '-0.5px',
                  color: 'white',
                }}>
                  AP
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#ffffff' }}>
                    AutoPulse
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-cyan, #06b6d4)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Enterprise Workshop OS
                  </div>
                </div>
              </div>

              {/* Edge Node Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#ef4444',
                  boxShadow: isOnline ? '0 0 10px #10b981' : 'none',
                }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: isOnline ? '#34d399' : '#f87171' }}>
                  {isOnline ? 'Mesh Node Active' : 'Offline Buffer'}
                </span>
              </div>
            </div>

            {/* Hero Value Statement */}
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
              color: '#ffffff',
              margin: '0 0 14px 0',
            }}>
              High-Precision Garage &amp; Multi-Branch Management
            </h1>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(226, 232, 240, 0.7)',
              margin: '0 0 32px 0',
            }}>
              Desktop portal for workshop owners, managers, and service advisors. Complete with real-time bay telemetry, automated labor billing, and multi-branch inventory tracking.
            </p>

            {/* Quick Demo Access Bar */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '28px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="#06b6d4" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Quick Demo Profiles (1-Click Fill)
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  AutoPulse@2026!
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={demo.avatarUrl}
                          alt={demo.name}
                          style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                            {demo.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                            @{demo.username}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                        color: meta.badgeColor || '#06b6d4',
                      }}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            <Shield size={14} color="#06b6d4" />
            <span>Multi-Factor Workstation Security &bull; Zero-Knowledge Wi-Fi Mesh Relay</span>
          </div>
        </div>


        {/* ======================================================== */}
        {/* RIGHT COLUMN: Interactive Form (Sign In, Reg, Forgot)     */}
        {/* ======================================================== */}
        <div style={{
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(10, 16, 30, 0.85)',
          overflowY: 'auto',
          maxHeight: '820px',
        }}>
          
          <div>
            {/* Top Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '32px',
            }}>
              <button
                type="button"
                onClick={() => { setMode('SIGN_IN'); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'SIGN_IN' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: mode === 'SIGN_IN' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  borderBottom: mode === 'SIGN_IN' ? '2px solid #06b6d4' : '2px solid transparent',
                }}
              >
                <Lock size={14} />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => { setMode('REGISTER'); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'REGISTER' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: mode === 'REGISTER' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  borderBottom: mode === 'REGISTER' ? '2px solid #06b6d4' : '2px solid transparent',
                }}
              >
                <BadgeCheck size={14} />
                Register New User
              </button>

              <button
                type="button"
                onClick={() => { setMode('FORGOT_PASSWORD'); setRecoveryStep(1); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'FORGOT_PASSWORD' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: mode === 'FORGOT_PASSWORD' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  borderBottom: mode === 'FORGOT_PASSWORD' ? '2px solid #06b6d4' : '2px solid transparent',
                }}
              >
                <KeyRound size={14} />
                Forgot Password
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '13px',
                marginBottom: '24px',
                lineHeight: 1.4,
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                fontSize: '13px',
                marginBottom: '24px',
                lineHeight: 1.4,
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. SIGN IN FORM                                         */}
            {/* ======================================================== */}
            {mode === 'SIGN_IN' && (
              <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: '22px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#e2e8f0',
                    marginBottom: '8px',
                  }}>
                    Username or Work Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}>
                      <UserIcon size={18} />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. sarah.sterling or sarah.owner@autopulse.io"
                      required
                      style={{
                        width: '100%',
                        padding: '13px 14px 13px 44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('FORGOT_PASSWORD');
                        setRecoveryIdentifier(identifier);
                        setRecoveryStep(1);
                        setErrorMessage(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan, #38bdf8)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your strong master password"
                      required
                      style={{
                        width: '100%',
                        padding: '13px 46px 13px 44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        letterSpacing: showPassword ? 'normal' : '2px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Station Checkbox */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '28px',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <input
                      type="checkbox"
                      checked={rememberWorkstation}
                      onChange={(e) => setRememberWorkstation(e.target.checked)}
                      style={{ accentColor: '#06b6d4', width: '16px', height: '16px', borderRadius: '4px' }}
                    />
                    Remember this workstation for 30 days
                  </label>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '15px 24px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Authenticating Workstation...
                    </>
                  ) : (
                    <>
                      Sign In to Workspace
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* 2. REGISTER NEW USER FORM                                */}
            {/* ======================================================== */}
            {mode === 'REGISTER' && (
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Liam Parker"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Desired Username
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      placeholder="e.g. liam.parker"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Corporate Work Email
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="liam@autopulse.io"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 019-3321"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Organizational Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: '#0d1322',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="OWNER">Franchise &amp; Garage Owner</option>
                      <option value="MANAGER">Workshop Manager / Foreman</option>
                      <option value="MECHANIC">Master Mechanic / Bay Tech</option>
                      <option value="ACCOUNTANT">Senior Accountant / Invoicing</option>
                      <option value="IT_ADMIN">IT &amp; Systems Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Assigned Garage Branch
                    </label>
                    <select
                      value={regBranchId}
                      onChange={(e) => setRegBranchId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: '#0d1322',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {INITIAL_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password Fields with Real-time Strength Meter */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                    Strong Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Must be 8+ chars with uppercase, number & symbol"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 44px 11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Visual Strength Progress Bar */}
                  {regPassword.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          Password Strength:
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: regPasswordStrength.score === 4 ? '#10b981' :
                                 regPasswordStrength.score === 3 ? '#38bdf8' :
                                 regPasswordStrength.score === 2 ? '#f59e0b' : '#ef4444',
                        }}>
                          {regPasswordStrength.level}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '4px' }}>
                        {[1, 2, 3, 4].map((step) => {
                          const isActive = regPasswordStrength.score >= step;
                          const barColor =
                            regPasswordStrength.score === 4 ? '#10b981' :
                            regPasswordStrength.score === 3 ? '#38bdf8' :
                            regPasswordStrength.score === 2 ? '#f59e0b' : '#ef4444';
                          return (
                            <div
                              key={step}
                              style={{
                                borderRadius: '2px',
                                background: isActive ? barColor : 'rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.2s ease',
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Criteria Checklist */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        marginTop: '8px',
                        fontSize: '11px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: regPasswordStrength.checks.minLength ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>
                          <Check size={12} /> 8+ Characters
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (regPasswordStrength.checks.hasUppercase && regPasswordStrength.checks.hasLowercase) ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>
                          <Check size={12} /> Upper &amp; Lowercase
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: regPasswordStrength.checks.hasNumber ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>
                          <Check size={12} /> At least 1 Number
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: regPasswordStrength.checks.hasSpecial ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>
                          <Check size={12} /> Special Symbol (!@#$)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password exactly"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !regPasswordStrength.isValid}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: regPasswordStrength.isValid
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: regPasswordStrength.isValid ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 800,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: regPasswordStrength.isValid && !isLoading ? 'pointer' : 'not-allowed',
                    boxShadow: regPasswordStrength.isValid ? '0 8px 24px rgba(6, 182, 212, 0.35)' : 'none',
                  }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Provisioning Enterprise Credentials...
                    </>
                  ) : (
                    <>
                      Create Staff Account &amp; Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* 3. FORGOT PASSWORD FLOW (3-Step Wizard)                  */}
            {/* ======================================================== */}
            {mode === 'FORGOT_PASSWORD' && (
              <div>
                {/* Step indicator header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  padding: '10px 16px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: recoveryStep >= 1 ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      1
                    </div>
                    <span style={{ fontSize: '12px', color: recoveryStep === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                      Identifier
                    </span>
                  </div>

                  <div style={{ width: '20px', height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: recoveryStep >= 2 ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      2
                    </div>
                    <span style={{ fontSize: '12px', color: recoveryStep === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                      Verify Code
                    </span>
                  </div>

                  <div style={{ width: '20px', height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: recoveryStep >= 3 ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      3
                    </div>
                    <span style={{ fontSize: '12px', color: recoveryStep === 3 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                      New Password
                    </span>
                  </div>
                </div>

                {/* Step 1: Request code */}
                {recoveryStep === 1 && (
                  <form onSubmit={handleRequestRecovery}>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, marginBottom: '20px' }}>
                      Enter your AutoPulse username or registered work email. We will generate a secure 6-digit verification code to reset your master credentials.
                    </p>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                        Account Identifier
                      </label>
                      <input
                        type="text"
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="e.g. sarah.sterling or marcus.mgr@autopulse.io"
                        required
                        style={{
                          width: '100%',
                          padding: '13px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                      }}
                    >
                      {isLoading ? 'Searching Directory...' : 'Dispatch Verification Code'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {/* Step 2: Verification Code */}
                {recoveryStep === 2 && (
                  <form onSubmit={handleVerifyCode}>
                    {simulatedCode && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        marginBottom: '20px',
                      }}>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                          Simulated Corporate Email / SMS Relay:
                        </div>
                        <div style={{ fontSize: '14px', color: '#ffffff' }}>
                          Your 6-Digit One-Time Security Code is: <strong style={{ color: '#06b6d4', letterSpacing: '2px', fontSize: '16px' }}>{simulatedCode}</strong>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                        Enter 6-Digit Recovery Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '22px',
                          fontWeight: 800,
                          textAlign: 'center',
                          letterSpacing: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || recoveryCode.length < 6}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: recoveryCode.length === 6 ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: recoveryCode.length === 6 ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: recoveryCode.length === 6 && !isLoading ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {isLoading ? 'Verifying Code...' : 'Confirm Security Code'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {recoveryStep === 3 && (
                  <form onSubmit={handleCompleteReset}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        New Strong Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, uppercase, number & symbol"
                          required
                          style={{
                            width: '100%',
                            padding: '11px 44px 11px 14px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#ffffff',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                          }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Strength indicator */}
                      {newPassword.length > 0 && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Strength:</span>
                            <span style={{
                              fontWeight: 800,
                              color: newPasswordStrength.score === 4 ? '#10b981' :
                                     newPasswordStrength.score === 3 ? '#38bdf8' :
                                     newPasswordStrength.score === 2 ? '#f59e0b' : '#ef4444',
                            }}>
                              {newPasswordStrength.level}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '4px' }}>
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                style={{
                                  borderRadius: '2px',
                                  background: newPasswordStrength.score >= step
                                    ? (newPasswordStrength.score === 4 ? '#10b981' : '#38bdf8')
                                    : 'rgba(255, 255, 255, 0.1)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={newConfirmPassword}
                        onChange={(e) => setNewConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !newPasswordStrength.isValid}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: newPasswordStrength.isValid ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: newPasswordStrength.isValid ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: newPasswordStrength.isValid && !isLoading ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {isLoading ? 'Updating Master Password...' : 'Save Password & Authenticate'}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom helper link */}
          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            AutoPulse Enterprise &bull; Role-Based Access Control Active &bull; Zero-Knowledge Sync
          </div>
        </div>

      </div>
    </div>
  );
};
