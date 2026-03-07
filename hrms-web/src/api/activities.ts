import http from '../lib/http';

// Reports
export async function listReports(params?: any) {
  const res = await http.get('/api/v1/activities/reports/', { params });
  return res.data?.results || res.data || [];
}

export async function createReport(payload: any) {
  const res = await http.post('/api/v1/activities/reports/', payload);
  return res.data;
}

export async function updateReport(id: number, payload: any) {
  const res = await http.patch(`/api/v1/activities/reports/${id}/`, payload);
  return res.data;
}

export async function deleteReport(id: number) {
  await http.delete(`/api/v1/activities/reports/${id}/`);
}

// Investigations
export async function listInvestigations(params?: any) {
  const res = await http.get('/api/v1/activities/investigations/', { params });
  return res.data?.results || res.data || [];
}

export async function createInvestigation(payload: any) {
  const res = await http.post('/api/v1/activities/investigations/', payload);
  return res.data;
}

export async function updateInvestigation(id: number, payload: any) {
  const res = await http.patch(`/api/v1/activities/investigations/${id}/`, payload);
  return res.data;
}

export async function deleteInvestigation(id: number) {
  await http.delete(`/api/v1/activities/investigations/${id}/`);
}

// Hearings
export async function listHearings(params?: any) {
  const res = await http.get('/api/v1/activities/hearings/', { params });
  return res.data?.results || res.data || [];
}

export async function createHearing(payload: any) {
  const res = await http.post('/api/v1/activities/hearings/', payload);
  return res.data;
}

export async function updateHearing(id: number, payload: any) {
  const res = await http.patch(`/api/v1/activities/hearings/${id}/`, payload);
  return res.data;
}

export async function deleteHearing(id: number) {
  await http.delete(`/api/v1/activities/hearings/${id}/`);
}

// Case Studies
export async function listCaseStudies(params?: any) {
  const res = await http.get('/api/v1/activities/case-studies/', { params });
  return res.data?.results || res.data || [];
}

export async function createCaseStudy(payload: any) {
  const res = await http.post('/api/v1/activities/case-studies/', payload);
  return res.data;
}

export async function updateCaseStudy(id: number, payload: any) {
  const res = await http.patch(`/api/v1/activities/case-studies/${id}/`, payload);
  return res.data;
}

export async function deleteCaseStudy(id: number) {
  await http.delete(`/api/v1/activities/case-studies/${id}/`);
}
