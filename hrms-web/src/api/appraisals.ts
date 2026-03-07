import http from '../lib/http';

export type Appraisal = {
  id: number;
  appraisee: number;
  appraisee_name?: string;
  supervisor?: number | null;
  supervisor_name?: string | null;
  department?: number | null;
  department_name?: string | null;
  position_held: string;
  review_start: string; // YYYY-MM-DD
  review_end: string;   // YYYY-MM-DD
  feedback_notes?: string;
  employee_comments?: string;
  supervisor_comments?: string;
  employee_signed_at?: string | null;
  supervisor_signed_at?: string | null;
  overall_percentage?: number | null;
  overall_rating?: 1|2|3|4|5 | null;
};

export type AppraisalObjective = {
  id: number;
  appraisal: number;
  title: string;
  self_rating?: 1|2|3|4|5 | null;
  supervisor_rating?: 1|2|3|4|5 | null;
  agreed_rating?: 1|2|3|4|5 | null;
  comments?: string;
  order?: number;
};

export type AppraisalFactor = {
  id: number;
  appraisal: number;
  group: 'PERFORMANCE' | 'BEHAVIORAL' | 'SUPERVISORY';
  name: string;
  rating?: 1|2|3|4|5 | null;
  notes?: string;
  order?: number;
};

export const ratingOptions = [
  { value: 5, label: 'OP (5)' },
  { value: 4, label: 'AE (4)' },
  { value: 3, label: 'AP (3)' },
  { value: 2, label: 'SP (2)' },
  { value: 1, label: 'PP (1)' },
];

export type AppraisalImprovementItem = {
  id: number;
  appraisal: number;
  issue: string;
  limiting_factors?: string;
  actions?: string;
  completion_indicator?: string;
  due_date?: string | null; // YYYY-MM-DD
};

export type AppraisalNextObjective = {
  id: number;
  appraisal: number;
  key_area?: string;
  objective: string;
  indicators?: string;
};

export type AppraisalDevelopmentItem = {
  id: number;
  appraisal: number;
  training_need: string;
  action?: string;
  responsible?: string;
  due_date?: string | null; // YYYY-MM-DD
  application_note?: string;
  review_date?: string | null; // YYYY-MM-DD
};

export async function listAppraisals(params?: any): Promise<{results?: Appraisal[]} & any> {
  const res = await http.get('/api/v1/activities/appraisals/', { params });
  return res.data;
}

export async function createAppraisal(payload: Partial<Appraisal>): Promise<Appraisal> {
  const res = await http.post('/api/v1/activities/appraisals/', payload);
  return res.data;
}

export async function updateAppraisal(id: number, payload: Partial<Appraisal>): Promise<Appraisal> {
  const res = await http.patch(`/api/v1/activities/appraisals/${id}/`, payload);
  return res.data;
}

export async function deleteAppraisal(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisals/${id}/`);
}

export async function listObjectives(appraisalId: number): Promise<AppraisalObjective[]> {
  const res = await http.get('/api/v1/activities/appraisal-objectives/', { params: { appraisal: appraisalId } });
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function addObjective(payload: Omit<AppraisalObjective, 'id'>): Promise<AppraisalObjective> {
  const res = await http.post('/api/v1/activities/appraisal-objectives/', payload);
  return res.data;
}

export async function updateObjective(id: number, payload: Partial<AppraisalObjective>): Promise<AppraisalObjective> {
  const res = await http.patch(`/api/v1/activities/appraisal-objectives/${id}/`, payload);
  return res.data;
}

export async function deleteObjective(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisal-objectives/${id}/`);
}

export async function listFactors(appraisalId: number, group?: string): Promise<AppraisalFactor[]> {
  const res = await http.get('/api/v1/activities/appraisal-factors/', { params: { appraisal: appraisalId, group } });
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function addFactor(payload: Omit<AppraisalFactor, 'id'>): Promise<AppraisalFactor> {
  const res = await http.post('/api/v1/activities/appraisal-factors/', payload);
  return res.data;
}

export async function updateFactor(id: number, payload: Partial<AppraisalFactor>): Promise<AppraisalFactor> {
  const res = await http.patch(`/api/v1/activities/appraisal-factors/${id}/`, payload);
  return res.data;
}

export async function deleteFactor(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisal-factors/${id}/`);
}

export async function listImprovements(appraisalId: number): Promise<AppraisalImprovementItem[]> {
  const res = await http.get('/api/v1/activities/appraisal-improvements/', { params: { appraisal: appraisalId } });
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function addImprovement(payload: Omit<AppraisalImprovementItem, 'id'>): Promise<AppraisalImprovementItem> {
  const res = await http.post('/api/v1/activities/appraisal-improvements/', payload);
  return res.data;
}

export async function updateImprovement(id: number, payload: Partial<AppraisalImprovementItem>): Promise<AppraisalImprovementItem> {
  const res = await http.patch(`/api/v1/activities/appraisal-improvements/${id}/`, payload);
  return res.data;
}

export async function deleteImprovement(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisal-improvements/${id}/`);
}

export async function listNextObjectives(appraisalId: number): Promise<AppraisalNextObjective[]> {
  const res = await http.get('/api/v1/activities/appraisal-next-objectives/', { params: { appraisal: appraisalId } });
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function addNextObjective(payload: Omit<AppraisalNextObjective, 'id'>): Promise<AppraisalNextObjective> {
  const res = await http.post('/api/v1/activities/appraisal-next-objectives/', payload);
  return res.data;
}

export async function updateNextObjectiveItem(id: number, payload: Partial<AppraisalNextObjective>): Promise<AppraisalNextObjective> {
  const res = await http.patch(`/api/v1/activities/appraisal-next-objectives/${id}/`, payload);
  return res.data;
}

export async function deleteNextObjectiveItem(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisal-next-objectives/${id}/`);
}

export async function listDevelopmentItems(appraisalId: number): Promise<AppraisalDevelopmentItem[]> {
  const res = await http.get('/api/v1/activities/appraisal-development-items/', { params: { appraisal: appraisalId } });
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function addDevelopmentItem(payload: Omit<AppraisalDevelopmentItem, 'id'>): Promise<AppraisalDevelopmentItem> {
  const res = await http.post('/api/v1/activities/appraisal-development-items/', payload);
  return res.data;
}

export async function updateDevelopmentItem(id: number, payload: Partial<AppraisalDevelopmentItem>): Promise<AppraisalDevelopmentItem> {
  const res = await http.patch(`/api/v1/activities/appraisal-development-items/${id}/`, payload);
  return res.data;
}

export async function deleteDevelopmentItem(id: number): Promise<void> {
  await http.delete(`/api/v1/activities/appraisal-development-items/${id}/`);
}
