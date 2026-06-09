/**
 * BottomNav — fixed bottom tab bar for mobile portrait.
 * Shows only on screens narrower than md (768px).
 */
import { Grid } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  HeartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { key: '/dashboard', icon: DashboardOutlined, label: 'Home' },
  { key: '/hcm/demography', icon: TeamOutlined, label: 'People' },
  { key: '/payroll/management', icon: MoneyCollectOutlined, label: 'Payroll' },
  { key: '/leave', icon: HeartOutlined, label: 'Leave' },
  { key: '__more__', icon: AppstoreOutlined, label: 'More' },
];

export default function BottomNav({ onMore }: { onMore: () => void }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const nav = useNavigate();
  const location = useLocation();

  if (!isMobile) return null;

  const isActive = (key: string) => {
    if (key === '__more__') return false;
    return location.pathname === key || location.pathname.startsWith(key + '/');
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--header-border)',
        display: 'flex',
        alignItems: 'stretch',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.key);
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            onClick={() => {
              if (item.key === '__more__') {
                onMore();
              } else {
                nav(item.key);
              }
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              position: 'relative',
              transition: 'opacity 0.15s',
            }}
          >
            {/* Active indicator dot */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            )}
            <Icon
              style={{
                fontSize: 20,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
                marginTop: active ? 4 : 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
