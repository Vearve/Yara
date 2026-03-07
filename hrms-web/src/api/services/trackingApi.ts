import http from '../../lib/http';

export interface Training {
  id: number;
  employee: number;
  employee_name?: string;
  training_type: number;
  training_type_name?: string;
  start_date: string;
  end_date?: string;
  completion_date?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  certificate_number?: string;
  certificate_document?: string;
  notes?: string;
}

export interface TrainingType {
  id: number;
  name: string;
  description?: string;
  duration_days?: number;
  is_mandatory: boolean;
  validity_days?: number;
}

export interface Medical {
  id: number;
  employee: number;
  employee_name?: string;
  medical_type: number;
  medical_type_name?: string;
  examination_date: string;
  expiry_date?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  result?: string;
  recommendations?: string;
  certificate_document?: string;
  notes?: string;
}

export interface MedicalType {
  id: number;
  name: string;
  description?: string;
  validity_days?: number;
  is_mandatory: boolean;
}

export interface Permit {
  id: number;
  employee: number;
  employee_name?: string;
  permit_type: string;
  permit_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  issuing_authority?: string;
  document?: string;
  notes?: string;
}

export interface Probation {
  id: number;
  employee: number;
  employee_name?: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'EXTENDED' | 'PASSED' | 'FAILED';
  review_date?: string;
  reviewer?: number;
  reviewer_name?: string;
  comments?: string;
  outcome?: string;
}

export interface ComplianceAlert {
  id: number;
  employee: number;
  employee_name?: string;
  alert_type: 'TRAINING_EXPIRY' | 'MEDICAL_EXPIRY' | 'PERMIT_EXPIRY' | 'PROBATION_REVIEW' | 'CONTRACT_EXPIRY';
  title: string;
  description: string;
  due_date: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  resolved_at?: string;
  resolved_by?: number;
}

export const trackingApi = {
  // Trainings
  async listTrainings(params?: any): Promise<Training[]> {
    const res = await http.get('/api/v1/tracking/trainings/', { params });
    return res.data?.results || res.data || [];
  },

  async getTraining(id: number): Promise<Training> {
    const res = await http.get(`/api/v1/tracking/trainings/${id}/`);
    return res.data;
  },

  async createTraining(data: any): Promise<Training> {
    const res = await http.post('/api/v1/tracking/trainings/', data);
    return res.data;
  },

  async updateTraining(id: number, data: any): Promise<Training> {
    const res = await http.patch(`/api/v1/tracking/trainings/${id}/`, data);
    return res.data;
  },

  async deleteTraining(id: number): Promise<void> {
    await http.delete(`/api/v1/tracking/trainings/${id}/`);
  },

  // Training Types
  async listTrainingTypes(params?: any): Promise<TrainingType[]> {
    const res = await http.get('/api/v1/tracking/training-types/', { params });
    return res.data?.results || res.data || [];
  },

  // Medicals
  async listMedicals(params?: any): Promise<Medical[]> {
    const res = await http.get('/api/v1/tracking/medicals/', { params });
    return res.data?.results || res.data || [];
  },

  async getMedical(id: number): Promise<Medical> {
    const res = await http.get(`/api/v1/tracking/medicals/${id}/`);
    return res.data;
  },

  async createMedical(data: any): Promise<Medical> {
    const res = await http.post('/api/v1/tracking/medicals/', data);
    return res.data;
  },

  async updateMedical(id: number, data: any): Promise<Medical> {
    const res = await http.patch(`/api/v1/tracking/medicals/${id}/`, data);
    return res.data;
  },

  async deleteMedical(id: number): Promise<void> {
    await http.delete(`/api/v1/tracking/medicals/${id}/`);
  },

  // Medical Types
  async listMedicalTypes(params?: any): Promise<MedicalType[]> {
    const res = await http.get('/api/v1/tracking/medical-types/', { params });
    return res.data?.results || res.data || [];
  },

  // Permits
  async listPermits(params?: any): Promise<Permit[]> {
    const res = await http.get('/api/v1/tracking/permits/', { params });
    return res.data?.results || res.data || [];
  },

  async getPermit(id: number): Promise<Permit> {
    const res = await http.get(`/api/v1/tracking/permits/${id}/`);
    return res.data;
  },

  async createPermit(data: Partial<Permit>): Promise<Permit> {
    const res = await http.post('/api/v1/tracking/permits/', data);
    return res.data;
  },

  async updatePermit(id: number, data: Partial<Permit>): Promise<Permit> {
    const res = await http.patch(`/api/v1/tracking/permits/${id}/`, data);
    return res.data;
  },

  async deletePermit(id: number): Promise<void> {
    await http.delete(`/api/v1/tracking/permits/${id}/`);
  },

  // Probations
  async listProbations(params?: any): Promise<Probation[]> {
    const res = await http.get('/api/v1/tracking/probations/', { params });
    return res.data?.results || res.data || [];
  },

  async getProbation(id: number): Promise<Probation> {
    const res = await http.get(`/api/v1/tracking/probations/${id}/`);
    return res.data;
  },

  async createProbation(data: Partial<Probation>): Promise<Probation> {
    const res = await http.post('/api/v1/tracking/probations/', data);
    return res.data;
  },

  async updateProbation(id: number, data: Partial<Probation>): Promise<Probation> {
    const res = await http.patch(`/api/v1/tracking/probations/${id}/`, data);
    return res.data;
  },

  async deleteProbation(id: number): Promise<void> {
    await http.delete(`/api/v1/tracking/probations/${id}/`);
  },

  // Compliance Alerts
  async listComplianceAlerts(params?: any): Promise<ComplianceAlert[]> {
    const res = await http.get('/api/v1/tracking/compliance-alerts/', { params });
    return res.data?.results || res.data || [];
  },

  async getComplianceAlert(id: number): Promise<ComplianceAlert> {
    const res = await http.get(`/api/v1/tracking/compliance-alerts/${id}/`);
    return res.data;
  },

  async updateComplianceAlert(id: number, data: Partial<ComplianceAlert>): Promise<ComplianceAlert> {
    const res = await http.patch(`/api/v1/tracking/compliance-alerts/${id}/`, data);
    return res.data;
  },

  async deleteComplianceAlert(id: number): Promise<void> {
    await http.delete(`/api/v1/tracking/compliance-alerts/${id}/`);
  },
};
