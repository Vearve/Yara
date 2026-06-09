import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, Tabs, Tag, Spin, Row, Col, Empty, Statistic } from 'antd';
import MobileTable from '../../components/MobileTable';
import ReactECharts from 'echarts-for-react';
import http from '../../lib/http';
import { GlassCard } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';
import { HeroBanner } from '../../components/HeroBanner';
import { useTheme } from '../../contexts/ThemeContext';
import { UserOutlined, FileTextOutlined, AuditOutlined, MedicineBoxOutlined, BookOutlined } from '@ant-design/icons';

export default function ERA() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [workspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const labelColor = isLight ? '#352c46' : '#c4c8d4';
  const cardBg = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(15,22,40,0.7)';

  // Employees list for selector
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-min', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/employees/', { params: { page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const employeeOptions = useMemo(
    () => (employees || []).map((e: any) => ({
      value: e.id,
      label: `${e.first_name} ${e.last_name}${e.employee_number ? ` (${e.employee_number})` : ''}`,
    })),
    [employees],
  );

  const selectedEmployeeData = useMemo(
    () => employees.find((e: any) => e.id === selectedEmployee) || null,
    [employees, selectedEmployee],
  );

  const enabled = !!workspaceId && !!selectedEmployee;

  // All record queries — only fire when employee selected
  const { data: chargesData, isLoading: chargesLoading } = useQuery({
    queryKey: ['era-charges', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/charges/', { params: { employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['era-reports', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/reports/', { params: { reported_employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: hearingsData, isLoading: hearingsLoading } = useQuery({
    queryKey: ['era-hearings', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/hearings/', { params: { related_employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: caseStudiesData, isLoading: caseStudiesLoading } = useQuery({
    queryKey: ['era-case-studies', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/case-studies/', { params: { related_employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: investigationsData, isLoading: investigationsLoading } = useQuery({
    queryKey: ['era-investigations', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/investigations/', { params: { related_employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['era-leave', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/leave/requests/', { params: { employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sickNotesData, isLoading: sickLoading } = useQuery({
    queryKey: ['era-sick-notes', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/leave/sick-notes/', { params: { employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: absenteeismData, isLoading: absenteeismLoading } = useQuery({
    queryKey: ['era-absenteeism', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/leave/absenteeism/', { params: { employee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: appraisalsData, isLoading: appraisalsLoading } = useQuery({
    queryKey: ['era-appraisals', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/activities/appraisals/', { params: { appraisee: selectedEmployee, page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: medicalsData, isLoading: medicalsLoading } = useQuery({
    queryKey: ['era-medicals', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/tracking/medicals/', { params: employeeParam });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: trainingsData, isLoading: trainingsLoading } = useQuery({
    queryKey: ['era-trainings', workspaceId, selectedEmployee],
    queryFn: async () => {
      const res = await http.get('/api/v1/tracking/trainings/', { params: employeeParam });
      return res.data?.results || res.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const charges = chargesData || [];
  const reports = reportsData || [];
  const hearings = hearingsData || [];
  const caseStudies = caseStudiesData || [];
  const investigations = investigationsData || [];
  const leave = leaveData || [];
  const sickNotes = sickNotesData || [];
  const absenteeism = absenteeismData || [];
  const appraisals = appraisalsData || [];
  const medicals = medicalsData || [];
  const trainings = trainingsData || [];

  // Chart: Leave trend by month
  const leaveTrendChart = useMemo(() => {
    const byMonth: Record<string, number> = {};
    [...leave, ...sickNotes].forEach((r: any) => {
      const d = r.start_date || r.date || r.created_at;
      if (!d) return;
      const month = d.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    const months = Object.keys(byMonth).sort();
    if (!months.length) return null;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: months, axisLabel: { color: labelColor } },
      yAxis: { type: 'value', axisLabel: { color: labelColor }, minInterval: 1 },
      series: [{ name: 'Leave / Sick', type: 'bar', data: months.map(m => byMonth[m]), itemStyle: { color: '#3ee7ff' } }],
      grid: { left: 40, right: 16, top: 20, bottom: 40 },
    };
  }, [leave, sickNotes, labelColor]);

  // Chart: Activity breakdown pie
  const activityPieChart = useMemo(() => {
    const data = [
      { value: charges.length, name: 'Charges', itemStyle: { color: '#ff4fd8' } },
      { value: reports.length, name: 'Reports', itemStyle: { color: '#f5c400' } },
      { value: hearings.length, name: 'Hearings', itemStyle: { color: '#7cff6b' } },
      { value: investigations.length, name: 'Investigations', itemStyle: { color: '#3ee7ff' } },
      { value: caseStudies.length, name: 'Case Studies', itemStyle: { color: '#ffb547' } },
    ].filter(d => d.value > 0);
    if (!data.length) return null;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: labelColor } },
      series: [{ type: 'pie', radius: ['35%', '65%'], label: { show: false }, data }],
    };
  }, [charges, reports, hearings, investigations, caseStudies, labelColor]);

  // Chart: Appraisal scores over time
  const appraisalChart = useMemo(() => {
    const sorted = [...appraisals]
      .filter((a: any) => a.review_date || a.created_at)
      .sort((a: any, b: any) => (a.review_date || a.created_at) > (b.review_date || b.created_at) ? 1 : -1);
    if (!sorted.length) return null;
    const labels = sorted.map((a: any) => (a.review_date || a.created_at || '').slice(0, 10));
    const scores = sorted.map((a: any) => a.overall_score ?? a.score ?? null);
    if (scores.every((s: any) => s === null)) return null;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: labels, axisLabel: { color: labelColor, rotate: 30 } },
      yAxis: { type: 'value', min: 0, max: 5, axisLabel: { color: labelColor } },
      series: [{ name: 'Score', type: 'line', smooth: true, data: scores, lineStyle: { color: '#f5c400' }, itemStyle: { color: '#f5c400' } }],
      grid: { left: 40, right: 16, top: 16, bottom: 60 },
    };
  }, [appraisals, labelColor]);

  const anyLoading = chargesLoading || reportsLoading || hearingsLoading || caseStudiesLoading
    || investigationsLoading || leaveLoading || sickLoading || absenteeismLoading
    || appraisalsLoading || medicalsLoading || trainingsLoading;

  const statusTag = (s: string, map: Record<string, string> = {}) => {
    const color = map[s] || (s?.includes('ACTIVE') || s?.includes('APPROVED') || s?.includes('COMPLETED') || s?.includes('CLEARED') ? 'green' : s?.includes('PENDING') ? 'orange' : s?.includes('REJECTED') || s?.includes('FAILED') ? 'red' : 'blue');
    return <Tag color={color}>{s || '-'}</Tag>;
  };

  const dateCol = (key: string, title: string) => ({ title, dataIndex: key, render: (v: string) => v ? v.slice(0, 10) : '-', width: 110 });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <HeroBanner
        eyebrow="Analytics"
        title="Employee Record Analytics"
        description="Select an employee to view a full analytical breakdown of their records across all modules."
        icon={<UserOutlined style={{ fontSize: 36, color: 'var(--accent)' }} />}
        gradient="neutral"
        tags={[
          { label: 'ERA', variant: 'cyan' },
          { label: 'Employee 360°', variant: 'amber' },
        ]}
      />

      {/* Employee Selector */}
      <GlassCard gradient="neutral" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: labelColor, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>Select Employee</span>
          <Select
            showSearch
            placeholder="Search by name or employee number..."
            style={{ flex: 1, minWidth: 280, maxWidth: 480 }}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            options={employeeOptions}
            optionFilterProp="label"
            allowClear
            size="large"
          />
          {selectedEmployeeData && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {selectedEmployeeData.department_name && <Tag color="cyan">{selectedEmployeeData.department_name}</Tag>}
              {selectedEmployeeData.job_title && <Tag color="purple">{selectedEmployeeData.job_title}</Tag>}
              {selectedEmployeeData.employment_status && <Tag color={selectedEmployeeData.employment_status === 'ACTIVE' ? 'green' : 'red'}>{selectedEmployeeData.employment_status}</Tag>}
            </div>
          )}
        </div>
      </GlassCard>

      {!selectedEmployee ? (
        <GlassCard gradient="gold" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Empty description={<span style={{ color: labelColor }}>Select an employee above to load their analytics</span>} />
        </GlassCard>
      ) : anyLoading ? (
        <GlassCard gradient="neutral" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ color: labelColor, marginTop: 12 }}>Loading employee records...</div>
        </GlassCard>
      ) : (
        <>
          {/* KPI Summary Row */}
          <Row gutter={[16, 16]}>
            {[
              { label: 'Leave Requests', value: leave.length, color: '#3ee7ff', gradient: 'cyan' as const },
              { label: 'Sick Notes', value: sickNotes.length, color: '#7cff6b', gradient: 'lime' as const },
              { label: 'Case Studies', value: caseStudies.length, color: '#ffb547', gradient: 'amber' as const },
              { label: 'Charges', value: charges.length, color: '#ff4fd8', gradient: 'pink' as const },
              { label: 'Appraisals', value: appraisals.length, color: '#f5c400', gradient: 'amber' as const },
              { label: 'Trainings', value: trainings.length, color: '#a78bfa', gradient: 'neutral' as const },
            ].map(card => (
              <Col xs={12} sm={8} xl={4} key={card.label}>
                <KPICard title={card.label} value={card.value} color={card.color} gradient={card.gradient} />
              </Col>
            ))}
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={leaveTrendChart && activityPieChart ? 14 : 24}>
              {leaveTrendChart ? (
                <GlassCard gradient="cyan" style={{ padding: 16, height: '100%' }}>
                  <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Leave & Sick Note Trend by Month</div>
                  <ReactECharts option={leaveTrendChart} style={{ height: 220 }} />
                </GlassCard>
              ) : (
                <GlassCard gradient="cyan" style={{ padding: 16, textAlign: 'center' }}>
                  <Empty description={<span style={{ color: labelColor }}>No leave data</span>} />
                </GlassCard>
              )}
            </Col>
            {activityPieChart && (
              <Col xs={24} xl={10}>
                <GlassCard gradient="gold" style={{ padding: 16, height: '100%' }}>
                  <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Activity Breakdown</div>
                  <ReactECharts option={activityPieChart} style={{ height: 220 }} />
                </GlassCard>
              </Col>
            )}
          </Row>

          {/* Tabs for detailed records */}
          <GlassCard gradient="neutral" style={{ padding: '0 0 16px' }}>
            <Tabs
              defaultActiveKey="activities"
              style={{ padding: '0 16px' }}
              items={[
                {
                  key: 'activities',
                  label: <span><AuditOutlined /> Activities</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Case Studies ({caseStudies.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={caseStudies}
                          rowKey="id"
                          pagination={{ pageSize: 5, size: 'small' }}
                          locale={{ emptyText: 'No case studies' }}
                          columns={[
                            { title: 'Case #', dataIndex: 'case_number', width: 120 },
                            { title: 'Type', dataIndex: 'case_type', width: 100 },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            dateCol('incident_date', 'Incident Date'),
                            { title: 'Description', dataIndex: 'description', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Charges ({charges.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={charges}
                          rowKey="id"
                          pagination={{ pageSize: 5, size: 'small' }}
                          locale={{ emptyText: 'No charges' }}
                          columns={[
                            { title: 'Charge Type', dataIndex: 'charge_type_name', ellipsis: true },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            dateCol('charge_date', 'Date'),
                            { title: 'Description', dataIndex: 'description', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Hearings ({hearings.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={hearings}
                          rowKey="id"
                          pagination={{ pageSize: 5, size: 'small' }}
                          locale={{ emptyText: 'No hearings' }}
                          columns={[
                            { title: 'Type', dataIndex: 'hearing_type', width: 120 },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            dateCol('scheduled_date', 'Scheduled'),
                            { title: 'Outcome', dataIndex: 'outcome', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Investigations ({investigations.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={investigations}
                          rowKey="id"
                          pagination={{ pageSize: 5, size: 'small' }}
                          locale={{ emptyText: 'No investigations' }}
                          columns={[
                            { title: 'Type', dataIndex: 'investigation_type', ellipsis: true },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            dateCol('start_date', 'Start Date'),
                            { title: 'Findings', dataIndex: 'findings', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Reports ({reports.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={reports}
                          rowKey="id"
                          pagination={{ pageSize: 5, size: 'small' }}
                          locale={{ emptyText: 'No reports' }}
                          columns={[
                            { title: 'Type', dataIndex: 'report_type_name', ellipsis: true },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            dateCol('report_date', 'Date'),
                            { title: 'Summary', dataIndex: 'summary', ellipsis: true },
                          ]}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'leave',
                  label: <span><FileTextOutlined /> Leave & Attendance</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Leave Requests ({leave.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={leave}
                          rowKey="id"
                          pagination={{ pageSize: 8, size: 'small' }}
                          locale={{ emptyText: 'No leave requests' }}
                          columns={[
                            { title: 'Type', dataIndex: 'leave_type_name', ellipsis: true },
                            dateCol('start_date', 'Start'),
                            dateCol('end_date', 'End'),
                            { title: 'Days', dataIndex: 'days_requested', width: 70 },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s, { APPROVED: 'green', PENDING: 'orange', REJECTED: 'red', CANCELLED: 'default' }) },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Sick Notes ({sickNotes.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={sickNotes}
                          rowKey="id"
                          pagination={{ pageSize: 8, size: 'small' }}
                          locale={{ emptyText: 'No sick notes' }}
                          columns={[
                            dateCol('start_date', 'Start'),
                            dateCol('end_date', 'End'),
                            { title: 'Days', dataIndex: 'days', width: 70 },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            { title: 'Diagnosis', dataIndex: 'diagnosis', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Absenteeism ({absenteeism.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={absenteeism}
                          rowKey="id"
                          pagination={{ pageSize: 8, size: 'small' }}
                          locale={{ emptyText: 'No absenteeism records' }}
                          columns={[
                            dateCol('date', 'Date'),
                            { title: 'Reason', dataIndex: 'reason', ellipsis: true },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                            { title: 'Notes', dataIndex: 'notes', ellipsis: true },
                          ]}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'appraisals',
                  label: <span><BookOutlined /> Appraisals</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {appraisalChart && (
                        <GlassCard gradient="amber" style={{ padding: 16 }}>
                          <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Appraisal Score Trend</div>
                          <ReactECharts option={appraisalChart} style={{ height: 200 }} />
                        </GlassCard>
                      )}
                      <Table
                        size="small"
                        dataSource={appraisals}
                        rowKey="id"
                        pagination={{ pageSize: 10, size: 'small' }}
                        locale={{ emptyText: 'No appraisals' }}
                        columns={[
                          dateCol('review_date', 'Review Date'),
                          { title: 'Period', dataIndex: 'review_period', ellipsis: true },
                          { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s) },
                          { title: 'Overall Score', dataIndex: 'overall_score', width: 120, render: (v: any) => v != null ? <Tag color="gold">{v}</Tag> : '-' },
                          { title: 'Reviewer', dataIndex: 'reviewer_name', ellipsis: true },
                          { title: 'Comments', dataIndex: 'comments', ellipsis: true },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  key: 'medical',
                  label: <span><MedicineBoxOutlined /> Medical & Training</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Medical Records ({medicals.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={medicals}
                          rowKey="id"
                          pagination={{ pageSize: 8, size: 'small' }}
                          locale={{ emptyText: 'No medical records' }}
                          columns={[
                            { title: 'Type', dataIndex: 'medical_type_name', ellipsis: true },
                            dateCol('examination_date', 'Exam Date'),
                            dateCol('expiry_date', 'Expiry'),
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s, { CLEARED: 'green', NOT_CLEARED: 'red', RESTRICTED: 'orange', COMPLETED: 'blue' }) },
                            { title: 'Notes', dataIndex: 'notes', ellipsis: true },
                          ]}
                        />
                      </div>
                      <div>
                        <div style={{ color: labelColor, fontWeight: 700, marginBottom: 8 }}>Trainings ({trainings.length})</div>
                        <MobileTable
                          size="small"
                          dataSource={trainings}
                          rowKey="id"
                          pagination={{ pageSize: 8, size: 'small' }}
                          locale={{ emptyText: 'No training records' }}
                          columns={[
                            { title: 'Provider', dataIndex: 'provider', ellipsis: true },
                            { title: 'Training Type', dataIndex: 'training_type_name', ellipsis: true },
                            dateCol('scheduled_date', 'Scheduled'),
                            dateCol('completion_date', 'Completed'),
                            { title: 'Status', dataIndex: 'status', render: (s: string) => statusTag(s, { COMPLETED: 'green', IN_PROGRESS: 'blue', SCHEDULED: 'orange' }) },
                          ]}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </GlassCard>
        </>
      )}
    </div>
  );
}
