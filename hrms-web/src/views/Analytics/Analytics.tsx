import { Table, Tag, Button, Spin, Select, DatePicker, Row, Col, Modal } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Filter, RefreshCw, TrendingUp, Activity, Flame, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GlassCard, TagPill } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';
import { analyticsApi } from '../../api/services/analyticsApi';
import type { AnalyticsData } from '../../api/services/analyticsApi';
import http from '../../lib/http';
import dayjs from 'dayjs';
import { exportTableToPDF } from '../../lib/pdfExport';

export default function Analytics() {
  const queryClient = useQueryClient();
  const defaultFilters = {
    departmentId: null as number | null,
    jobTitle: null as string | null,
    employeeId: null as number | null,
    dateRange: null as any,
  };
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [summaryRange, setSummaryRange] = useState<any>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));

  useEffect(() => {
    const handleWorkspaceChange = () => {
      const newWorkspaceId = localStorage.getItem('workspaceId');
      setWorkspaceId(newWorkspaceId);
      queryClient.removeQueries({ exact: false, queryKey: ['departments-list'] });
      queryClient.removeQueries({ exact: false, queryKey: ['employees-list-min'] });
    };
    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    window.addEventListener('storage', handleWorkspaceChange);
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
      window.removeEventListener('storage', handleWorkspaceChange);
    };
  }, [queryClient]);

  // Also clear cache whenever workspaceId changes (backup for page navigation)
  useEffect(() => {
    queryClient.removeQueries({ exact: false, queryKey: ['departments-list'] });
    queryClient.removeQueries({ exact: false, queryKey: ['employees-list-min'] });
  }, [workspaceId, queryClient]);

  const { data: departments } = useQuery({
    queryKey: ['departments-list', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/departments/', { params: { page_size: 100 } });
      return res.data?.results || res.data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list-min', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/employees/', { params: { page_size: 200 } });
      return res.data?.results || res.data || [];
    },
  });

  const jobTitles = Array.from(new Set((employees || []).map((e: any) => e.job_title).filter(Boolean))) as string[];

  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', workspaceId, appliedFilters],
    queryFn: () => analyticsApi.getAnalytics({
      departmentId: appliedFilters.departmentId,
      jobTitle: appliedFilters.jobTitle,
      employeeId: appliedFilters.employeeId,
      dateRange: appliedFilters.dateRange,
    }),
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 space-y-4">
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xl font-semibold mb-2">Analytics & KPIs</div>
          <p className="text-sm text-[var(--text-dim)]">Failed to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const kpiData = analytics.kpis;
  const hcmData = analytics.hcm;
  const recruitmentData = analytics.recruitment;
  const salaryData = analytics.salary;
  const caseStudiesData = analytics.case_studies;
  const employeeTrendData = analytics.employee_trend;
  const departmentData = analytics.department_distribution;
  const trainingData = analytics.training_completion;
  const recruitmentFunnelData = analytics.recruitment_funnel;

  // Ensure charts render even when API returns empty arrays
  const employeeTrend = employeeTrendData && employeeTrendData.length > 0
    ? employeeTrendData
    : [
        { month: 'Jan', active: 0, inactive: 0, on_leave: 0 },
        { month: 'Feb', active: 0, inactive: 0, on_leave: 0 },
        { month: 'Mar', active: 0, inactive: 0, on_leave: 0 },
      ];

  const departmentDist = departmentData && departmentData.length > 0
    ? departmentData
    : [{ name: 'No data', value: 0 }];

  const trainingCompletion = trainingData && trainingData.length > 0
    ? trainingData
    : [
        { month: 'Jan', completed: 0, pending: 0 },
        { month: 'Feb', completed: 0, pending: 0 },
        { month: 'Mar', completed: 0, pending: 0 },
      ];

  const recruitmentFunnel = recruitmentFunnelData && recruitmentFunnelData.length > 0
    ? recruitmentFunnelData
    : [
        { stage: 'Applicants', value: 0 },
        { stage: 'Screened', value: 0 },
        { stage: 'Interviews', value: 0 },
        { stage: 'Offers', value: 0 },
      ];

  const colors = ['#f5c400', '#3ee7ff', '#ff4fd8', '#7cff6b', '#ffb547'];

  const monthlySummaryRows = (analytics.monthly_summary || [])
    .filter((row: any) => {
      if (!summaryRange?.[0] || !summaryRange?.[1]) return true;
      const parsed = dayjs(row.month, ['MMM YYYY', 'YYYY-MM', 'YYYY/MM']);
      if (!parsed.isValid()) return false;
      const from = dayjs(summaryRange[0].format('YYYY-MM-DD'));
      const to = dayjs(summaryRange[1].format('YYYY-MM-DD'));
      return parsed.isAfter(from.subtract(1, 'day')) && parsed.isBefore(to.add(1, 'day'));
    })
    .sort((a: any, b: any) => {
      const aDate = dayjs(a.month, ['MMM YYYY', 'YYYY-MM', 'YYYY/MM']).valueOf();
      const bDate = dayjs(b.month, ['MMM YYYY', 'YYYY-MM', 'YYYY/MM']).valueOf();
      return bDate - aDate;
    });

  const kpiCards = [
    {
      label: 'Retention Rate',
      value: `${Number(kpiData.retention_rate ?? 0).toFixed(2)}%`,
      deltaValue: Number(kpiData.retention_change ?? 0).toFixed(2),
      color: '#7cff6b',
    },
    {
      label: 'Turnover Rate',
      value: `${Number(kpiData.turnover_rate ?? 0).toFixed(2)}%`,
      deltaValue: Number(kpiData.turnover_change ?? 0).toFixed(2),
      color: '#ff4fd8',
    },
    {
      label: 'Overtime Rate',
      value: `${Number(kpiData.overtime_rate ?? 0).toFixed(2)}%`,
      deltaValue: Number(kpiData.overtime_change ?? 0).toFixed(2),
      color: '#ffb547',
    },
    {
      label: 'Offer Acceptance',
      value: `${kpiData.offer_acceptance ?? 0}%`,
      deltaValue: kpiData.acceptance_change ?? 0,
      color: '#3ee7ff',
    },
  ];

  const exportPdf = async () => {
    const el = document.getElementById('analytics-root');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0b0f1a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      const ratio = pageHeight / imgHeight;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    }
    pdf.save('analytics.pdf');
  };

  return (
    <div id="analytics-root" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden" style={{ padding: '32px 40px' }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(245, 196, 0, 0.12) 0%, rgba(62, 231, 255, 0.08) 50%, rgba(124, 255, 107, 0.06) 100%)',
          border: '1px solid rgba(245, 196, 0, 0.2)',
        }} />
        <div className="absolute inset-0 blur-3xl opacity-30" style={{
          background: 'radial-gradient(at top right, rgba(245, 196, 0, 0.3), transparent 70%)',
        }} />
        <div className="relative flex flex-col gap-4">
          <div className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: '#9195a3' }}>
            Dashboard
          </div>
          <div className="text-sm uppercase tracking-[0.3em] font-semibold" style={{ color: '#f5c400' }}>
            Performance Metrics
          </div>
          <div className="flex items-center gap-4">
            <Activity className="h-12 w-12" style={{ color: '#f5c400' }} />
            <h1 className="text-5xl font-extrabold" style={{ color: '#f7f8fb', lineHeight: 1.1 }}>
              Real-Time Analytics Dashboard
            </h1>
          </div>
          <p className="text-base max-w-2xl" style={{ color: '#c4c8d4' }}>
            Monitor HR metrics, recruitment funnels, payroll insights, and workforce performance across your entire organization with live data visualization.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Button 
              type="primary" 
              size="large"
              icon={<Download size={18} />}
              onClick={exportPdf}
              style={{ 
                background: '#f5c400', 
                borderColor: '#f5c400', 
                color: '#05060a', 
                fontWeight: 600,
                height: 44,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              Export Report
            </Button>
            <Button 
              size="large"
              icon={<RefreshCw size={18} />}
              onClick={() => {
                setPendingFilters(defaultFilters);
                setAppliedFilters(defaultFilters);
              }}
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                borderColor: 'rgba(245,196,0,0.4)', 
                color: '#f7f8fb',
                height: 44,
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5" style={{ color: '#f5c400' }} />
          <span className="text-base font-semibold" style={{ color: '#f7f8fb' }}>Filter Data</span>
        </div>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              showSearch
              placeholder="Select Department"
              style={{ width: '100%' }}
              value={pendingFilters.departmentId}
              onChange={(value) => setPendingFilters({ ...pendingFilters, departmentId: value })}
              options={(departments || []).map((d: any) => ({ label: d.name, value: d.id }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              showSearch
              placeholder="Select Job Title"
              style={{ width: '100%' }}
              value={pendingFilters.jobTitle}
              onChange={(value) => setPendingFilters({ ...pendingFilters, jobTitle: value })}
              options={jobTitles.map((t: string) => ({ label: t, value: t }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              showSearch
              placeholder="Select Employee"
              style={{ width: '100%' }}
              value={pendingFilters.employeeId}
              onChange={(value) => setPendingFilters({ ...pendingFilters, employeeId: value })}
              optionFilterProp="label"
              options={(employees || []).map((e: any) => ({ 
                label: `${e.first_name} ${e.last_name} (${e.employee_id})`, 
                value: e.id 
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={pendingFilters.dateRange}
              onChange={(value) => setPendingFilters({ ...pendingFilters, dateRange: value })}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<Filter className="h-4 w-4" />}
              onClick={() => setAppliedFilters(pendingFilters)}
              style={{ width: '100%' }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </GlassCard>

      {/* Quick Tags */}
      <div className="flex flex-wrap gap-2" style={{ rowGap: 4 }}>
        <TagPill variant="gold">All</TagPill>
        <TagPill variant="cyan">HCM</TagPill>
        <TagPill variant="lime">Recruitment</TagPill>
        <TagPill variant="amber">Payroll</TagPill>
        <TagPill variant="pink">Case Studies</TagPill>
      </div>

      {/* KPI Cards */}
      <Row gutter={[14, 14]}>
        {kpiCards.map((card) => {
          const gradient = card.color === '#7cff6b'
            ? 'lime'
            : card.color === '#ff4fd8'
            ? 'pink'
            : card.color === '#ffb547'
            ? 'amber'
            : 'cyan';
          return (
            <Col xs={24} sm={12} xl={6} key={card.label}>
              <KPICard
                title={card.label}
                value={card.value}
                color={card.color}
                gradient={gradient as any}
                delta={card.deltaValue}
              />
            </Col>
          );
        })}
      </Row>

      {/* Module Stats */}
      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <GlassCard gradient="cyan">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#3ee7ff' }}>
              <Activity className="h-4 w-4" /> HCM
            </div>
            <div className="text-xs text-[var(--text-dim)]">Total Employees</div>
            <div className="text-2xl font-semibold">{hcmData.total_employees}</div>
            <div className="text-xs text-[var(--text-dim)]">Active: {hcmData.active_engagements} · Departments: {hcmData.departments}</div>
          </GlassCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <GlassCard gradient="pink">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#ff4fd8' }}>
              <TrendingUp className="h-4 w-4" /> Recruitment
            </div>
            <div className="text-xs text-[var(--text-dim)]">Active ATRs</div>
            <div className="text-2xl font-semibold">{recruitmentData.active_atrs}</div>
            <div className="text-xs text-[var(--text-dim)]">Candidates: {recruitmentData.total_candidates} · Interviews: {recruitmentData.interviews_scheduled}</div>
          </GlassCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <GlassCard gradient="lime">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7cff6b' }}>
              <Flame className="h-4 w-4" /> Salaries
            </div>
            <div className="text-xs text-[var(--text-dim)]">Avg Gross Salary</div>
            <div className="text-2xl font-semibold">ZMW {salaryData.avg_gross.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-dim)]">Total Payroll: ZMW {(salaryData.total_payroll / 1000).toFixed(0)}k</div>
          </GlassCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <GlassCard gradient="amber">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#f5c400' }}>
              <Activity className="h-4 w-4" /> Case Studies
            </div>
            <div className="text-xs text-[var(--text-dim)]">Under Review</div>
            <div className="text-2xl font-semibold">{caseStudiesData.under_review}</div>
            <div className="text-xs text-[var(--text-dim)]">Opened: {caseStudiesData.opened} · Resolved: {caseStudiesData.resolved}</div>
          </GlassCard>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <GlassCard gradient="neutral">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#ffe37a' }}>
              <TrendingUp className="h-4 w-4" /> Appraisals
            </div>
            <div className="text-xs text-[var(--text-dim)]">In Progress</div>
            <div className="text-2xl font-semibold">–</div>
            <Button type="primary" className="mt-1">Open Appraisals</Button>
          </GlassCard>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[14, 14]}>
        <Col xs={24} xl={12}>
          <GlassCard gradient="gold" style={{ height: '100%' }}>
          <div className="text-sm text-[var(--text-dim)] mb-3">Employee Status Trend</div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employeeTrend}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(245, 196, 0, 0.08)" 
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <YAxis stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(5, 6, 10, 0.95)', 
                    border: '1px solid rgba(245, 196, 0, 0.35)',
                    borderRadius: '10px',
                    color: '#f7f8fb',
                  }}
                  labelStyle={{ color: '#f5c400' }}
                />
                <Legend wrapperStyle={{ color: '#c4c8d4' }} />
                <Line type="monotone" dataKey="active" stroke="#7cff6b" name="Active" strokeWidth={3} dot={{ fill: '#7cff6b', r: 4 }} />
                <Line type="monotone" dataKey="inactive" stroke="#ff4fd8" name="Inactive" strokeWidth={3} dot={{ fill: '#ff4fd8', r: 4 }} />
                <Line type="monotone" dataKey="on_leave" stroke="#ffb547" name="On Leave" strokeWidth={3} dot={{ fill: '#ffb547', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </GlassCard>
        </Col>
        <Col xs={24} xl={12}>
          <GlassCard gradient="cyan" style={{ height: '100%' }}>
          <div className="text-sm text-[var(--text-dim)] mb-3">Department Distribution</div>
          <div style={{ width: '100%', height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {departmentDist.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                  <Tooltip contentStyle={{ 
                    background: 'rgba(5, 6, 10, 0.95)', 
                    border: '1px solid rgba(245, 196, 0, 0.35)',
                    borderRadius: '10px',
                    color: '#f7f8fb',
                  }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          </GlassCard>
        </Col>
      </Row>

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={12}>
          <GlassCard gradient="lime" style={{ height: '100%' }}>
          <div className="text-sm text-[var(--text-dim)] mb-3">Training Completion Rate</div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingCompletion}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(245, 196, 0, 0.08)" 
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <YAxis stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <Tooltip contentStyle={{ 
                  background: 'rgba(5, 6, 10, 0.95)', 
                  border: '1px solid rgba(245, 196, 0, 0.35)',
                  borderRadius: '10px',
                  color: '#f7f8fb',
                }} labelStyle={{ color: '#f5c400' }} />
                <Legend wrapperStyle={{ color: '#c4c8d4' }} />
                <Bar dataKey="completed" stackId="a" fill="#7cff6b" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#f5c400" name="Pending" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </GlassCard>
        </Col>
        <Col xs={24} xl={12}>
          <GlassCard gradient="amber" style={{ height: '100%' }}>
          <div className="text-sm text-[var(--text-dim)] mb-3">Recruitment Funnel</div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recruitmentFunnel} layout="vertical">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(245, 196, 0, 0.08)" 
                  horizontal={false}
                />
                <XAxis type="number" stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <YAxis dataKey="stage" type="category" width={120} stroke="#9195a3" tick={{ fill: '#c4c8d4' }} tickLine={false} axisLine={{ stroke: 'rgba(245, 196, 0, 0.2)' }} />
                <Tooltip contentStyle={{ 
                  background: 'rgba(5, 6, 10, 0.95)', 
                  border: '1px solid rgba(245, 196, 0, 0.35)',
                  borderRadius: '10px',
                  color: '#f7f8fb',
                }} labelStyle={{ color: '#f5c400' }} />
                <Bar dataKey="count" fill="#3ee7ff" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Summary Table */}
      <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] shadow-glow" style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="text-sm text-[var(--text-dim)]">Monthly Performance Summary</div>
          <DatePicker.RangePicker value={summaryRange} onChange={setSummaryRange as any} />
        </div>
        <Table
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
          scroll={{ x: 1400 }}
          columns={[
            { title: 'Month', dataIndex: 'month', key: 'month', fixed: 'left', width: 120 },
            {
              title: 'Active Employees',
              dataIndex: 'active',
              key: 'active',
              width: 130,
              render: (text) => <span className="font-semibold" style={{ color: '#7cff6b' }}>{text}</span>,
            },
            {
              title: 'Engagements',
              dataIndex: 'engagements',
              key: 'engagements',
              width: 120,
              render: (text) => <Tag color="blue">{text}</Tag>,
            },
            {
              title: 'Terminations',
              dataIndex: 'terminations',
              key: 'terminations',
              width: 120,
              render: (text) => <Tag color="red">{text}</Tag>,
            },
            {
              title: 'Leaves',
              dataIndex: 'leaves',
              key: 'leaves',
              width: 100,
              render: (text) => <Tag color="orange">{text}</Tag>,
            },
            {
              title: 'Sick Notes',
              dataIndex: 'sickNotes',
              key: 'sickNotes',
              width: 110,
              render: (text) => <Tag color="purple">{text}</Tag>,
            },
            {
              title: 'Absenteeism',
              dataIndex: 'absenteeism',
              key: 'absenteeism',
              width: 120,
              render: (text) => <Tag color="volcano">{text}</Tag>,
            },
            {
              title: 'Training Completed',
              dataIndex: 'completed',
              key: 'completed',
              width: 150,
              render: (text) => <span>{text}%</span>,
            },
            {
              title: 'Offers Accepted',
              dataIndex: 'offers',
              key: 'offers',
              width: 130,
              render: (text) => <Tag color="geekblue">{text}</Tag>,
            },
            {
              title: 'Action',
              key: 'action',
              width: 160,
              render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedSummary(record);
                      setSummaryModalOpen(true);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      exportTableToPDF(
                        `Monthly Performance Summary - ${record.month}`,
                        ['Month', 'Active', 'Engagements', 'Terminations', 'Leaves', 'Sick Notes', 'Absenteeism', 'Training %', 'Offers'],
                        [[
                          record.month,
                          record.active,
                          record.engagements,
                          record.terminations,
                          record.leaves,
                          record.sickNotes,
                          record.absenteeism,
                          record.completed,
                          record.offers,
                        ]],
                        `Monthly_Performance_${record.month}.pdf`
                      );
                    }}
                  >
                    PDF
                  </Button>
                </div>
              ),
            },
          ]}
          dataSource={monthlySummaryRows}
        />
      </div>

      <Modal
        title={selectedSummary ? `Monthly Summary - ${selectedSummary.month}` : 'Monthly Summary'}
        open={summaryModalOpen}
        onCancel={() => setSummaryModalOpen(false)}
        footer={null}
      >
        {selectedSummary && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div><strong>Active Employees:</strong> {selectedSummary.active}</div>
            <div><strong>Engagements:</strong> {selectedSummary.engagements}</div>
            <div><strong>Terminations:</strong> {selectedSummary.terminations}</div>
            <div><strong>Leaves:</strong> {selectedSummary.leaves}</div>
            <div><strong>Sick Notes:</strong> {selectedSummary.sickNotes}</div>
            <div><strong>Absenteeism:</strong> {selectedSummary.absenteeism}</div>
            <div><strong>Training Completed:</strong> {selectedSummary.completed}%</div>
            <div><strong>Offers Accepted:</strong> {selectedSummary.offers}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
