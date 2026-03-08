import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryApi } from '@/api/services/salaryApi';
import type { SalaryRange, TitleBreakdown, PayrollEntry } from '@/api/services/salaryApi';

// Salary Range Hooks
export const useSalaryRanges = () => {
  return useQuery({
    queryKey: ['salaryRanges'],
    queryFn: () => salaryApi.getSalaryRanges(),
  });
};

export const useSalaryRange = (id: number) => {
  return useQuery({
    queryKey: ['salaryRange', id],
    queryFn: () => salaryApi.getSalaryRange(id),
  });
};

export const useCreateSalaryRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SalaryRange, 'id'>) => salaryApi.createSalaryRange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRanges'] });
    },
  });
};

export const useUpdateSalaryRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SalaryRange> }) =>
      salaryApi.updateSalaryRange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRanges'] });
    },
  });
};

export const useDeleteSalaryRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.deleteSalaryRange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRanges'] });
    },
  });
};

// Title Breakdown Hooks
export const useTitleBreakdowns = () => {
  return useQuery({
    queryKey: ['titleBreakdowns'],
    queryFn: () => salaryApi.getTitleBreakdowns(),
  });
};

export const useTitleBreakdown = (id: number) => {
  return useQuery({
    queryKey: ['titleBreakdown', id],
    queryFn: () => salaryApi.getTitleBreakdown(id),
  });
};

export const useCreateTitleBreakdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TitleBreakdown, 'id'>) => salaryApi.createTitleBreakdown(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titleBreakdowns'] });
    },
  });
};

export const useUpdateTitleBreakdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TitleBreakdown> }) =>
      salaryApi.updateTitleBreakdown(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titleBreakdowns'] });
    },
  });
};

export const useDeleteTitleBreakdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.deleteTitleBreakdown(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['titleBreakdowns'] });
    },
  });
};

// Payroll Entry Hooks
export const usePayrollEntries = () => {
  return useQuery({
    queryKey: ['payrollEntries'],
    queryFn: () => salaryApi.getPayrollEntries(),
  });
};

export const usePayrollEntry = (id: number) => {
  return useQuery({
    queryKey: ['payrollEntry', id],
    queryFn: () => salaryApi.getPayrollEntry(id),
  });
};

export const useCreatePayrollEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PayrollEntry, 'id'>) => salaryApi.createPayrollEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollEntries'] });
    },
  });
};

export const useUpdatePayrollEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PayrollEntry> }) =>
      salaryApi.updatePayrollEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollEntries'] });
    },
  });
};

export const useDeletePayrollEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.deletePayrollEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollEntries'] });
    },
  });
};
