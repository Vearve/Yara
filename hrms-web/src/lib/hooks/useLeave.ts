import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/api/services/leaveApi';

export const useLeaveRequests = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['leaveRequests', workspaceId], 
    queryFn: () => leaveApi.getLeaveRequests(),
    enabled: !!workspaceId,
  });
};

export const useLeaveSummary = (employee?: number) => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['leaveSummary', workspaceId, employee], 
    queryFn: () => leaveApi.getLeaveSummary(employee),
    enabled: !!workspaceId,
  });
};

export const useCreateLeaveRequest = () => {
  const qc = useQueryClient();
    const workspaceId = localStorage.getItem('workspaceId');
  return useMutation({
    mutationFn: (data: Parameters<typeof leaveApi.createLeaveRequest>[0]) => leaveApi.createLeaveRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests', workspaceId] });
      qc.invalidateQueries({ queryKey: ['leaveSummary', workspaceId] });
    },
  });
};

export const useApproveLeave = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.approveLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests', workspaceId] });
      qc.invalidateQueries({ queryKey: ['leaveSummary', workspaceId] });
    },
  });
};

export const useRejectLeave = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.rejectLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests', workspaceId] });
      qc.invalidateQueries({ queryKey: ['leaveSummary', workspaceId] });
    },
  });
};

export const useCancelLeave = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.cancelLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests', workspaceId] });
      qc.invalidateQueries({ queryKey: ['leaveSummary', workspaceId] });
    },
  });
};

export const useSickNotes = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['sickNotes', workspaceId], 
    queryFn: () => leaveApi.getSickNotes(),
    enabled: !!workspaceId,
  });
};

export const useSickNoteSummary = (employee?: number) => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['sickNoteSummary', workspaceId, employee], 
    queryFn: () => leaveApi.getSickNoteSummary(employee),
    enabled: !!workspaceId,
  });
};

export const useCreateSickNote = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof leaveApi.createSickNote>[0]) => leaveApi.createSickNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sickNotes', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sickNoteSummary', workspaceId] });
    },
  });
};

export const useApproveSickNote = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.approveSickNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sickNotes', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sickNoteSummary', workspaceId] });
    },
  });
};

export const useRejectSickNote = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.rejectSickNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sickNotes', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sickNoteSummary', workspaceId] });
    },
  });
};

// Double Ticket Hooks
export const useDoubleTickets = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['doubleTickets', workspaceId], 
    queryFn: () => leaveApi.getDoubleTickets(),
    enabled: !!workspaceId,
  });
};

export const useCreateDoubleTicket = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof leaveApi.createDoubleTicket>[0]) => leaveApi.createDoubleTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubleTickets', workspaceId] });
      qc.invalidateQueries({ queryKey: ['doubleTicketSummary', workspaceId] });
    },
  });
};

export const useApproveDoubleTicket = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.approveDoubleTicket(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubleTickets', workspaceId] });
      qc.invalidateQueries({ queryKey: ['doubleTicketSummary', workspaceId] });
    },
  });
};

export const useRejectDoubleTicket = () => {
    const workspaceId = localStorage.getItem('workspaceId');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.rejectDoubleTicket(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubleTickets', workspaceId] });
      qc.invalidateQueries({ queryKey: ['doubleTicketSummary', workspaceId] });
    },
  });
};

export const useDoubleTicketSummary = (employee?: number) => {
  const workspaceId = localStorage.getItem('workspaceId');
  return useQuery({ 
    queryKey: ['doubleTicketSummary', workspaceId, employee], 
    queryFn: () => leaveApi.getDoubleTicketSummary(employee),
    enabled: !!workspaceId,
  });
};
