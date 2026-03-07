import { Row, Col, Typography, Button, Space, Progress } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import http from '../../lib/http';
import { TeamOutlined, FileTextOutlined, AlertOutlined } from '@ant-design/icons';
import { GlassCard, TagPill } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';

const { Title, Text } = Typography;

export default function PortfolioDashboard() {
  const nav = useNavigate();
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'good' | 'attention'>('all');
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
  
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio-stats', workspaceId],
    queryFn: async () => (await http.get('/api/v1/core/workspaces/portfolio_stats/')).data,
    refetchOnMount: true,
    refetchInterval: 2000,
    staleTime: 0,
  });

  const workspaces = portfolioData?.clients || [];
  const totalEmployees = portfolioData?.total_employees_across_all || 0;
  const totalProjects = portfolioData?.total_active_projects || 0;
  const totalCases = portfolioData?.total_cases || 0;
  const totalClients = portfolioData?.total_clients || 0;
  const totalContractors = portfolioData?.total_contractors || 0;

  const goodComplianceCount = workspaces.filter((w: any) => w.stats?.compliance_level === 'Good').length;

  // Calculate aggregate active ATRs and compliance
  const totalOpenRoles = workspaces.reduce((sum: number, w: any) => sum + (w.stats?.active_atrs || 0), 0);
  const avgCompliance = workspaces.length > 0 
    ? Math.round((workspaces.filter((w: any) => w.stats?.compliance_level === 'Good').length / workspaces.length) * 100)
    : 0;

  // Filter workspaces based on selected compliance filter
  const filteredWorkspaces = workspaces.filter((item: any) => {
    const level = (item.stats?.compliance_level || 'Unknown').toLowerCase();
    if (complianceFilter === 'all') return true;
    if (complianceFilter === 'good') return level === 'good';
    if (complianceFilter === 'attention') return level === 'medium' || level === 'poor' || level === 'unknown';
    return true;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl border shadow-glow mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 196, 0, 0.1) 0%, rgba(11, 15, 26, 0.9) 60%, rgba(62, 231, 255, 0.08) 100%)',
          borderColor: 'rgba(245, 196, 0, 0.2)',
        }}
      >
        <div
          className="absolute inset-0 blur-3xl"
          style={{ background: 'radial-gradient(at 15% 15%, rgba(245, 196, 0, 0.22), transparent 45%)' }}
        />
        <div className="relative flex flex-col gap-3 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em]" style={{ color: '#c4c8d4' }}>
            <span>Consultant View</span>
            <TagPill variant="gold">Live</TagPill>
          </div>
          <Title level={2} style={{ margin: 0, color: '#f7f8fb' }}>Portfolio Overview</Title>
          <Text style={{ color: '#c4c8d4', maxWidth: 780 }}>
            Manage {workspaces.length} client workspace{workspaces.length !== 1 ? 's' : ''} with compliance, roles, and cases at a glance.
          </Text>
          <div className="flex flex-wrap gap-3 mt-2">
            <Button type="primary" style={{ background: '#f5c400', borderColor: '#f5c400', color: '#05060a', fontWeight: 600 }}>
              Add Client
            </Button>
            <Button style={{ color: '#f7f8fb', borderColor: 'rgba(245, 196, 0, 0.25)' }}>
              View Reports
            </Button>
            <Button style={{ color: '#3ee7ff', borderColor: 'rgba(62, 231, 255, 0.25)' }}>
              Export Snapshot
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <TagPill variant="gold">Clients: {totalClients}</TagPill>
            <TagPill variant="cyan">Projects: {totalProjects}</TagPill>
            <TagPill variant="lime">Compliance: {avgCompliance}%</TagPill>
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Companies"
            value={totalClients}
            prefix={<TeamOutlined />}
            color="#f5c400"
            gradient="gold"
            delta={14.2}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Employees"
            value={totalEmployees}
            prefix={<TeamOutlined />}
            color="#3ee7ff"
            gradient="cyan"
            delta={8.7}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Cases"
            value={totalCases}
            prefix={<FileTextOutlined />}
            color="#7cff6b"
            gradient="lime"
            delta={-3.5}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Active ATR"
            value={totalOpenRoles}
            prefix={<AlertOutlined />}
            color="#ffb547"
            gradient="amber"
            delta={22.3}
          />
        </Col>
      </Row>

      {/* Compliance Graph */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <GlassCard title="Overall Compliance Status" gradient="gold">
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8, color: '#c4c8d4' }}>Target: 95% | Actual: {avgCompliance}%</Text>
              <Progress
                type="circle"
                percent={avgCompliance}
                size={120}
                strokeColor={{ '0%': '#f5c400', '100%': '#7cff6b' }}
                format={(percent) => `${percent}%`}
              />
            </div>
            <Text style={{ fontSize: 12, color: '#c4c8d4' }}>
              {workspaces.filter((w: any) => w.stats?.compliance_level === 'Good').length} of {workspaces.length} companies at target compliance
            </Text>
          </GlassCard>
        </Col>
        <Col xs={24} lg={12}>
          <GlassCard title="Key Metrics" gradient="gold">
            <Space orientation="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f7f8fb' }}>
                <Text style={{ color: '#c4c8d4' }}>Active Projects</Text>
                <Text strong style={{ color: '#f5c400' }}>{totalProjects}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f7f8fb' }}>
                <Text style={{ color: '#c4c8d4' }}>Contractors</Text>
                <Text strong style={{ color: '#f5c400' }}>{totalContractors}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f7f8fb' }}>
                <Text style={{ color: '#c4c8d4' }}>Compliant Companies</Text>
                <Text strong style={{ color: '#7cff6b' }}>{goodComplianceCount}</Text>
              </div>
            </Space>
          </GlassCard>
        </Col>
      </Row>

      {/* Client Workspace Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="flex flex-wrap items-center gap-3">
          <h3 style={{ margin: 0, color: '#f7f8fb', fontSize: '18px', fontWeight: 700 }}>Client Workspaces</h3>
          <TagPill variant="gold">{filteredWorkspaces.length} Active</TagPill>
          <Text style={{ margin: 0, color: '#c4c8d4', fontSize: '13px' }}>Tap a card to open the workspace</Text>
        </div>
        <div className="flex flex-wrap gap-2" style={{ gap: 10 }}>
          <TagPill 
            variant="gold" 
            onClick={() => setComplianceFilter('all')}
            style={{ 
              cursor: 'pointer', 
              opacity: complianceFilter === 'all' ? 1 : 0.6,
              transform: complianceFilter === 'all' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            All
          </TagPill>
          <TagPill 
            variant="lime" 
            onClick={() => setComplianceFilter('good')}
            style={{ 
              cursor: 'pointer', 
              opacity: complianceFilter === 'good' ? 1 : 0.6,
              transform: complianceFilter === 'good' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            Good
          </TagPill>
          <TagPill 
            variant="amber" 
            onClick={() => setComplianceFilter('attention')}
            style={{ 
              cursor: 'pointer', 
              opacity: complianceFilter === 'attention' ? 1 : 0.6,
              transform: complianceFilter === 'attention' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            Needs Attention
          </TagPill>
        </div>
        <Row gutter={[24, 24]}>
          {filteredWorkspaces.map((item: any) => {
            const ws = item.workspace;
            const stats = item.stats || {};
            const employeeCount = stats.total_employees ?? 0;
            const activeProjects = stats.active_projects ?? 0;
            const contractors = stats.contractors_count ?? 0;
            const complianceLevel = stats.compliance_level || 'Unknown';
            const complianceTone = complianceLevel.toLowerCase() === 'good' ? '#7cff6b' : complianceLevel.toLowerCase() === 'medium' ? '#ffb547' : '#ff6b9d';

            return (
              <Col xs={24} sm={12} md={12} lg={6} key={ws.id}>
                <GlassCard
                  hoverable
                  onClick={() => {
                    console.log('🔄 Switching to workspace:', ws.id, ws.name);
                    localStorage.setItem('workspaceId', String(ws.id));
                    localStorage.setItem('workspaceName', ws.name);
                    localStorage.setItem('workspaceRole', item.role || 'VIEWER');
                    console.log('✅ localStorage set:', {
                      workspaceId: localStorage.getItem('workspaceId'),
                      workspaceName: localStorage.getItem('workspaceName')
                    });
                    window.dispatchEvent(new Event('workspaceChanged'));
                    nav('/dashboard');
                  }}
                  gradient="gold"
                  style={{ height: '100%', cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#f7f8fb', fontSize: '16px', fontWeight: 700 }}>
                        {ws.name}
                      </h4>
                      <span style={{ fontSize: 12, color: '#c4c8d4' }}>
                        {ws.industry || 'General'}
                      </span>
                    </div>
                    <TagPill variant="cyan" style={{ alignSelf: 'flex-start' }}>{item.role}</TagPill>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px dashed rgba(245, 196, 0, 0.16)', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#c4c8d4' }}>Compliance</span>
                    <TagPill style={{ background: `${complianceTone}20`, color: complianceTone, borderColor: `${complianceTone}40`, margin: 0 }}>
                      {complianceLevel}
                    </TagPill>
                  </div>

                  <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <div>
                          <div style={{ fontSize: 11, color: '#c4c8d4', marginBottom: 4 }}>Employees</div>
                          <div style={{ fontSize: 16, color: '#f5c400', fontWeight: 'bold' }}>{employeeCount}</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <div style={{ fontSize: 11, color: '#c4c8d4', marginBottom: 4 }}>Projects</div>
                          <div style={{ fontSize: 16, color: '#3ee7ff', fontWeight: 'bold' }}>{activeProjects}</div>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <div>
                          <div style={{ fontSize: 11, color: '#c4c8d4', marginBottom: 4 }}>Contractors</div>
                          <div style={{ fontSize: 16, color: '#7cff6b', fontWeight: 'bold' }}>{contractors}</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <div style={{ fontSize: 11, color: '#c4c8d4', marginBottom: 4 }}>Cases</div>
                          <div style={{ fontSize: 16, color: '#ffb547', fontWeight: 'bold' }}>{stats.case_count ?? 0}</div>
                        </div>
                      </Col>
                    </Row>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px dashed rgba(245, 196, 0, 0.16)' }}>
                      <span style={{ fontSize: 11, color: '#c4c8d4' }}>Active ATR</span>
                      <strong style={{ color: '#f5c400' }}>{stats.active_atrs ?? 0}</strong>
                    </div>
                  </Space>

                  <div style={{ marginTop: 12 }}>
                    <Button type="primary" block size="small" style={{ background: '#f5c400', borderColor: '#f5c400', color: '#05060a', fontWeight: 600 }}>
                      Manage
                    </Button>
                  </div>
                </GlassCard>
              </Col>
            );
          })}
        </Row>

        {workspaces.length === 0 && (
          <GlassCard style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text style={{ color: '#c4c8d4' }}>No workspaces assigned</Text>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
