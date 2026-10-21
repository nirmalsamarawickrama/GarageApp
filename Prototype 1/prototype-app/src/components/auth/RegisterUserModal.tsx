import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  CloudUpload, 
  ArrowRight 
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { INITIAL_BRANCHES } from '../../data/mockData';
import { User, UserRole } from '../../types';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'REGISTER' | 'LINK';
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

export const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'REGISTER',
}) => {
  const [tabMode, setTabMode] = useState<'REGISTER' | 'LINK'>(initialMode);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MECHANIC');
  const [branchId, setBranchId] = useState('branch-1');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  
  // Link Form State
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPin, setLinkPin] = useState('');

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const isOnline = syncEngine.getIsOnline();
  const globalCloudUsers = authEngine.getGlobalCloudUsers();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pinCode.trim()) {
      setFeedback({ text: 'Name, email, and 4-digit PIN are required.', type: 'error' });
      return;
    }
    if (!/^\d{4}$/.test(pinCode)) {
      setFeedback({ text: 'PIN must be exactly 4 numeric digits.', type: 'error' });
      return;
    }

    const res = authEngine.registerNewUser({
      name: name.trim(),
      email: email.trim(),
      role,
      branchId,
      jobTitle: jobTitle.trim() || `${role} Specialist`,
      phone: phone.trim() || '+1 (555) 000-1122',
      pinCode,
      avatarUrl: selectedAvatar,
    });

    if (res.success && res.user) {
      const syncNote = isOnline
        ? 'Account registered and synchronized with global AutoPulse cloud.'
        : 'Account saved locally in Room SQLite. Queued in Outbox for cloud synchronization.';
      setFeedback({ text: syncNote, type: 'success' });
      
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 1400);
    } else {
      setFeedback({ text: res.error || 'Failed to register account.', type: 'error' });
    }
  };

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim() || !linkPin.trim()) {
      setFeedback({ text: 'Please enter both email and PIN.', type: 'error' });
      return;
    }

    const res = authEngine.linkExistingCloudAccount(linkEmail.trim(), linkPin.trim());
    if (res.success && res.user) {
      setFeedback({
        text: `Account for ${res.user.name} verified and linked to this device!`,
        type: 'success',
      });
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 1200);
    } else {
      setFeedback({ text: res.error || 'Authentication failed.', type: 'error' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        background: '#0d1322',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              Account Management &amp; Cloud Sync
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

        {/* Mode Toggle Tabs */}
        <div style={{
          padding: '12px 20px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          <button
            onClick={() => {
              setTabMode('REGISTER');
              setFeedback(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: tabMode === 'REGISTER' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              background: tabMode === 'REGISTER' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: tabMode === 'REGISTER' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={15} /> Register New User
          </button>

          <button
            onClick={() => {
              setTabMode('LINK');
              setFeedback(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: tabMode === 'LINK' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              background: tabMode === 'LINK' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: tabMode === 'LINK' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Link2 size={15} /> Link Existing Account
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Feedback Banner */}
          {feedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              color: feedback.type === 'success' ? '#34d399' : '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: REGISTER NEW USER */}
          {tabMode === 'REGISTER' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Scott"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Work Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@autopulse.io"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Workshop Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {(['OWNER', 'MANAGER', 'MECHANIC', 'ACCOUNTANT', 'IT_ADMIN'] as UserRole[]).map((r) => {
                    const meta = ROLE_METADATA[r];
                    const isSelected = role === r;
                    const label = r === 'OWNER' ? 'Owner' : r === 'MANAGER' ? 'Manager' : r === 'MECHANIC' ? 'Mechanic' : r === 'ACCOUNTANT' ? 'Accountant' : 'IT Admin';
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        style={{
                          padding: '8px 2px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${meta.badgeColor}` : '1px solid var(--border-subtle)',
                          background: isSelected ? meta.badgeBg : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? meta.badgeColor : 'var(--text-dim)',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branch & Job Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Garage Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  >
                    {INITIAL_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Master Tech / Bay 3"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>

              {/* Phone & 4-Digit PIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Create 4-Digit Tablet PIN *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '4px',
                    }}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Profile Avatar Preset</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedAvatar(url)}
                      style={{
                        padding: 0,
                        border: selectedAvatar === url ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                        borderRadius: '50%',
                        background: 'transparent',
                        cursor: 'pointer',
                        transform: selectedAvatar === url ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img
                        src={url}
                        alt="Preset"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloud Synchronization Indicator */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                  <CloudUpload size={14} color="var(--accent-cyan)" />
                  <span>Cloud Replication:</span>
                </div>
                <span style={{ color: isOnline ? 'var(--accent-emerald)' : '#f59e0b', fontWeight: 600 }}>
                  {isOnline ? 'Online (Instant Global Sync)' : 'Offline (Outbox Queue)'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
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
                Create Account &amp; Sync <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* TAB 2: LINK EXISTING CLOUD ACCOUNT */}
          {tabMode === 'LINK' && (
            <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Connect an existing user registered in the global cloud directory to this terminal. 
                Enter the registered email and 4-digit PIN to activate this account.
              </p>

              {/* Quick Select from Cloud Directory */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Cloud Accounts</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {globalCloudUsers.map((cu) => (
                    <div
                      key={cu.id}
                      onClick={() => setLinkEmail(cu.email)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: linkEmail === cu.email ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        border: linkEmail === cu.email ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={cu.avatarUrl} alt={cu.name} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                        <span style={{ color: 'white', fontWeight: 600 }}>{cu.name}</span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>({cu.email})</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{cu.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="name@autopulse.io"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* PIN Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>4-Digit Account PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={linkPin}
                  onChange={(e) => setLinkPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--accent-cyan)',
                    color: 'white',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '16px',
                    textAlign: 'center',
                    letterSpacing: '4px',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '8px',
                }}
              >
                Authenticate &amp; Link to Device <ArrowRight size={15} />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
