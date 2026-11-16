import React from 'react';
import {
  ClipboardList,
  Boxes,
  Users,
  DollarSign,
  ShieldCheck,
  Wrench,
  LucideIcon,
} from 'lucide-react';
import { User, MobileTab, JobCard, InventoryItem, SyncMutation } from '../../types';
import { getAccessibleModules } from '../../modules/moduleRegistry';

export type { MobileTab };

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  user: User | null;
  state: {
    jobs: JobCard[];
    inventory: InventoryItem[];
    outbox: SyncMutation[];
  };
}

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Boxes,
  Users,
  DollarSign,
  ShieldCheck,
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  user,
  state,
}) => {
  const accessibleModules = getAccessibleModules(user);
  const columnCount = accessibleModules.length || 1;

  return (
    <nav
      aria-label="Bay Terminal Modules"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '2px solid var(--border-strong)',
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {accessibleModules.map((mod) => {
        const Icon = ICON_MAP[mod.iconName] || ClipboardList;
        const isActive = activeTab === mod.id;
        const badge = mod.badgeCount ? mod.badgeCount(state) : 0;

        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onTabChange(mod.id)}
            style={{
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              border: 'none',
              borderTop: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              borderRight: '1px solid var(--border-subtle)',
              padding: '10px 4px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              transition: 'background-color 140ms var(--ease-out-expo), color 140ms var(--ease-out-expo)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              {badge > 0 && (
                <span
                  className="tabular"
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-12px',
                    background:
                      mod.id === 'inventory'
                        ? 'var(--accent-volt)'
                        : mod.id === 'admin'
                        ? 'var(--accent-danger-solid)'
                        : 'var(--accent-primary)',
                    color: mod.id === 'admin' ? '#FFFFFF' : 'var(--ink-on-accent)',
                    border: '1px solid var(--bg-recessed)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 4px',
                    lineHeight: 1,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 600,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {mod.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
