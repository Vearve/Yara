import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Spin,
  Typography,
  Table,
} from 'antd';
import {
  DollarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import http from '../../lib/http';
import { canPerformAction } from '../../lib/permissions';

const { Title, Text } = Typography;

interface EmployerSummary {
  total_napsa_employer: number;
  total_nhima_employer: number;
  total_employer_cost: number;
  total_gross: number;
  employee_count: number;
  breakdown: Array<{
    employee_name: string;
    employee_id: string;
    gross_salary: number;
    napsa_employer: number;
    nhima_employer: number;
    total_employer: number;
  }>;
}

const EmployerContributions: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const canViewPayroll = canPerformAction('can_view_payroll');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['employer-contributions', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await http.get(
        `/api/v1/payroll/payslips/remittance_report/?year=${selectedYear}&month=${selectedMonth}`
      );
      const data = response.data || {};
      const breakdown = (data.employee_breakdown || []).map((p: any) => ({
        employee_name: p.employee_name,
        employee_id: p.employee_id,
        gross_salary: Number(p.gross_salary || 0),
        napsa_employer: Number(p.napsa_employer || 0),
        nhima_employer: Number(p.nhima_employer || 0),
        total_employer: Number(p.napsa_employer || 0) + Number(p.nhima_employer || 0),
      }));
      
      const total_napsa_employer = Number(data.napsa?.employer_total || 0);
      const total_nhima_employer = Number(data.nhima?.employer_total || 0);
      const total_employer_cost = Number(data.summary?.total_employer_contributions || 0) || (total_napsa_employer + total_nhima_employer);
      const total_gross = Number(data.summary?.total_gross_payroll || 0);
      const employee_count = Number(data.summary?.total_employees || breakdown.length);

      return {
        total_napsa_employer,
        total_nhima_employer,
        total_employer_cost,
        total_gross,
        employee_count,
        breakdown,
      } as EmployerSummary;
    },
    enabled: canViewPayroll,
  });

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 120,
    },
    {
      title: 'Employee Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: 200,
    },
    {
      title: 'Gross Salary',
      dataIndex: 'gross_salary',
      key: 'gross_salary',
      width: 130,
      render: (val: number) => `K${val.toFixed(2)}`,
    },
    {
      title: 'NAPSA (Employer)',
      dataIndex: 'napsa_employer',
      key: 'napsa_employer',
      width: 140,
      render: (val: number) => `K${val.toFixed(2)}`,
    },
    {
      title: 'NHIMA (Employer)',
      dataIndex: 'nhima_employer',
      key: 'nhima_employer',
      width: 140,
      render: (val: number) => `K${val.toFixed(2)}`,
    },
    {
      title: 'Total Employer Cost',
      dataIndex: 'total_employer',
      key: 'total_employer',
      width: 150,
      render: (val: number) => (
        <Text strong style={{ color: '#fa8c16' }}>
          K{val.toFixed(2)}
        </Text>
      ),
    },
  ];

  if (!canViewPayroll) {
    return (
      <Card>
        <Text>You don't have permission to view employer contributions</Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3}>Employer Contributions Report</Title>
          </Col>
          <Col>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 130, marginRight: 8 }}
              options={[
                { label: 'January', value: 1 },
                { label: 'February', value: 2 },
                { label: 'March', value: 3 },
                { label: 'April', value: 4 },
                { label: 'May', value: 5 },
                { label: 'June', value: 6 },
                { label: 'July', value: 7 },
                { label: 'August', value: 8 },
                { label: 'September', value: 9 },
                { label: 'October', value: 10 },
                { label: 'November', value: 11 },
                { label: 'December', value: 12 },
              ]}
            />
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 100 }}
              options={Array.from({ length: 5 }, (_, i) => ({
                label: (new Date().getFullYear() - 2 + i).toString(),
                value: new Date().getFullYear() - 2 + i,
              }))}
            />
          </Col>
        </Row>

        <Spin spinning={isLoading}>
          {summary && (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Employees"
                      value={summary.employee_count}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<DollarOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="NAPSA (Employer)"
                      value={summary.total_napsa_employer}
                      prefix="K"
                      precision={2}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="NHIMA (Employer)"
                      value={summary.total_nhima_employer}
                      prefix="K"
                      precision={2}
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Employer Cost"
                      value={summary.total_employer_cost}
                      prefix="K"
                      precision={2}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Gross Payroll"
                      value={summary.total_gross}
                      prefix="K"
                      precision={2}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Employer Burden Rate"
                      value={((summary.total_employer_cost / summary.total_gross) * 100).toFixed(2)}
                      suffix="%"
                    />
                  </Col>
                </Row>
              </Card>

              <Table
                columns={columns}
                dataSource={summary.breakdown}
                rowKey="employee_id"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
              />
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default EmployerContributions;
