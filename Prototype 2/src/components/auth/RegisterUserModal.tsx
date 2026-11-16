import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Link2,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  ArrowRight,
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { syncEngine } from '../../state/syncEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { INITIAL_BRANCHES } from '../../data/mockData';
import { User, UserRole } from '../../types';
import { AvatarBadge } from '../shared/AvatarBadge';

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

  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

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
        : 'Account saved locally in Room SQLite. Queued in Outbox for cloud sync.';
      setFeedback({ text: syncNote, type: 'success' });

      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 1000);
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
      }, 1000);
    } else {
      setFeedback({ text: res.error || 'Authentication failed.', type: 'error' });
    }
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Account Management and Cloud Sync">
      <div className="sg-modal" style={{ maxWidth: '540px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Account Management &amp; Cloud Sync</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sliding Toggle Tabs */}
          <div className="sg-segmented" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div
              className="sg-segmented-thumb"
              style={{
                width: 'calc((100% - 6px) / 2)',
                transform: `translateX(${tabMode === 'REGISTER' ? 0 : 100}%)`,
              }}
            />
            <button
              type="button"
              className="sg-segmented-btn"
              data-active={tabMode === 'REGISTER'}
              onClick={() => {
                setTabMode('REGISTER');
                setFeedback(null);
              }}
            >
              <UserPlus size={14} /> Register New User
            </button>
            <button
              type="button"
              className="sg-segmented-btn"
              data-active={tabMode === 'LINK'}
              onClick={() => {
                setTabMode('LINK');
                setFeedback(null);
              }}
            >
              <Link2 size={14} /> Link Existing Account
            </button>
          </div>

          {feedback && (
            <div
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 600,
                background:
                  feedback.type === 'success'
                    ? 'var(--accent-secondary-tint)'
                    : 'var(--accent-danger-tint)',
                border: `1px solid ${
                  feedback.type === 'success' ? 'var(--accent-secondary)' : 'var(--accent-danger)'
                }`,
                color:
                  feedback.type === 'success' ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.text}</span>
            </div>
          )}

          {tabMode === 'REGISTER' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="sg-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="sg-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Scott"
                  />
                </div>
                <div>
                  <label className="sg-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    className="sg-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@autopulse.io"
                  />
                </div>
              </div>

              <div>
                <label className="sg-label">Assigned Workshop Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {(['OWNER', 'MANAGER', 'MECHANIC', 'ACCOUNTANT', 'IT_ADMIN'] as UserRole[]).map(
                    (r) => {
                      const meta = ROLE_METADATA[r];
                      const isSelected = role === r;
                      return (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setRole(r)}
                          className="sg-btn sg-btn-sm"
                          style={{
                            minHeight: '36px',
                            padding: '4px',
                            fontSize: '11px',
                            background: isSelected ? meta.badgeBg : 'var(--bg-surface)',
                            color: isSelected ? meta.badgeColor : 'var(--text-muted)',
                            borderWidth: isSelected ? '2px' : '1px',
                            borderColor: isSelected ? meta.borderColor : 'var(--border-subtle)',
                          }}
                        >
                          {meta.shortLabel}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="sg-label">Assigned Garage Branch</label>
                  <select
                    className="sg-select"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    {INITIAL_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="sg-label">Job Title</label>
                  <input
                    type="text"
                    className="sg-input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Master Tech / Bay 3"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="sg-label">Phone Number</label>
                  <input
                    type="text"
                    className="sg-input sg-input-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                  />
                </div>

                <div>
                  <label className="sg-label" style={{ color: 'var(--accent-primary)' }}>
                    4-Digit Tablet PIN *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    className="sg-input sg-input-mono"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label className="sg-label">Profile Avatar Preset</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {AVATAR_PRESETS.map((url, i) => {
                    const isSelected = selectedAvatar === url;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setSelectedAvatar(url)}
                        style={{
                          padding: '2px',
                          border: isSelected
                            ? '2px solid var(--accent-primary)'
                            : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--accent-volt)' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <AvatarBadge src={url} name={`Preset ${i + 1}`} size={34} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="sg-panel-muted"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <CloudUpload size={14} color="var(--accent-primary)" />
                  <span>Cloud Replication:</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-amber)',
                  }}
                >
                  {isOnline ? 'ONLINE // INSTANT SYNC' : 'OFFLINE // OUTBOX QUEUE'}
                </span>
              </div>

              <button type="submit" className="sg-btn sg-btn-primary" style={{ width: '100%' }}>
                Create Account &amp; Sync <ArrowRight size={15} />
              </button>
            </form>
          )}

          {tabMode === 'LINK' && (
            <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Connect an existing user registered in the global cloud directory to this terminal.
                Select a staff member or enter their work email and 4-digit PIN.
              </p>

              <div>
                <label className="sg-label">Registered Cloud Accounts</label>
                <div
                  className="sg-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  {globalCloudUsers.map((cu) => {
                    const isSelected = linkEmail === cu.email;
                    return (
                      <button
                        type="button"
                        key={cu.id}
                        onClick={() => setLinkEmail(cu.email)}
                        style={{
                          padding: '8px 10px',
                          border: 'none',
                          borderBottom: '1px solid var(--border-subtle)',
                          borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                          background: isSelected ? 'var(--accent-primary-tint)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AvatarBadge src={cu.avatarUrl} name={cu.name} size={24} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cu.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                            ({cu.email})
                          </span>
                        </div>
                        <span className="sg-badge sg-badge-intake">{cu.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="sg-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="sg-input"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="name@autopulse.io"
                />
              </div>

              <div>
                <label className="sg-label" style={{ color: 'var(--accent-primary)' }}>
                  4-Digit Account PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  className="sg-input sg-input-mono"
                  value={linkPin}
                  onChange={(e) => setLinkPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '4px' }}
                />
              </div>

              <button type="submit" className="sg-btn sg-btn-primary" style={{ width: '100%' }}>
                Authenticate &amp; Link to Device <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
