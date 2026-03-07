import { Row, Col, Table, Tag, Space, Typography, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { TeamOutlined, ProjectOutlined, UserOutlined, RiseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import http from '../../lib/http';
import { GlassCard, TagPill } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';

const { Text } = Typography;

interface ClientSummary {
  workspace: {
    id: number;
    name: string;
    code: string;
    workspace_type: string;
    industry: string;
  };
  stats: {
    total_employees: number;
    active_employees: number;
    total_projects: number;
    active_projects: number;
    total_sites: number;
    contractors_count?: number;
  };
  role: string;
}

interface PortfolioStats {
  total_clients: number;
  total_employees_across_all: number;
  total_active_projects: number;
  total_contractors: number;
  clients: ClientSummary[];
}

export default function OverviewDashboard() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));

  useEffect(() => {
    const handleWorkspaceChange = () => {
      setWorkspaceId(localStorage.getItem('workspaceId'));
    };
    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    window.addEventListener('storage', handleWorkspaceChange);
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
      window.removeEventListener('storage', handleWorkspaceChange);
    };
  }, []);

  const { data: portfolio, isLoading, error } = useQuery<PortfolioStats>({
    queryKey: ['portfolio-overview', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/core/workspaces/portfolio_stats/');
      return res.data;
    },
    refetchInterval: 2000,
  });

  const typeMap: Record<string, { color: string; label: string }> = {
    COMPANY: { color: '#7cff6b', label: 'Company' },
    CONTRACTOR_FIRM: { color: '#ffb547', label: 'Contractor Firm' },
    CONSULTANT: { color: '#3ee7ff', label: 'Consultant' },
  };

  const roleMap: Record<string, { variant: 'gold' | 'cyan' | 'lime' | 'amber' | 'pink'; label: string }> = {
    OWNER: { variant: 'gold', label: 'Owner' },
    ADMIN: { variant: 'gold', label: 'Admin' },
    HR_MANAGER: { variant: 'cyan', label: 'HR Manager' },
    MANAGER: { variant: 'cyan', label: 'Manager' },
    VIEWER: { variant: 'amber', label: 'Viewer' },
  };

  const columns = [
    {
      title: 'Client/Company',
      dataIndex: ['workspace', 'name'],
      key: 'name',
      render: (name: string, record: ClientSummary) => (
        <Space orientation="vertical" size={0}>
          <Text strong style={{ color: '#f5c400' }}>{name}</Text>
          <Text style={{ fontSize: 12, color: '#c4c8d4' }}>
            {record.workspace.code} • {record.workspace.industry || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: ['workspace', 'workspace_type'],
      key: 'type',
      render: (type: string) => {
        const t = typeMap[type] || { color: '#c4c8d4', label: type || 'Unknown' };
        return <Tag color={t.color} style={{ color: '#05060a', fontWeight: 600 }}>{t.label}</Tag>;
      },
    },
    {
      title: 'Employees',
      key: 'employees',
      render: (_: any, record: ClientSummary) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <TeamOutlined style={{ color: '#D4AF37' }} />
            <Text>{record.stats.total_employees} total</Text>
          </Space>
          <Text style={{ fontSize: 12, color: '#c4c8d4' }}>Active: {record.stats.active_employees}</Text>
        </Space>
      ),
    },
    {
      title: 'Projects',
      key: 'projects',
      render: (_: any, record: ClientSummary) => (
        <Space>
          <ProjectOutlined style={{ color: '#D4AF37' }} />
          <Text>{record.stats.active_projects} / {record.stats.total_projects}</Text>
        </Space>
      ),
    },
    {
      title: 'Sites',
      dataIndex: ['stats', 'total_sites'],
      key: 'sites',
    },
    {
      title: 'Contractors',
      dataIndex: ['stats', 'contractors_count'],
      key: 'contractors',
      render: (count?: number) => count || 0,
    },
    {
      title: 'Your Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const r = roleMap[role] || { variant: 'neutral' as any, label: role || 'Viewer' };
        return <TagPill variant={r.variant} style={{ margin: 0 }}>{r.label}</TagPill>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClientSummary) => (
        <a
          onClick={() => {
            console.log('🔄 Switching to workspace:', record.workspace.id, record.workspace.name);
            localStorage.setItem('workspaceId', String(record.workspace.id));
            localStorage.setItem('workspaceName', record.workspace.name);
            localStorage.setItem('workspaceRole', record.role || 'VIEWER');
            console.log('✅ localStorage set:', {
              workspaceId: localStorage.getItem('workspaceId'),
              workspaceName: localStorage.getItem('workspaceName')
            });
            window.dispatchEvent(new Event('workspaceChanged'));
            window.location.href = '/dashboard';
          }}
          style={{ color: '#D4AF37' }}
        >
          Open Workspace →
        </a>
      ),
    },
  ];

  if (isLoading) {
    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex flex-col gap-2">
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Consultant View</div>
            <h1 style={{ margin: 0, color: '#f7f8fb', fontSize: '32px', fontWeight: 700 }}>Portfolio Overview</h1>
          </div>
          <GlassCard gradient="gold" style={{ textAlign: 'center', padding: '48px 16px' }}>
            <Spin tip="Loading portfolio data..." size="large" />
          </GlassCard>
        </div>
    );
  }

  if (error) {
    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex flex-col gap-2">
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Consultant View</div>
            <h1 style={{ margin: 0, color: '#f7f8fb', fontSize: '32px', fontWeight: 700 }}>Portfolio Overview</h1>
          </div>
          <GlassCard gradient="amber" style={{ textAlign: 'center', padding: '48px 16px', borderColor: 'rgba(255, 107, 107, 0.35)' }}>
            <Text style={{ color: '#ff6b6b' }}>Error loading portfolio data. Check console for details.</Text>
            <br />
            <Text style={{ color: '#c4c8d4' }}>{String(error)}</Text>
          </GlassCard>
        </div>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="flex flex-col gap-2">
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Consultant View</div>
        <h1 style={{ margin: 0, color: '#f7f8fb', fontSize: '32px', fontWeight: 700 }}>Portfolio Overview</h1>
      </div>

      <GlassCard
        gradient="gold"
        className="relative overflow-hidden"
        style={{ padding: '24px', borderRadius: 16 }}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em]" style={{ color: '#c4c8d4' }}>
          <span>Workspace Overview</span>
          <TagPill variant="gold">Live</TagPill>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <h2 style={{ margin: 0, color: '#f7f8fb', fontSize: 26, fontWeight: 700 }}>Manage {portfolio?.clients.length || 0} Workspaces</h2>
          <Text style={{ color: '#c4c8d4', maxWidth: 720 }}>
            Monitor compliance, projects, and staffing across all clients from a single dashboard.
          </Text>
          <div className="flex flex-wrap gap-2">
            <TagPill variant="gold">Clients: {portfolio?.total_clients || 0}</TagPill>
            <TagPill variant="cyan">Employees: {portfolio?.total_employees_across_all || 0}</TagPill>
            <TagPill variant="lime">Projects: {portfolio?.total_active_projects || 0}</TagPill>
            <TagPill variant="amber">Contractors: {portfolio?.total_contractors || 0}</TagPill>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <Row gutter={[18, 18]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Total Clients" value={portfolio?.total_clients || 0} prefix={<TeamOutlined />} color="#f5c400" gradient="gold" delta={12.4} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Total Employees" value={portfolio?.total_employees_across_all || 0} prefix={<UserOutlined />} color="#3ee7ff" gradient="cyan" delta={8.1} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Active Projects" value={portfolio?.total_active_projects || 0} prefix={<CheckCircleOutlined />} color="#7cff6b" gradient="lime" delta={5.6} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Total Contractors" value={portfolio?.total_contractors || 0} prefix={<RiseOutlined />} color="#ffb547" gradient="amber" delta={3.2} />
        </Col>
      </Row>

      {/* Client Table */}
      <GlassCard gradient="gold" style={{ padding: 16 }}>
        <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginBottom: 12 }}>
          <span style={{ color: '#f7f8fb', fontSize: 16, fontWeight: 700 }}>Client Workspaces</span>
          <TagPill variant="cyan">{portfolio?.clients.length || 0} records</TagPill>
        </div>
        <Table
          columns={columns}
          dataSource={portfolio?.clients || []}
          loading={isLoading}
          rowKey={(record) => record.workspace.id}
          pagination={{ pageSize: 10 }}
        />
      </GlassCard>
    </div>
  );
}
