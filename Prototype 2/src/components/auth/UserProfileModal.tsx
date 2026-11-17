import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  Shield,
  CheckCircle2,
  KeyRound,
  Clock,
  UserPlus,
  Link2,
} from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { ROLE_METADATA, ROLE_PERMISSIONS } from '../../auth/permissions';
import { User } from '../../types';
import { PinResetModal } from './PinResetModal';
import { PinChallengeModal } from './PinChallengeModal';
import { RegisterUserModal } from './RegisterUserModal';
import { AvatarBadge } from '../shared/AvatarBadge';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(authEngine.getAvailableUsers());
  const [isPinResetModalOpen, setIsPinResetModalOpen] = useState(false);
  const [showMyPin, setShowMyPin] = useState(false);
  const [challengeTargetUser, setChallengeTargetUser] = useState<User | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState<'REGISTER' | 'LINK'>('REGISTER');

  useEffect(() => {
    const unsub = authEngine.subscribe(() => {
      setAvailableUsers(authEngine.getAvailableUsers());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const roleMeta = ROLE_METADATA[user.role];
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const activeRequest = authEngine.getActiveRequestForUser(user.id);
  const isPrompted = activeRequest?.status === 'PROMPTED';
  const isPending = activeRequest?.status === 'PENDING';

  const handleSwitchAccount = (u: User) => {
    if (u.id === user.id) return;
    setChallengeTargetUser(u);
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Staff Profile and Security">
      <div className="sg-modal" style={{ maxWidth: '620px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={17} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Staff Profile &amp; Security Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close profile"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Identity Card */}
          <div
            className="sg-panel-muted"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <AvatarBadge src={user.avatarUrl} name={user.name} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '17px', fontWeight: 700 }}>{user.name}</h4>
                <span
                  className="sg-badge"
                  style={{
                    color: roleMeta.badgeColor,
                    background: roleMeta.badgeBg,
                    borderColor: roleMeta.borderColor,
                  }}
                >
                  {user.role}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
                {user.jobTitle}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {user.email} &bull; {user.phone}
              </div>
            </div>
          </div>

          {/* Workshop Tablet PIN Security */}
          <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span className="sg-label" style={{ marginBottom: 0 }}>
                Workshop Tablet PIN Security
              </span>
              <span className="sg-badge sg-badge-ready">Zero-Knowledge Vault</span>
            </div>

            <div
              className="sg-panel-muted"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>My Current PIN:</span>
                <span
                  className="tabular"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: showMyPin ? '3px' : '4px',
                  }}
                >
                  {showMyPin ? user.pinCode : '••••'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowMyPin(!showMyPin)}
                className="sg-btn sg-btn-secondary sg-btn-sm"
              >
                {showMyPin ? 'Hide' : 'Reveal'}
              </button>
            </div>

            {isPrompted ? (
              <div
                style={{
                  background: 'var(--accent-secondary-tint)',
                  border: '1px solid var(--accent-secondary)',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} />
                  <span>IT Admin has dispatched your reset prompt!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPinResetModalOpen(true)}
                  className="sg-btn sg-btn-emerald sg-btn-sm"
                >
                  Set New PIN
                </button>
              </div>
            ) : isPending ? (
              <div
                style={{
                  background: 'var(--accent-amber-tint)',
                  border: '1px solid var(--accent-amber)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-amber)',
                }}
              >
                <Clock size={14} />
                <span>Reset request submitted. Awaiting IT Administrator dispatch.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPinResetModalOpen(true)}
                className="sg-btn sg-btn-secondary"
                style={{ width: '100%' }}
              >
                <KeyRound size={14} /> Request PIN Reset from IT Administrator
              </button>
            )}
          </div>

          {/* Quick Switch Account */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <span className="sg-label" style={{ marginBottom: 0 }}>
                Switch Account ({availableUsers.length} active on device)
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMode('REGISTER');
                    setIsRegisterModalOpen(true);
                  }}
                  className="sg-btn sg-btn-volt sg-btn-sm"
                >
                  <UserPlus size={12} /> Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMode('LINK');
                    setIsRegisterModalOpen(true);
                  }}
                  className="sg-btn sg-btn-secondary sg-btn-sm"
                >
                  <Link2 size={12} /> Link Cloud
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableUsers.map((u) => {
                const isSelected = u.id === user.id;
                const meta = ROLE_METADATA[u.role];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSwitchAccount(u)}
                    className="sg-btn"
                    style={{
                      padding: '8px 12px',
                      flexDirection: 'column',
                      gap: '4px',
                      minWidth: '84px',
                      background: isSelected ? meta.badgeBg : 'var(--bg-surface)',
                      borderWidth: isSelected ? '2px' : '1px',
                      borderColor: isSelected ? meta.borderColor : 'var(--border-strong)',
                    }}
                  >
                    <AvatarBadge src={u.avatarUrl} name={u.name} size={28} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {u.name.split(' ')[0]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                      {meta.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active RBAC Module Permissions */}
          <div>
            <span className="sg-label">Active Module Permissions ({permissions.length})</span>
            <div
              className="sg-panel-muted"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '12px',
              }}
            >
              {permissions.map((p) => (
                <span key={p} className="sg-badge sg-badge-intake" style={{ textTransform: 'none' }}>
                  <CheckCircle2 size={10} color="var(--accent-secondary)" /> {p}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="sg-btn sg-btn-danger sg-btn-lg"
            style={{ width: '100%' }}
          >
            <LogOut size={16} /> Sign Out of Workshop
          </button>
        </div>
      </div>

      <PinResetModal
        isOpen={isPinResetModalOpen}
        onClose={() => setIsPinResetModalOpen(false)}
        preselectedUserId={user.id}
        lockToPreselectedUser={true}
      />

      <PinChallengeModal
        isOpen={!!challengeTargetUser}
        onClose={() => setChallengeTargetUser(null)}
        targetUser={challengeTargetUser}
        onSuccess={() => {
          setChallengeTargetUser(null);
          onClose();
        }}
      />

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialMode={registerMode}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
};
