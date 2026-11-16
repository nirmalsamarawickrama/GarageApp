import React from 'react';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  MapPin,
  ChevronDown,
  Radio,
  Monitor,
} from 'lucide-react';
import { GarageBranch, User } from '../../types';
import { ROLE_METADATA } from '../../auth/permissions';
import { AvatarBadge } from '../shared/AvatarBadge';

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
  onSwitchToDesktop?: () => void;
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
  onSwitchToDesktop,
}) => {
  const roleMeta = currentUser ? ROLE_METADATA[currentUser.role] : null;

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '2px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div className="sg-hazard-strip" />
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Top Row: Brand & Telemetry Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-control)',
              background: 'var(--accent-primary)',
              color: 'var(--ink-on-accent)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '17px',
              flexShrink: 0,
            }}
          >
            AP
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase' }}>
              AutoPulse
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className={`sg-led ${isOnline ? 'sg-led-live' : 'sg-led-fault'}`} />
              <span>GARAGE BAY OS</span>
            </div>
          </div>
        </div>

        {/* Status Badges & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onOpenOutbox}
            title="View local offline mutation queue"
            className="sg-btn sg-btn-sm tabular"
            style={{
              minHeight: '30px',
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              background: outboxCount > 0 ? 'var(--accent-amber-tint)' : 'var(--bg-elevated)',
              color: outboxCount > 0 ? 'var(--accent-amber)' : 'var(--text-primary)',
              borderColor: outboxCount > 0 ? 'var(--accent-amber)' : 'var(--border-strong)',
            }}
          >
            <CloudUpload size={13} />
            <span>{outboxCount}</span>
          </button>

          <button
            type="button"
            onClick={onToggleNetwork}
            title="Toggle Online / Offline Room DB mode"
            className="sg-btn sg-btn-sm"
            style={{
              minHeight: '30px',
              padding: '3px 8px',
              background: isOnline ? 'var(--accent-secondary-tint)' : 'var(--accent-danger-tint)',
              color: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
              borderColor: isOnline ? 'var(--accent-secondary)' : 'var(--accent-danger)',
            }}
            aria-label={isOnline ? 'Online Mode' : 'Offline Mode'}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          </button>

          <button
            type="button"
            onClick={onOpenWifiSync}
            title="Configure PC Wi-Fi SSE Dev Link"
            className="sg-btn sg-btn-secondary sg-btn-sm"
            style={{ minHeight: '30px', padding: '3px 8px', fontSize: '11px' }}
          >
            <Radio size={12} color="var(--accent-primary)" />
            <span>Link</span>
          </button>

          {onSwitchToDesktop && (
            <button
              type="button"
              onClick={onSwitchToDesktop}
              title="Open Desktop Command View"
              className="sg-btn sg-btn-volt sg-btn-sm"
              style={{ minHeight: '30px', padding: '3px 8px', fontSize: '11px' }}
            >
              <Monitor size={12} />
            </button>
          )}

          {currentUser && roleMeta && (
            <button
              type="button"
              onClick={onOpenProfile}
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
              className="sg-btn sg-btn-sm"
              style={{
                minHeight: '30px',
                padding: '2px 7px 2px 3px',
                background: roleMeta.badgeBg,
                color: roleMeta.badgeColor,
                borderColor: roleMeta.borderColor,
              }}
            >
              <AvatarBadge src={currentUser.avatarUrl} name={currentUser.name} size={22} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                {roleMeta.shortLabel}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Branch Selector */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin
          size={14}
          color="var(--accent-primary)"
          style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
        />
        <select
          className="sg-select"
          value={activeBranchId}
          onChange={(e) => onSelectBranch(e.target.value)}
          style={{
            paddingLeft: '32px',
            paddingRight: '28px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'var(--bg-elevated)',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
          aria-label="Select workshop branch"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} &bull; {b.city}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
        />
      </div>
      </div>
    </header>
  );
};
