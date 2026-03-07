import { Button, Card, Form, Input, message, Typography } from 'antd';
import http from '../../lib/http';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Login() {
  const nav = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await http.post('/api/v1/auth/token/', values);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      // Get user's workspaces to decide landing page
      try {
        const wsRes = await http.get('/api/v1/core/workspaces/my_workspaces/');
        const memberships = wsRes.data;

        if (Array.isArray(memberships)) {
          if (memberships.length === 1) {
            // Single workspace user → set workspace and go to dashboard
            localStorage.setItem('workspaceId', String(memberships[0]?.workspace?.id));
            localStorage.setItem('workspaceRole', memberships[0]?.role || 'VIEWER');
            localStorage.setItem('isConsultant', '0');
            message.success('Welcome back');
            nav('/dashboard');
          } else if (memberships.length > 1) {
            // Multi-workspace user → prefer consultant workspace as Home/Portfolio context
            const consultantWs = memberships.find((m: any) => m?.workspace?.workspace_type === 'CONSULTANT');
            const defaultWs = memberships.find((m: any) => m.is_default) || memberships[0];
            const homeWs = consultantWs || defaultWs;

            localStorage.setItem('workspaceId', String(homeWs?.workspace?.id));
            localStorage.setItem('workspaceName', String(homeWs?.workspace?.name || ''));
            localStorage.setItem('workspaceRole', homeWs?.role || 'VIEWER');
            localStorage.setItem('consultantHomeWorkspaceId', String(homeWs?.workspace?.id));
            localStorage.setItem('consultantHomeWorkspaceName', String(homeWs?.workspace?.name || ''));
            localStorage.setItem('consultantHomeWorkspaceRole', homeWs?.role || 'VIEWER');
            localStorage.setItem('isConsultant', '1');
            message.success('Welcome back');
            nav('/portfolio');
          } else {
            // No workspaces
            localStorage.setItem('isConsultant', '0');
            message.error('No workspaces assigned');
          }
        }
      } catch (e) {
        // Fallback to dashboard if fetch fails
        localStorage.setItem('isConsultant', '0');
        message.success('Welcome back');
        nav('/dashboard');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      message.error(e?.response?.data?.detail || e?.message || 'Invalid credentials');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)',
        backgroundImage: 'url(/yara-hero.png)',
        backgroundSize: 'clamp(280px, 24vw, 520px)',
        backgroundPosition: 'top left',
        backgroundRepeat: 'repeat',
        backgroundBlendMode: 'overlay',
        position: 'relative',
      }}
    >
      {/* Circuit overlay pattern - reduced */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(212, 175, 55, 0.02) 50px, rgba(212, 175, 55, 0.02) 51px)',
          pointerEvents: 'none',
        }}
      />
      {/* Darken overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: 400,
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.15)',
        }}
        styles={{
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          },
          body: {
            padding: '32px',
          },
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#D4AF37', marginBottom: 8, fontFamily: 'serif', letterSpacing: '0.15em' }}>
            YARA
          </Title>
          <Text style={{ color: 'rgba(212, 175, 55, 0.7)', fontSize: '12px', letterSpacing: '0.2em' }}>
            HUMAN RESOURCE MANAGEMENT
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label={<span style={{ color: '#D4AF37' }}>Username</span>} rules={[{ required: true }]}>
            <Input
              style={{
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#D4AF37',
              }}
              placeholder="Enter username"
            />
          </Form.Item>
          <Form.Item name="password" label={<span style={{ color: '#D4AF37' }}>Password</span>} rules={[{ required: true }]}>
            <Input.Password
              style={{
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#D4AF37',
              }}
              placeholder="Enter password"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
              border: 'none',
              height: '48px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
            }}
          >
            SIGN IN
          </Button>
        </Form>
      </Card>
    </div>
  );
}
