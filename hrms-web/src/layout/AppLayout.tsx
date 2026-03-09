import { Layout, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import Sidebar from './Sidebar';
import http from '../lib/http';

const toAbsoluteLogoUrl = (value?: string | null): string | null => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.startsWith('/') ? value : `/${value}`;
  const envBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const apiOrigin = envBaseURL
    ? envBaseURL.replace(/\/+$/, '').replace(/\/api$/, '')
    : '';

  return apiOrigin ? `${apiOrigin}${normalized}` : value;
};

const { Content, Sider, Header } = Layout;
const { Title } = Typography;

export default function AppLayout() {
  const location = useLocation();
  const [logoSrc, setLogoSrc] = useState<string>('/yara-hero.png');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const isConsultant = localStorage.getItem('isConsultant') === '1';
    const isPortfolioRoute = location.pathname.startsWith('/portfolio');
    if (!isConsultant || !isPortfolioRoute) {
      return;
    }

    const ensureConsultantWorkspaceContext = async () => {
      try {
        const res = await http.get('/api/v1/core/workspaces/my_workspaces/');
        const memberships = Array.isArray(res.data) ? res.data : [];
        if (!memberships.length) {
          return;
        }

        const consultantWs = memberships.find((m: any) => m?.workspace?.workspace_type === 'CONSULTANT');
        const defaultWs = memberships.find((m: any) => m?.is_default) || memberships[0];
        const homeWs = consultantWs || defaultWs;

        const homeWorkspaceId = String(homeWs?.workspace?.id || '');
        const homeWorkspaceName = String(homeWs?.workspace?.name || '');
        const homeWorkspaceRole = String(homeWs?.role || 'VIEWER');

        if (homeWorkspaceId) {
          localStorage.setItem('consultantHomeWorkspaceId', homeWorkspaceId);
          localStorage.setItem('consultantHomeWorkspaceName', homeWorkspaceName);
          localStorage.setItem('consultantHomeWorkspaceRole', homeWorkspaceRole);

          if (localStorage.getItem('workspaceId') !== homeWorkspaceId) {
            localStorage.setItem('workspaceId', homeWorkspaceId);
            localStorage.setItem('workspaceName', homeWorkspaceName);
            localStorage.setItem('workspaceRole', homeWorkspaceRole);
            window.dispatchEvent(new Event('workspaceChanged'));
          }
        }
      } catch {
        const homeWorkspaceId = localStorage.getItem('consultantHomeWorkspaceId');
        const homeWorkspaceName = localStorage.getItem('consultantHomeWorkspaceName');
        const homeWorkspaceRole = localStorage.getItem('consultantHomeWorkspaceRole');

        if (homeWorkspaceId && localStorage.getItem('workspaceId') !== homeWorkspaceId) {
          localStorage.setItem('workspaceId', homeWorkspaceId);
          if (homeWorkspaceName) localStorage.setItem('workspaceName', homeWorkspaceName);
          if (homeWorkspaceRole) localStorage.setItem('workspaceRole', homeWorkspaceRole);
          window.dispatchEvent(new Event('workspaceChanged'));
        }
      }
    };

    ensureConsultantWorkspaceContext();
  }, [location.pathname]);

  useEffect(() => {
    const fetchLogo = async () => {
      const workspaceId = localStorage.getItem('workspaceId');
      if (!workspaceId) {
        setLogoSrc('/yara-hero.png');
        setLogoError(false);
        return;
      }

      try {
        const res = await http.get(`/api/v1/core/workspaces/${workspaceId}/`);
        setLogoSrc(toAbsoluteLogoUrl(res.data?.logo) || '/yara-hero.png');
        setLogoError(false);
      } catch (error) {
        setLogoSrc('/yara-hero.png');
        setLogoError(false);
      }
    };

    const updateLogo = () => {
      fetchLogo();
    };

    fetchLogo();
    window.addEventListener('storage', updateLogo);
    window.addEventListener('companyLogoUpdated', updateLogo as EventListener);
    window.addEventListener('workspaceChanged', updateLogo as EventListener);
    return () => {
      window.removeEventListener('storage', updateLogo);
      window.removeEventListener('companyLogoUpdated', updateLogo as EventListener);
      window.removeEventListener('workspaceChanged', updateLogo as EventListener);
    };
  }, []);
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-panel) 50%, var(--bg-base) 100%)',
        position: 'relative',
      }}
    >
      {/* Radial glow from center-top - neon yellow hint */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 1200px 600px at center top, rgba(245, 196, 0, 0.05), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'repeating-linear-gradient(90deg, transparent, transparent 99px, rgba(245, 196, 0, 0.03) 99px, rgba(245, 196, 0, 0.03) 100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Sider
        width={240}
        style={{
          background: 'linear-gradient(180deg, rgba(11, 15, 26, 0.95) 0%, rgba(15, 22, 40, 0.9) 100%)',
          borderRight: '1px solid rgba(245, 196, 0, 0.15)',
          boxShadow: '4px 0 12px rgba(245, 196, 0, 0.1), inset -1px 0 12px rgba(62, 231, 255, 0.05)',
          position: 'fixed',
          zIndex: 1,
          overflowY: 'auto',
          maxHeight: '100vh',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
        }}
      >
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(245, 196, 0, 0.2)',
          background: 'linear-gradient(180deg, rgba(245, 196, 0, 0.05) 0%, transparent 100%)',
        }}>
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Company Logo"
              style={{ height: 52, objectFit: 'contain', marginBottom: 8, width: '100%' }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div>
              <div
                style={{
                  color: '#f5c400',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  fontFamily: "'Space Grotesk', sans-serif",
                  margin: 0,
                }}
              >
                HRMS
              </div>
              <div
                style={{
                  color: 'rgba(245, 196, 0, 0.5)',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                Neon Edition
              </div>
            </div>
          )}
        </div>
        <Sidebar activePath={location.pathname} />
      </Sider>
      <Layout style={{ background: 'transparent', position: 'relative', zIndex: 1, marginLeft: 240 }}>
        <Header
          style={{
            background: 'linear-gradient(90deg, rgba(11, 15, 26, 0.95) 0%, rgba(15, 22, 40, 0.92) 50%, rgba(11, 15, 26, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
            padding: 0,
            borderBottom: '1px solid rgba(245, 196, 0, 0.15)',
            boxShadow: '0 4px 16px rgba(245, 196, 0, 0.08), 0 1px 0 rgba(62, 231, 255, 0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <HeaderBar />
        </Header>
        <Content
          style={{
            margin: 24,
            background: 'transparent',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      {/* Footer Floater */}
      <div
        style={{
          position: 'fixed',
          right: 12,
          bottom: 12,
          background: 'linear-gradient(135deg, rgba(11, 15, 26, 0.85) 0%, rgba(15, 22, 40, 0.8) 100%)',
          color: '#f5c400',
          padding: '10px 14px',
          border: '1px solid rgba(245, 196, 0, 0.3)',
          borderRadius: 8,
          fontSize: 10,
          letterSpacing: '0.05em',
          boxShadow: '0 4px 12px rgba(245, 196, 0, 0.1)',
          zIndex: 3,
          fontWeight: 500,
        }}
      >
        <span>HRMS</span>
        <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>
        <span>Neon Edition</span>
      </div>
    </Layout>
  );
}
