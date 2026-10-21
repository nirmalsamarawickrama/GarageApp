import React from 'react';
import { Wifi, WifiOff, CloudUpload, MapPin, ChevronDown, Radio } from 'lucide-react';
import { GarageBranch, User } from '../../types';
import { ROLE_METADATA } from '../../auth/permissions';

interface MobileHeaderProps {
  branches: GarageBranch[];
  activeBranchId: string;
  onSelectBranch: (id: string) => void;
  isOnline: boolean;
  outboxCount: number;
  onOpenOutbox: () => void;
  onToggleNetwork?: () => void;
  currentUser?: User | null;
  onOpenProfile?: () => void;
  onOpenWifiSync?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  branches,
  activeBranchId,
  onSelectBranch,
  isOnline,
  outboxCount,
  onOpenOutbox,
  onToggleNetwork,
  currentUser,
  onOpenProfile,
  onOpenWifiSync,
}) => {
  const roleMeta = currentUser ? ROLE_METADATA[currentUser.role] : null;

  return (
    <header style={{
      background: 'rgba(10, 15, 29, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(16px)',
    }}>
      {/* Top Row: App Brand & Connectivity / Profile Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            color: 'white',
            boxShadow: '0 2px 10px rgba(6,182,212,0.3)',
          }}>
            AP
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
              AutoPulse
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Garage Operating System
            </div>
          </div>
        </div>

        {/* Status Badges & User Profile Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Outbox Badge */}
          <button
            onClick={onOpenOutbox}
            title="View local offline mutation queue"
            style={{
              background: outboxCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${outboxCount > 0 ? 'rgba(245,158,11,0.4)' : 'var(--border-subtle)'}`,
              borderRadius: '20px',
              padding: '5px 9px',
              color: outboxCount > 0 ? '#fbbf24' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <CloudUpload size={13} />
            <span>{outboxCount > 0 ? `${outboxCount}` : '0'}</span>
          </button>

          {/* Online/Offline status pill */}
          <button
            onClick={onToggleNetwork}
            title="Tap to switch between Online and Offline Room DB mode"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              borderRadius: '20px',
              background: isOnline ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: isOnline ? 'var(--accent-emerald)' : '#f87171',
              fontSize: '11px',
              fontWeight: 700,
              cursor: onToggleNetwork ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          </button>

          {/* Wi-Fi PC Dev Link Pill */}
          <button
            onClick={onOpenWifiSync}
            title="Wi-Fi Dev Link: Connected to PC development server (192.168.1.5:5173). Tap to test or configure IP."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 8px',
              borderRadius: '20px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={12} />
            <span>PC Link</span>
          </button>

          {/* User Profile / Role Pill */}
          {currentUser && roleMeta && (
            <button
              onClick={onOpenProfile}
              title={`Logged in as ${currentUser.name} (${currentUser.role}). Tap to view profile or switch user.`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px 3px 4px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${roleMeta.borderColor}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: roleMeta.badgeColor,
                letterSpacing: '0.5px',
              }}>
                {currentUser.role === 'OWNER' ? 'OWNER' : currentUser.role === 'MANAGER' ? 'MGR' : currentUser.role === 'MECHANIC' ? 'MECH' : currentUser.role === 'ACCOUNTANT' ? 'ACCT' : 'IT'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Wide, Relaxed Branch Selector Pill */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '2px 10px 2px 12px',
      }}>
        <MapPin size={14} color="var(--accent-cyan)" style={{ marginRight: '8px', flexShrink: 0 }} />
        <select
          value={activeBranchId}
          onChange={(e) => onSelectBranch(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 24px 8px 0',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
          }}
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id} style={{ background: '#0f172a', color: 'white' }}>
              {b.name} &bull; {b.city}
            </option>
          ))}
        </select>
        <ChevronDown size={14} color="var(--text-dim)" style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
      </div>
    </header>
  );
};
