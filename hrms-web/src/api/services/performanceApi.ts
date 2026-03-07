import http from '../../lib/http';

export interface KPI {
  id: number;
  employee: number;
  employee_name?: string;
  kpi_type: 'PRODUCTIVITY' | 'QUALITY' | 'ATTENDANCE' | 'SAFETY' | 'CUSTOMER_SERVICE' | 'TEAMWORK' | 'OTHER';
  title: string;
  description?: string;
  target_value: number;
  actual_value?: number;
  unit?: string;
  period_start: string;
  period_end: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'NOT_ACHIEVED';
  weight?: number;
  notes?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export const performanceApi = {
  // KPIs
  async listKPIs(params?: any): Promise<KPI[]> {
    const res = await http.get('/api/v1/performance/kpis/', { params });
    return res.data?.results || res.data || [];
  },

  async getKPI(id: number): Promise<KPI> {
    const res = await http.get(`/api/v1/performance/kpis/${id}/`);
    return res.data;
  },

  async createKPI(data: Partial<KPI>): Promise<KPI> {
    const res = await http.post('/api/v1/performance/kpis/', data);
    return res.data;
  },

  async updateKPI(id: number, data: Partial<KPI>): Promise<KPI> {
    const res = await http.patch(`/api/v1/performance/kpis/${id}/`, data);
    return res.data;
  },

  async deleteKPI(id: number): Promise<void> {
    await http.delete(`/api/v1/performance/kpis/${id}/`);
  },
};
