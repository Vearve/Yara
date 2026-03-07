import http from '@/lib/http';

export interface EmployeeLite {
  id: number;
  employee_id: string;
  full_name: string;
}

export const hcmApi = {
  searchEmployees: async (q: string): Promise<EmployeeLite[]> => {
    const res = await http.get('/api/v1/hcm/employees/', { params: { search: q, page_size: 10 } as any });
    const data = res.data?.results || res.data || [];
    return (data as any[]).map((e: any) => ({ id: e.id, employee_id: e.employee_id, full_name: e.full_name }));
  },
};
