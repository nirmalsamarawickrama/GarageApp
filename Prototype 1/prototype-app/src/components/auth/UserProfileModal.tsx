import React, { useState, useEffect } from 'react';
import { X, LogOut, Shield, CheckCircle2, KeyRound, Clock, UserPlus, Link2 } from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { ROLE_METADATA, ROLE_PERMISSIONS } from '../../auth/permissions';
import { User } from '../../types';
import { PinResetModal } from './PinResetModal';
import { PinChallengeModal } from './PinChallengeModal';
import { RegisterUserModal } from './RegisterUserModal';

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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        background: '#0d1322',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
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
            <Shield size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              Staff Profile &amp; Security Settings
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

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* User Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '18px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'white' }}>{user.name}</h3>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  color: roleMeta.badgeColor,
                  background: roleMeta.badgeBg,
                  border: `1px solid ${roleMeta.borderColor}`,
                  letterSpacing: '0.5px',
                }}>
                  {user.role}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {user.jobTitle}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                {user.email} &bull; {user.phone}
              </div>
            </div>
          </div>

          {/* Secure PIN Security Management Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Workshop Tablet PIN Security
              </div>
              <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ● Zero-Knowledge Vault
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>My Current PIN:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'white', letterSpacing: showMyPin ? '2px' : '4px' }}>
                  {showMyPin ? user.pinCode : '••••'}
                </span>
              </div>

              <button
                onClick={() => setShowMyPin(!showMyPin)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showMyPin ? 'Hide' : 'Reveal'}
              </button>
            </div>

            {/* Two-Way Authorization Reset Actions */}
            {isPrompted ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} />
                  <span>IT Admin has dispatched your reset prompt!</span>
                </div>
                <button
                  onClick={() => setIsPinResetModalOpen(true)}
                  style={{
                    background: 'var(--accent-emerald)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: '#080b11',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Set New PIN
                </button>
              </div>
            ) : isPending ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#fbbf24',
              }}>
                <Clock size={14} />
                <span>Reset request submitted. Awaiting IT Administrator dispatch.</span>
              </div>
            ) : (
              <button
                onClick={() => setIsPinResetModalOpen(true)}
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'var(--accent-cyan)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <KeyRound size={13} /> Request PIN Reset from IT Administrator
              </button>
            )}
          </div>

          {/* Quick Switch Persona */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Switch Account ({availableUsers.length} active on device)
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setRegisterMode('REGISTER');
                    setIsRegisterModalOpen(true);
                  }}
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    color: 'var(--accent-cyan)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <UserPlus size={11} /> Register
                </button>
                <button
                  onClick={() => {
                    setRegisterMode('LINK');
                    setIsRegisterModalOpen(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Link2 size={11} /> Link Cloud
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}>
              {availableUsers.map((u) => {
                const isSelected = u.id === user.id;
                const meta = ROLE_METADATA[u.role];
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchAccount(u)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${meta.badgeColor}` : '1px solid var(--border-subtle)',
                      background: isSelected ? meta.badgeBg : 'rgba(255,255,255,0.02)',
                      color: isSelected ? meta.badgeColor : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minWidth: '60px',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {u.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase' }}>
                      {u.role === 'OWNER' ? 'Owner' : u.role === 'MANAGER' ? 'Mgr' : u.role === 'MECHANIC' ? 'Mech' : u.role === 'ACCOUNTANT' ? 'Acct' : 'IT'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Permissions List */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Active Module Permissions ({permissions.length})
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              maxHeight: '160px',
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}>
              {permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    color: '#a5f3fc',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={10} color="#06b6d4" /> {p}
                </span>
              ))}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <LogOut size={16} /> Sign Out of Workshop
          </button>

        </div>
      </div>

      {/* Two-Way PIN Reset Modal */}
      <PinResetModal
        isOpen={isPinResetModalOpen}
        onClose={() => setIsPinResetModalOpen(false)}
        preselectedUserId={user.id}
      />

      {/* PIN Challenge Modal for Switching Accounts */}
      <PinChallengeModal
        isOpen={!!challengeTargetUser}
        onClose={() => setChallengeTargetUser(null)}
        targetUser={challengeTargetUser}
        onSuccess={() => {
          setChallengeTargetUser(null);
          onClose();
        }}
      />

      {/* Register / Link Cloud User Modal */}
      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialMode={registerMode}
        onSuccess={(_newUser) => {
          setIsRegisterModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
};

