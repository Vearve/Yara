import { Col, Row, Button, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { coreApi, type PortfolioStats } from '../../api/services/coreApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard, TagPill } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';
import { HeroBanner } from '../../components/HeroBanner';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

const COLORS = ['#f5c400', '#3ee7ff', '#7cff6b', '#ff4fd8', '#ffb547', '#ff6b9d'];

export default function ManagerDashboard() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
  const sectionTitleColor = isLight ? '#352c46' : '#f7f8fb';
  const helperTextColor = isLight ? '#635a74' : '#c4c8d4';
  const chartAxisColor = isLight ? '#4d465c' : '#c4c8d4';
  const chartAxisLine = isLight ? 'rgba(53, 44, 70, 0.2)' : 'rgba(245, 196, 0, 0.3)';
  const tooltipBackground = isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(5, 6, 10, 0.95)';
  const tooltipBorder = isLight ? '1px solid rgba(53, 44, 70, 0.16)' : '1px solid rgba(255, 181, 71, 0.25)';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <HeroBanner
          eyebrow="Manager Control"
          title="Portfolio Command Center"
          description={`Track portfolio-wide health, staffing, and compliance. Live totals: ${stats?.clients_count ?? 0} clients, ${stats?.employees_count ?? 0} employees, ${stats?.assignments_count ?? 0} assignments.`}
          gradient="neutral"
          tags={[
            { label: `Active projects: ${stats?.projects_count ?? 0}`, variant: 'gold' },
            { label: `Contractors: ${stats?.contractors_count ?? 0}`, variant: 'cyan' },
            { label: `Compliant: ${compData.reduce((acc, c) => acc + (c.name.toLowerCase() === 'good' ? c.value : 0), 0)}`, variant: 'lime' },
          ]}
          actions={(
            <>
              <Button type="primary">Create Assignment</Button>
              <Button>Compliance Center</Button>
            </>
          )}
        />
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
            styles={{ header: { color: sectionTitleColor, fontWeight: 700 } }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={compData} dataKey="value" nameKey="name" outerRadius={90}>
                  {compData.map((_, index) => (
                    <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: tooltipBackground, border: tooltipBorder, borderRadius: '8px' }}
                  labelStyle={{ color: sectionTitleColor }}
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
            styles={{ header: { color: sectionTitleColor, fontWeight: 700 } }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projData}>
                <XAxis dataKey="name" stroke={chartAxisColor} tickLine={false} axisLine={{ stroke: chartAxisLine }} />
                <YAxis allowDecimals={false} stroke={chartAxisColor} tickLine={false} axisLine={{ stroke: chartAxisLine }} />
                <Tooltip
                  contentStyle={{ background: tooltipBackground, border: isLight ? '1px solid rgba(53, 44, 70, 0.16)' : '1px solid rgba(245, 196, 0, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: sectionTitleColor }}
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
            styles={{ header: { color: sectionTitleColor, fontWeight: 700 } }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.assignments_by_client || []}>
                <XAxis dataKey="client__name" stroke={chartAxisColor} tickLine={false} axisLine={{ stroke: isLight ? 'rgba(53, 44, 70, 0.2)' : 'rgba(62, 231, 255, 0.3)' }} />
                <YAxis allowDecimals={false} stroke={chartAxisColor} tickLine={false} axisLine={{ stroke: isLight ? 'rgba(53, 44, 70, 0.2)' : 'rgba(62, 231, 255, 0.3)' }} />
                <Tooltip
                  contentStyle={{ background: tooltipBackground, border: isLight ? '1px solid rgba(53, 44, 70, 0.16)' : '1px solid rgba(62, 231, 255, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: sectionTitleColor }}
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
