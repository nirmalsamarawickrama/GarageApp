import React, { useState } from 'react';
import { X, Lock, Delete, AlertCircle } from 'lucide-react';
import { authEngine } from '../../auth/authEngine';
import { ROLE_METADATA } from '../../auth/permissions';
import { User } from '../../types';

interface PinChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onSuccess: (user: User) => void;
}

interface PinChallengeModalContentProps {
  onClose: () => void;
  targetUser: User;
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

const PinChallengeModalContent: React.FC<PinChallengeModalContentProps> = ({
  onClose,
  targetUser,
  onSuccess,
}) => {
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
            setTimeout(() => setIsShaking(false), 500);
            setEnteredPin('');
          }
        }, 150);
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#0d1322',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              Authentication Required
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

        {/* Content */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Target User Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  border: `2px solid ${roleMeta.borderColor}`,
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                color: roleMeta.badgeColor,
                background: roleMeta.badgeBg,
                border: `1px solid ${roleMeta.borderColor}`,
                whiteSpace: 'nowrap',
              }}>
                {targetUser.role}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
                {targetUser.name}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Enter 4-digit PIN to authorize account switch
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textAlign: 'center',
            }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PIN Dots Indicator with shake animation */}
          <div style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '20px',
            transform: isShaking ? 'translateX(-6px)' : 'none',
            transition: 'transform 0.1s ease',
          }}>
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
            maxWidth: '280px',
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((val) => {
              if (val === 'C') {
                return (
                  <button
                    key={val}
                    onClick={handleClear}
                    style={{
                      height: '56px',
                      borderRadius: '14px',
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
                    onClick={handleBackspace}
                    style={{
                      height: '56px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: 'var(--text-dim)',
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
                  onClick={() => handleDigit(val)}
                  style={{
                    height: '56px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '16px' }}>
            💡 Quick Hint: {targetUser.name}'s PIN is <strong style={{ color: 'var(--accent-cyan)' }}>{targetUser.pinCode}</strong>
          </div>

        </div>
      </div>
    </div>
  );
};
