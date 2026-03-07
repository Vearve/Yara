import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Row, Col, Table, Select, DatePicker, Button, Space, Input } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import http from '../../lib/http';
import { KPICard } from '../../components/KPICard';
import { GlassCard } from '../../components/NeonPrimitives';

type TurnoverDetails = {
  engagements: number;
  terminations: number;
  active_employees: number;
  turnover_rate: number;
};

type ClassificationSummary = {
  local: number;
  regional: number;
  national: number;
  expatriate: number;
};

export default function Summary() {
  const queryClient = useQueryClient();
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));

  useEffect(() => {
    const handleWorkspaceChange = () => {
      const newWorkspaceId = localStorage.getItem('workspaceId');
      setWorkspaceId(newWorkspaceId);
      queryClient.removeQueries({ exact: false, queryKey: ['weekly-headcount'] });
      queryClient.removeQueries({ exact: false, queryKey: ['departments-min'] });
      queryClient.removeQueries({ exact: false, queryKey: ['classification-summary'] });
      queryClient.removeQueries({ exact: false, queryKey: ['turnover-details'] });
    };
    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    return () => window.removeEventListener('workspaceChanged', handleWorkspaceChange);
  }, [queryClient]);

  // Also clear cache whenever workspaceId changes (backup for page navigation)
  useEffect(() => {
    queryClient.removeQueries({ exact: false, queryKey: ['weekly-headcount'] });
    queryClient.removeQueries({ exact: false, queryKey: ['departments-min'] });
    queryClient.removeQueries({ exact: false, queryKey: ['classification-summary'] });
    queryClient.removeQueries({ exact: false, queryKey: ['turnover-details'] });
  }, [workspaceId, queryClient]);


  // Scope/Range filters (classification)
  const [scope, setScope] = useState<string | null>(null);
  const [range, setRange] = useState<any>(null);

  // Turnover filters (department/search/date)
  const [pendingDept, setPendingDept] = useState<number | null>(null);
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingDateRange, setPendingDateRange] = useState<any>(null);
  const [appliedFilters, setAppliedFilters] = useState<{
    dept: number | null;
    search: string;
    dateRange: any;
  }>({
    dept: null,
    search: '',
    dateRange: null,
  });

  const { data, isLoading } = useQuery<TurnoverDetails>({
    queryKey: [
      'turnover-details',
      workspaceId,
      appliedFilters.dept,
      appliedFilters.search,
      appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
      appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
    ],
    queryFn: async () => {
      const params: any = {};
      if (appliedFilters.dept) params.department = appliedFilters.dept;
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.dateRange?.[0]) params.date_from = appliedFilters.dateRange[0].format('YYYY-MM-DD');
      if (appliedFilters.dateRange?.[1]) params.date_to = appliedFilters.dateRange[1].format('YYYY-MM-DD');

      const res = await http.get('/api/v1/performance/kpis/turnover_details/', { params });
      return res.data as TurnoverDetails;
    },
    enabled: !!workspaceId,
  });

  const { data: classificationData, isLoading: classificationLoading, refetch: refetchClassification } = useQuery<ClassificationSummary>({
    queryKey: ['classification-summary', workspaceId, scope, range?.[0]?.toString(), range?.[1]?.toString()],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/employees/classification_summary/');
      return res.data as ClassificationSummary;
    },
    enabled: !!workspaceId,
  });

  // Fetch weekly headcount data
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-headcount', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/employees/weekly_headcount/');
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-min', workspaceId],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/departments/', { params: { page_size: 200 } });
      return res.data?.results || res.data || [];
    },
    enabled: !!workspaceId,
  });

  const filteredClassification = useMemo(() => {
    if (!classificationData) return null;
    if (!scope) return classificationData;
    const key = scope === 'expat' ? 'expatriate' : scope;
    return { [key]: classificationData[key as keyof ClassificationSummary] ?? 0 } as ClassificationSummary;
  }, [classificationData, scope]);

  const engagements = data?.engagements ?? 0;
  const terminations = data?.terminations ?? 0;
  const active = data?.active_employees ?? 0;
  const turnoverRate = data?.turnover_rate ?? 0;

  const categoryCols: any[] = [
    { title: 'Local Employees', dataIndex: 'local', key: 'local' },
    { title: 'Regional Employees', dataIndex: 'regional', key: 'regional' },
    { title: 'National Employees', dataIndex: 'national', key: 'national' },
    { title: 'Expat Employees', dataIndex: 'expatriate', key: 'expatriate' },
  ];

  const weekCols: any[] = [
    { title: 'Previous Week Actual Total', dataIndex: 'prev_total' },
    { title: 'Difference in Headcount', dataIndex: 'diff' },
    { title: 'Comment', dataIndex: 'comment' },
  ];

  return (
    <div id="summary-root" style={{ padding: '24px' }}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Human Capital</div>
        <h1 style={{ margin: 0, color: '#f7f8fb', fontSize: '32px', fontWeight: 700 }}>Turnover Summary</h1>
        <p style={{ margin: '8px 0 0 0', color: '#c4c8d4', fontSize: '14px' }}>Engagements, terminations, and workforce metrics</p>
      </div>


      <Space style={{ marginBottom: 16 }} wrap>
        {/* Turnover Filters */}
        <Select
          allowClear
          placeholder="Filter by department"
          style={{ width: 240 }}
          value={pendingDept}
          onChange={(val) => setPendingDept(val ?? null)}
          options={(departments || []).map((d: any) => ({ value: d.id, label: d.name }))}
        />
        <Input
          placeholder="Search employee"
          value={pendingSearch}
          onChange={(e) => setPendingSearch(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
        <DatePicker.RangePicker value={pendingDateRange} onChange={setPendingDateRange} />
        <Button
          type="primary"
          onClick={() =>
            setAppliedFilters({
              dept: pendingDept,
              search: pendingSearch.trim(),
              dateRange: pendingDateRange,
            })
          }
        >
          Search Turnover
        </Button>

        {/* Classification Filters */}
        <Select
          placeholder="Classification scope"
          style={{ width: 200 }}
          value={scope || undefined}
          onChange={setScope}
          allowClear
        >
          <Select.Option value="local">Local</Select.Option>
          <Select.Option value="regional">Regional</Select.Option>
          <Select.Option value="national">National</Select.Option>
          <Select.Option value="expat">Expatriates</Select.Option>
        </Select>
        <DatePicker.RangePicker value={range} onChange={setRange} />
        <Button type="primary" onClick={() => {
          refetchClassification();
        }}>Apply Classification</Button>

        {/* Reset All */}
        <Button onClick={() => {
          setPendingDept(null);
          setPendingSearch('');
          setPendingDateRange(null);
          setAppliedFilters({ dept: null, search: '', dateRange: null });
          setScope(null);
          setRange(null);
          refetchClassification();
        }}>Reset All</Button>

        {/* Export PDF */}
        <Button onClick={async () => {
          const el = document.getElementById('summary-root');
          if (!el) return;
          const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0b0f1a' });
          const img = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pw = pdf.internal.pageSize.getWidth();
          const ph = pdf.internal.pageSize.getHeight();
          const ih = (canvas.height * pw) / canvas.width;
          if (ih <= ph) {
            pdf.addImage(img, 'PNG', 0, 0, pw, ih);
          } else {
            const ratio = ph / ih;
            pdf.addImage(img, 'PNG', 0, 0, pw * ratio, ih * ratio);
          }
          pdf.save('hcm-summary.pdf');
        }}>Export PDF</Button>
      </Space>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {[
          {
            title: 'Engagements (12m)',
            value: engagements,
            color: '#7cff6b',
            gradient: 'lime' as const,
            icon: '↑',
            delta: engagements === 0 ? undefined : 12.4,
          },
          {
            title: 'Terminations (12m)',
            value: terminations,
            color: '#ff4fd8',
            gradient: 'pink' as const,
            icon: '↓',
            delta: terminations === 0 ? undefined : -8.2,
          },
          {
            title: 'Active Employees',
            value: active,
            color: '#3ee7ff',
            gradient: 'cyan' as const,
            icon: '👥',
            delta: active === 0 ? undefined : 5.7,
          },
          {
            title: 'Turnover Rate',
            value: turnoverRate,
            suffix: '%',
            color: '#ffb547',
            gradient: 'amber' as const,
            icon: '%',
            delta: turnoverRate === 0 ? undefined : -3.1,
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <KPICard
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              color={item.color}
              gradient={item.gradient}
              icon={item.icon}
              delta={item.delta}
              loading={isLoading}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <GlassCard
            gradient="gold"
            title="Summary by Employee Classification"
            style={{ height: '100%' }}
          >
            <Table
              columns={categoryCols}
              dataSource={[{
                key: 1,
                local: filteredClassification?.local ?? 0,
                regional: filteredClassification?.regional ?? 0,
                national: filteredClassification?.national ?? 0,
                expatriate: filteredClassification?.expatriate ?? 0
              }]}
              pagination={false}
              loading={classificationLoading}
              style={{ color: '#f7f8fb' }}
            />
          </GlassCard>
        </Col>
        <Col xs={24} lg={12}>
          <GlassCard
            gradient="gold"
            title="Weekly Headcount Movement"
            style={{ height: '100%' }}
          >
            <Table
              columns={weekCols}
              dataSource={[{
                key: 1,
                prev_total: weeklyData?.previous_week_total ?? 0,
                diff: weeklyData?.headcount_difference ?? 0,
                comment: weeklyData?.comment || ''
              }]}
              pagination={false}
              style={{ color: '#f7f8fb' }}
            />
          </GlassCard>
        </Col>
      </Row>
    </div>
  );
}
