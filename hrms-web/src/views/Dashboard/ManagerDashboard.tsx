import { Col, Row, Button, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { coreApi, type PortfolioStats } from '../../api/services/coreApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard, TagPill } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';

const { Title, Text } = Typography;

const COLORS = ['#f5c400', '#3ee7ff', '#7cff6b', '#ff4fd8', '#ffb547', '#ff6b9d'];

export default function ManagerDashboard() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await coreApi.getPortfolioStats();
        setStats(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const projData = stats ? Object.entries(stats.projects_by_status).map(([status, count]) => ({ name: status, value: count })) : [];
  const compData = stats ? Object.entries(stats.compliance_by_status).map(([status, count]) => ({ name: status, value: count })) : [];

  return (
    <div style={{ padding: '24px' }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl border shadow-glow mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 196, 0, 0.08) 0%, rgba(62, 231, 255, 0.05) 100%)',
          borderColor: 'rgba(245, 196, 0, 0.18)',
        }}
      >
        <div
          className="absolute inset-0 blur-3xl"
          style={{ background: 'radial-gradient(at 20% 20%, rgba(245, 196, 0, 0.2), transparent 45%)' }}
        />
        <div className="relative flex flex-col gap-3 p-6 md:p-8">
          <div className="text-sm uppercase tracking-[0.2em]" style={{ color: '#c4c8d4' }}>Manager Control</div>
          <Title level={2} style={{ margin: 0, color: '#f7f8fb' }}>Portfolio Command Center</Title>
          <Text style={{ color: '#c4c8d4', maxWidth: 720 }}>
            Track portfolio-wide health, staffing, and compliance. Live totals: {stats?.clients_count ?? 0} clients, {stats?.employees_count ?? 0} employees, {stats?.assignments_count ?? 0} assignments.
          </Text>
          <div className="flex flex-wrap gap-3 mt-1">
            <Button type="primary" style={{ background: '#f5c400', borderColor: '#f5c400', color: '#05060a', fontWeight: 600 }}>
              Create Assignment
            </Button>
            <Button style={{ color: '#f7f8fb', borderColor: 'rgba(245, 196, 0, 0.25)' }}>
              Compliance Center
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <TagPill variant="gold">Active projects: {stats?.projects_count ?? 0}</TagPill>
            <TagPill variant="cyan">Contractors: {stats?.contractors_count ?? 0}</TagPill>
            <TagPill variant="lime">Compliant: {compData.reduce((acc, c) => acc + (c.name.toLowerCase() === 'good' ? c.value : 0), 0)}</TagPill>
          </div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard 
            title="Clients"
            value={stats?.clients_count ?? 0}
            color="#f5c400"
            gradient="gold"
            delta={(stats?.clients_count ?? 0) === 0 ? undefined : 8.3}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard 
            title="Employees"
            value={stats?.employees_count ?? 0}
            color="#3ee7ff"
            gradient="cyan"
            delta={(stats?.employees_count ?? 0) === 0 ? undefined : 12.7}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard 
            title="Assignments"
            value={stats?.assignments_count ?? 0}
            color="#7cff6b"
            gradient="lime"
            delta={(stats?.assignments_count ?? 0) === 0 ? undefined : 5.2}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard 
            title="Compliance (Contractors)"
            value={stats?.contractors_count ?? 0}
            color="#ffb547"
            gradient="amber"
            delta={(stats?.contractors_count ?? 0) === 0 ? undefined : -2.4}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <GlassCard 
            loading={loading} 
            title="Compliance Distribution"
            gradient="amber"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={compData} dataKey="value" nameKey="name" outerRadius={90}>
                  {compData.map((_, index) => (
                    <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(5, 6, 10, 0.95)', border: '1px solid rgba(255, 181, 71, 0.25)', borderRadius: '8px' }}
                  labelStyle={{ color: '#f7f8fb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {compData.map((d, i) => (
                <TagPill key={d.name} style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length], borderColor: `${COLORS[i % COLORS.length]}40` }}>{d.name}: {d.value}</TagPill>
              ))}
            </div>
          </GlassCard>
        </Col>

        <Col xs={24} lg={12}>
          <GlassCard 
            loading={loading} 
            title="Projects by Status"
            gradient="gold"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projData}>
                <XAxis dataKey="name" stroke="#c4c8d4" tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.3)' }} />
                <YAxis allowDecimals={false} stroke="#c4c8d4" tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.3)' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(5, 6, 10, 0.9)', border: '1px solid rgba(245, 196, 0, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#f7f8fb' }}
                />
                <Bar dataKey="value" fill="#f5c400" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </Col>

        <Col xs={24} lg={12}>
          <GlassCard 
            loading={loading} 
            title="Top Clients (Assignments)"
            gradient="cyan"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.assignments_by_client || []}>
                <XAxis dataKey="client__name" stroke="#c4c8d4" tickLine={false} axisLine={{ stroke: 'rgba(62, 231, 255, 0.3)' }} />
                <YAxis allowDecimals={false} stroke="#c4c8d4" tickLine={false} axisLine={{ stroke: 'rgba(62, 231, 255, 0.3)' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(5, 6, 10, 0.9)', border: '1px solid rgba(62, 231, 255, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#f7f8fb' }}
                />
                <Bar dataKey="count" fill="#3ee7ff" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </Col>
      </Row>
    </div>
  );
}
