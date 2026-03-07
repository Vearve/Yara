import http from '@/lib/http';

export interface SalaryRange {
  id: number;
  label: string;
  currency: string;
  min_gross: number;
  max_gross: number | null;
  employee_count: number;
  updated_at: string;
}

export interface TitleBreakdown {
  id: number;
  position: string;
  currency: string;
  basic: number;
  housing: number;
  transportation: number;
  lunch: number;
  gross: number;
  net: number;
  updated_at: string;
}

export interface PayrollEntry {
  id: number;
  employee: number;
  employee_name: string;
  employee_number: string;
  position: string;
  date_of_hire: string;
  department: string;
  resident: string;
  currency: string;
  basic: number;
  housing: number;
  transportation: number;
  lunch: number;
  gross: number;
  net: number;
  created_at: string;
  updated_at: string;
}

export const salaryApi = {
  // Fetch all salary ranges
  getSalaryRanges: async (): Promise<SalaryRange[]> => {
    const res = await http.get('/api/v1/payroll/salary-ranges/');
    return res.data?.results || res.data;
  },

  // Fetch single salary range
  getSalaryRange: async (id: number): Promise<SalaryRange> => {
    const res = await http.get(`/api/v1/payroll/salary-ranges/${id}/`);
    return res.data;
  },

  // Create salary range
  createSalaryRange: async (data: Omit<SalaryRange, 'id'>): Promise<SalaryRange> => {
    const res = await http.post('/api/v1/payroll/salary-ranges/', data);
    return res.data;
  },

  // Update salary range
  updateSalaryRange: async (id: number, data: Partial<SalaryRange>): Promise<SalaryRange> => {
    const res = await http.patch(`/api/v1/payroll/salary-ranges/${id}/`, data);
    return res.data;
  },

  // Delete salary range
  deleteSalaryRange: async (id: number): Promise<void> => {
    await http.delete(`/api/v1/payroll/salary-ranges/${id}/`);
  },

  // Fetch all title breakdowns
  getTitleBreakdowns: async (): Promise<TitleBreakdown[]> => {
    const res = await http.get('/api/v1/payroll/title-breakdowns/');
    return res.data?.results || res.data;
  },

  // Fetch single title breakdown
  getTitleBreakdown: async (id: number): Promise<TitleBreakdown> => {
    const res = await http.get(`/api/v1/payroll/title-breakdowns/${id}/`);
    return res.data;
  },

  // Create title breakdown
  createTitleBreakdown: async (data: Omit<TitleBreakdown, 'id'>): Promise<TitleBreakdown> => {
    const res = await http.post('/api/v1/payroll/title-breakdowns/', data);
    return res.data;
  },

  // Update title breakdown
  updateTitleBreakdown: async (id: number, data: Partial<TitleBreakdown>): Promise<TitleBreakdown> => {
    const res = await http.patch(`/api/v1/payroll/title-breakdowns/${id}/`, data);
    return res.data;
  },

  // Delete title breakdown
  deleteTitleBreakdown: async (id: number): Promise<void> => {
    await http.delete(`/api/v1/payroll/title-breakdowns/${id}/`);
  },

  // Fetch all payroll entries
  getPayrollEntries: async (): Promise<PayrollEntry[]> => {
    const res = await http.get('/api/v1/payroll/entries/');
    return res.data?.results || res.data;
  },

  // Fetch single payroll entry
  getPayrollEntry: async (id: number): Promise<PayrollEntry> => {
    const res = await http.get(`/api/v1/payroll/entries/${id}/`);
    return res.data;
  },

  // Create payroll entry
  createPayrollEntry: async (data: Omit<PayrollEntry, 'id'>): Promise<PayrollEntry> => {
    const res = await http.post('/api/v1/payroll/entries/', data);
    return res.data;
  },

  // Update payroll entry
  updatePayrollEntry: async (id: number, data: Partial<PayrollEntry>): Promise<PayrollEntry> => {
    const res = await http.patch(`/api/v1/payroll/entries/${id}/`, data);
    return res.data;
  },

  // Delete payroll entry
  deletePayrollEntry: async (id: number): Promise<void> => {
    await http.delete(`/api/v1/payroll/entries/${id}/`);
  },
};
