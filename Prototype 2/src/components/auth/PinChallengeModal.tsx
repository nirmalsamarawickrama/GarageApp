import React, { useState } from 'react';
import { X, Lock, Delete, AlertCircle } from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { User } from '../../types';
import { AvatarBadge } from '../shared/AvatarBadge';

interface PinChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onSuccess: (user: User) => void;
}

export const PinChallengeModal: React.FC<PinChallengeModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) => {
  if (!isOpen || !targetUser) return null;
  return (
    <PinChallengeModalContent
      key={targetUser.id}
      targetUser={targetUser}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

const PinChallengeModalContent: React.FC<{
  onClose: () => void;
  targetUser: User;
  onSuccess: (user: User) => void;
}> = ({ onClose, targetUser, onSuccess }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const roleMeta = ROLE_METADATA[targetUser.role];

  const handleDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMessage(null);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const res = authEngine.verifyAndSwitchUser(targetUser.id, nextPin);
          if (res.success && res.user) {
            onSuccess(res.user);
          } else {
            setErrorMessage(res.error || 'Incorrect 4-digit PIN code.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 450);
            setEnteredPin('');
          }
        }, 120);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMessage(null);
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="PIN Authentication Challenge">
      <div className="sg-modal" style={{ maxWidth: '400px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Authentication Required</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close PIN challenge"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Target User Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <AvatarBadge src={targetUser.avatarUrl} name={targetUser.name} size={60} />
            <span
              className="sg-badge"
              style={{
                color: roleMeta.badgeColor,
                background: roleMeta.badgeBg,
                borderColor: roleMeta.borderColor,
              }}
            >
              {targetUser.role}
            </span>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{targetUser.name}</h4>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Enter 4-digit PIN to authorize account switch
              </div>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                width: '100%',
                background: 'var(--accent-danger-tint)',
                border: '1px solid var(--accent-danger)',
                color: 'var(--accent-danger)',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PIN Squares */}
          <div
            className={isShaking ? 'animate-shake' : ''}
            style={{ display: 'flex', gap: '12px' }}
          >
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
              maxWidth: '270px',
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((val) => {
              if (val === 'C') {
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={handleClear}
                    className="sg-btn sg-btn-secondary"
                    style={{ height: '52px', fontSize: '12px' }}
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
                    onClick={handleBackspace}
                    className="sg-btn sg-btn-secondary"
                    style={{ height: '52px' }}
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
                  onClick={() => handleDigit(val)}
                  className="sg-btn sg-btn-secondary tabular"
                  style={{
                    height: '52px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '19px',
                    fontWeight: 700,
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Zero-Knowledge Terminal &bull; Demo PINs: 1111 (Owner) &middot; 2222 (Mgr) &middot; 3333 (Mech) &middot; 4444 (Acct) &middot; 5555 (IT)
          </div>
        </div>
      </div>
    </div>
  );
};
