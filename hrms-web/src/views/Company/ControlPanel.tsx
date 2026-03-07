import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const tiles = [
  { title: 'Human Capital', desc: 'Employees, Departments, Contracts', path: '/hcm/summary' },
  { title: 'Payroll', desc: 'Salary management and pay runs', path: '/payroll/salary-management' },
  { title: 'Recruitment', desc: 'ATR and hiring pipeline', path: '/recruitment/atr' },
  { title: 'Performance', desc: 'Appraisals and reviews', path: '/activities/appraisals' },
  { title: 'Tracking', desc: 'Trainings and compliance', path: '/tracking/trainings' },
  { title: 'Leave', desc: 'Leave dashboard and absenteeism', path: '/leave' },
  { title: 'Analytics', desc: 'KPIs and BI insights', path: '/analytics' },
];

export default function ControlPanel() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ color: '#D4AF37', marginBottom: 24 }}>
        Company Control Panel
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Manage your organization across modules
      </Text>
      <Row gutter={[16, 16]}>
        {tiles.map((t) => (
          <Col xs={24} sm={12} lg={8} key={t.title}>
            <Card
              hoverable
              onClick={() => nav(t.path)}
              style={{ borderColor: 'rgba(212,175,55,0.3)', cursor: 'pointer' }}
            >
              <Title level={4} style={{ marginBottom: 8 }}>{t.title}</Title>
              <Text type="secondary">{t.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
