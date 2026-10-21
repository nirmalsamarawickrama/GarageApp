import React from 'react';
import { 
  ClipboardList, 
  Boxes, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Wrench,
  LucideIcon 
} from 'lucide-react';
import { User, MobileTab } from '../../types';
import { getAccessibleModules } from '../../modules/moduleRegistry';

export type { MobileTab };

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  user: User | null;
  state: {
    jobs: any[];
    inventory: any[];
    outbox: any[];
  };
}

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench: Wrench,
  Boxes: Boxes,
  Users: Users,
  DollarSign: DollarSign,
  ShieldCheck: ShieldCheck,
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
    <nav style={{
      background: 'rgba(10, 15, 29, 0.96)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      padding: '8px 8px 14px',
      position: 'relative',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.4)',
    }}>
      {accessibleModules.map((mod) => {
        const Icon = ICON_MAP[mod.iconName] || ClipboardList;
        const isActive = activeTab === mod.id;
        const badge = mod.badgeCount ? mod.badgeCount(state) : 0;

        return (
          <button
            key={mod.id}
            onClick={() => onTabChange(mod.id)}
            style={{
              background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
              borderRadius: '16px',
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-dim)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-10px',
                  background: mod.id === 'inventory' ? '#f59e0b' : mod.id === 'admin' ? '#f43f5e' : 'var(--accent-cyan)',
                  color: '#080b11',
                  fontSize: '9px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 5px',
                  lineHeight: '1',
                }}>
                  {badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}>
              {mod.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
