import { Select, DatePicker, Tag, Spin, Row, Col, Button, Input } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import http from '../../lib/http';
import ReactECharts from 'echarts-for-react';
import { Filter, Users, BriefcaseBusiness, Activity, Stethoscope, RefreshCw, Search } from 'lucide-react';
import { GlassCard } from '../../components/NeonPrimitives';
import { KPICard } from '../../components/KPICard';

export default function Overview() {
  const queryClient = useQueryClient();
  const hasToken = !!localStorage.getItem('access');
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));
  const [pendingDepartment, setPendingDepartment] = useState<number | null>(null);
  const [pendingRange, setPendingRange] = useState<any>(null);
  const [pendingSearch, setPendingSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{ department: number | null; range: any; search: string }>({
    department: null,
    range: null,
    search: '',
  });

  useEffect(() => {
    const handleWorkspaceChange = () => {
      queryClient.removeQueries({ exact: false, queryKey: ['hcm-summary'] });
      queryClient.removeQueries({ exact: false, queryKey: ['departments-min'] });
      queryClient.removeQueries({ exact: false, queryKey: ['project-stats'] });
      queryClient.removeQueries({ exact: false, queryKey: ['salary-ranges'] });
      queryClient.removeQueries({ exact: false, queryKey: ['medicals-overview'] });
      setWorkspaceId(localStorage.getItem('workspaceId'));
    };
    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    window.addEventListener('storage', handleWorkspaceChange);
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
      window.removeEventListener('storage', handleWorkspaceChange);
    };
  }, [queryClient]);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-min', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/departments/', { params: { page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled: hasToken,
  });

  const { data: hcmSummary } = useQuery({
    queryKey: ['hcm-summary', workspaceId, appliedFilters.department, appliedFilters.range, appliedFilters.search],
    queryFn: async () => {
      const params: any = {};
      if (appliedFilters.department) params.department = appliedFilters.department;
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.range?.[0] && appliedFilters.range?.[1]) {
        params.date_from = appliedFilters.range[0].format('YYYY-MM-DD');
        params.date_to = appliedFilters.range[1].format('YYYY-MM-DD');
      }
      return (await http.get('/api/v1/hcm/employees/summary/', { params })).data;
    },
    enabled: hasToken,
    refetchInterval: 2000,
  });

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats', workspaceId],
    queryFn: async () => (await http.get('/api/v1/core/projects/stats/')).data?.results,
    enabled: hasToken,
    refetchInterval: 2000,
  });

  const { data: salaryRanges = [] } = useQuery({
    queryKey: ['salary-ranges', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/payroll/salary-ranges/');
      const data = res.data?.results || res.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: hasToken,
    refetchInterval: 2000,
  });

  const { data: medicals = [] } = useQuery({
    queryKey: ['medicals-overview', workspaceId, appliedFilters.search],
    queryFn: async () => {
      const params: any = { page_size: 5 };
      if (appliedFilters.search) params.search = appliedFilters.search;
      const res = await http.get('/api/v1/tracking/medicals/', { params });
      const data = res.data?.results || res.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: hasToken,
    refetchInterval: 2000,
  });

  // Only show charts if there's actual data
  const hasProjectData = projectStats && (projectStats.PLANNING > 0 || projectStats.ACTIVE > 0 || projectStats.ON_HOLD > 0 || projectStats.COMPLETED > 0);

  const projectChartOpts = hasProjectData ? {
    backgroundColor: 'transparent',
    title: { text: 'Project Statistics', left: 'center', textStyle: { fontSize: 14, fontWeight: 600, color: '#f7f8fb' } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#c4c8d4' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        label: { show: false },
        data: [
          { value: projectStats?.PLANNING ?? 0, name: 'Planning', itemStyle: { color: '#ffb547' } },
          { value: projectStats?.ACTIVE ?? 0, name: 'Active', itemStyle: { color: '#3ee7ff' } },
          { value: projectStats?.ON_HOLD ?? 0, name: 'On Hold', itemStyle: { color: '#ff4fd8' } },
          { value: projectStats?.COMPLETED ?? 0, name: 'Completed', itemStyle: { color: '#7cff6b' } },
        ],
      },
    ],
  } : null;

  if (!hcmSummary) {
    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GlassCard gradient="gold" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <Spin size="large" />
          <div style={{ color: '#c4c8d4', marginTop: 12 }}>Loading dashboard...</div>
        </GlassCard>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Employees', value: hcmSummary?.employees?.active ?? 0, delta: (hcmSummary?.employees?.active ?? 0) === 0 ? undefined : 8, up: true, icon: <Users className="h-4 w-4" />, color: '#7cff6b' },
    { label: 'Absentism', value: hcmSummary?.employees?.on_leave ?? 0, delta: (hcmSummary?.employees?.on_leave ?? 0) === 0 ? undefined : -2, up: false, icon: <BriefcaseBusiness className="h-4 w-4" />, color: '#ff4fd8' },
    { label: 'Leaves', value: hcmSummary?.leave?.total_requests ?? 0, delta: (hcmSummary?.leave?.total_requests ?? 0) === 0 ? undefined : 2, up: true, icon: <Activity className="h-4 w-4" />, color: '#f5c400' },
    { label: 'Sick Notes', value: hcmSummary?.sick_notes?.total ?? 0, delta: (hcmSummary?.sick_notes?.total ?? 0) === 0 ? undefined : -1, up: false, icon: <Stethoscope className="h-4 w-4" />, color: '#3ee7ff' },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
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
            Workspace Overview
          </div>
          <div className="flex items-center gap-4">
            <Activity className="h-12 w-12" style={{ color: '#f5c400' }} />
            <h1 className="text-5xl font-extrabold" style={{ color: '#f7f8fb', lineHeight: 1.1 }}>
              Workforce Health & Compliance
            </h1>
          </div>
          <p className="text-base max-w-2xl" style={{ color: '#c4c8d4' }}>
            Real-time snapshot of workforce health, active projects, and organizational compliance across all your workspaces.
          </p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard gradient="neutral" style={{ padding: 16 }}>
        <div className="flex flex-wrap items-center gap-3" style={{ rowGap: 6 }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(245, 196, 0, 0.08)', border: '1px solid rgba(245, 196, 0, 0.18)' }}>
            <Filter className="h-4 w-4" style={{ color: '#f5c400' }} />
            <span className="text-sm" style={{ color: '#f7f8fb' }}>Filters</span>
          </div>
          <Select
            allowClear
            placeholder="All Departments"
            style={{ width: 220 }}
            value={pendingDepartment}
            onChange={(val) => setPendingDepartment(val ?? null)}
            options={(departments || []).map((d: any) => ({ value: d.id, label: d.name }))}
          />
          <DatePicker.RangePicker value={pendingRange} onChange={setPendingRange} />
          <Input
            placeholder="Search employee"
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<Search size={14} />}
              onClick={() => setAppliedFilters({
                department: pendingDepartment,
                range: pendingRange,
                search: pendingSearch.trim(),
              })}
            >
              Search
            </Button>
            <Button
              icon={<RefreshCw size={14} />}
              onClick={() => {
                setPendingDepartment(null);
                setPendingRange(null);
                setPendingSearch('');
                setAppliedFilters({ department: null, range: null, search: '' });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Stat cards */}
      <Row gutter={[18, 18]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.label}>
            <KPICard
              title={card.label}
              value={card.value}
              color={card.color}
              gradient={card.color === '#7cff6b' ? 'lime' : card.color === '#ff4fd8' ? 'pink' : card.color === '#3ee7ff' ? 'cyan' : 'amber'}
              delta={card.delta}
            />
          </Col>
        ))}
      </Row>

      {/* Salary + Situations */}
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={12}>
          <GlassCard gradient="cyan" style={{ height: '100%', padding: 16 }}>
            <div className="text-sm" style={{ color: '#c4c8d4', marginBottom: 8 }}>Salary Statistics Performance</div>
            {!salaryRanges || salaryRanges.length === 0 ? (
              <div className="text-center" style={{ color: '#c4c8d4', padding: '24px 0' }}>No salary data available</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {salaryRanges.map((item: any) => (
                  <div key={item.label} className="flex items-center justify-between" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <span style={{ color: '#c4c8d4' }}>{item.label}</span>
                    <Tag color="cyan">{item.employee_count} employees</Tag>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </Col>
        <Col xs={24} xl={12}>
          <GlassCard gradient="amber" style={{ height: '100%', padding: 16 }}>
            <div className="text-sm" style={{ color: '#c4c8d4', marginBottom: 8 }}>Current Situations</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { label: 'Contracts expiring (30d)', value: hcmSummary?.situations?.contracts_expiring_30d ?? 0, color: 'blue' },
                { label: 'Active hearings', value: hcmSummary?.situations?.hearings_active ?? 0, color: 'orange' },
                { label: 'Active investigations', value: hcmSummary?.situations?.investigations_active ?? 0, color: 'magenta' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span style={{ color: '#c4c8d4' }}>{item.label}</span>
                  <Tag color={item.color}>{item.value}</Tag>
                </div>
              ))}
            </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={12}>
          <GlassCard gradient="gold" style={{ height: '100%', padding: 16 }}>
            <div className="text-sm" style={{ color: '#c4c8d4', marginBottom: 8 }}>Project Statistics</div>
            {!projectChartOpts ? (
              <div className="text-center" style={{ color: '#c4c8d4', padding: '24px 0' }}>No project data available</div>
            ) : (
              <ReactECharts option={projectChartOpts} style={{ height: 320, width: '100%' }} />
            )}
          </GlassCard>
        </Col>
        <Col xs={24} xl={12}>
          <GlassCard gradient="cyan" style={{ height: '100%', padding: 16 }}>
            <div className="text-sm" style={{ color: '#c4c8d4', marginBottom: 8 }}>Medical Examinations</div>
            {!medicals || medicals.length === 0 ? (
              <div className="text-center" style={{ color: '#c4c8d4', padding: '24px 0' }}>No medical examination data available</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {medicals.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span style={{ color: '#c4c8d4' }}>
                      {item.employee_name || 'Unknown'}{' '}
                      <span style={{ opacity: 0.7 }}>• {item.medical_type_name || item.medical_type || 'Medical'}</span>
                    </span>
                    <Tag color={item.status === 'CLEARED' ? 'green' : item.status === 'COMPLETED' ? 'blue' : item.status === 'RESTRICTED' || item.status === 'NOT_CLEARED' ? 'red' : 'orange'}>
                      {item.status || 'SCHEDULED'}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </Col>
      </Row>
    </div>
  );
}
