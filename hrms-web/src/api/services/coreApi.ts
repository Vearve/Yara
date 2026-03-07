import http from '../../lib/http';

export interface Site {
  id: number;
  name: string;
  location: string;
  description?: string;
  is_active: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  start_date: string;
  end_date?: string;
  progress?: number;
  team_members?: string[];
}

export interface Client {
  id: number;
  name: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export interface Assignment {
  id: number;
  employee: number;
  employee_name?: string;
  project: number;
  project_name?: string;
  site: number;
  site_name?: string;
  start_date: string;
  end_date?: string;
  role?: string;
  is_active: boolean;
}

export interface WorkspaceMembership {
  id: number;
  user: number;
  workspace: number;
  role: string;
  is_default?: boolean;
  is_active?: boolean;
  user_details?: any;
  workspace_details?: any;
}

export interface CreateUserPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  password?: string;
  role?: string;
}

export const coreApi = {
  _getWorkspaceParams() {
    const workspaceId = localStorage.getItem('workspaceId');
    return workspaceId ? { workspace: workspaceId } : undefined;
  },
  // Sites
  async listSites(params?: any): Promise<Site[]> {
    const res = await http.get('/api/v1/core/sites/', { params });
    return res.data?.results || res.data || [];
  },

  async getSite(id: number): Promise<Site> {
    const res = await http.get(`/api/v1/core/sites/${id}/`);
    return res.data;
  },

  async createSite(data: Partial<Site>): Promise<Site> {
    const res = await http.post('/api/v1/core/sites/', data);
    return res.data;
  },

  async updateSite(id: number, data: Partial<Site>): Promise<Site> {
    const res = await http.patch(`/api/v1/core/sites/${id}/`, data);
    return res.data;
  },

  async deleteSite(id: number): Promise<void> {
    await http.delete(`/api/v1/core/sites/${id}/`);
  },

  // Projects
  async listProjects(params?: any): Promise<Project[]> {
    const res = await http.get('/api/v1/core/projects/', { params });
    return res.data?.results || res.data || [];
  },

  async getProject(id: number): Promise<Project> {
    const res = await http.get(`/api/v1/core/projects/${id}/`);
    return res.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await http.post('/api/v1/core/projects/', data);
    return res.data;
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const res = await http.patch(`/api/v1/core/projects/${id}/`, data);
    return res.data;
  },

  async deleteProject(id: number): Promise<void> {
    await http.delete(`/api/v1/core/projects/${id}/`);
  },

  async getProjectStats(): Promise<any> {
    const res = await http.get('/api/v1/core/projects/stats/');
    return res.data;
  },

  // Clients
  async listClients(params?: any): Promise<Client[]> {
    const res = await http.get('/api/v1/core/clients/', { params });
    return res.data?.results || res.data || [];
  },

  async getClient(id: number): Promise<Client> {
    const res = await http.get(`/api/v1/core/clients/${id}/`);
    return res.data;
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    const res = await http.post('/api/v1/core/clients/', data);
    return res.data;
  },

  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    const res = await http.patch(`/api/v1/core/clients/${id}/`, data);
    return res.data;
  },

  async deleteClient(id: number): Promise<void> {
    await http.delete(`/api/v1/core/clients/${id}/`);
  },

  // Assignments
  async listAssignments(params?: any): Promise<Assignment[]> {
    const res = await http.get('/api/v1/core/assignments/', { params });
    return res.data?.results || res.data || [];
  },

  async getAssignment(id: number): Promise<Assignment> {
    const res = await http.get(`/api/v1/core/assignments/${id}/`);
    return res.data;
  },

  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    const res = await http.post('/api/v1/core/assignments/', data);
    return res.data;
  },

  async updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment> {
    const res = await http.patch(`/api/v1/core/assignments/${id}/`, data);
    return res.data;
  },

  async deleteAssignment(id: number): Promise<void> {
    await http.delete(`/api/v1/core/assignments/${id}/`);
  },

  // Workspaces
  async listMyWorkspaces(): Promise<MyWorkspace[]> {
    const res = await http.get('/api/v1/core/workspaces/my_workspaces/');
    return res.data || [];
  },

  // Workspace memberships
  async listMemberships(params?: any): Promise<WorkspaceMembership[]> {
    const res = await http.get('/api/v1/core/workspace-memberships/', { params });
    return res.data?.results || res.data || [];
  },

  async createMembership(data: Partial<WorkspaceMembership>): Promise<WorkspaceMembership> {
    const res = await http.post('/api/v1/core/workspace-memberships/', data);
    return res.data;
  },

  async updateMembership(id: number, data: Partial<WorkspaceMembership>): Promise<WorkspaceMembership> {
    const res = await http.patch(`/api/v1/core/workspace-memberships/${id}/`, data);
    return res.data;
  },

  async deleteMembership(id: number): Promise<void> {
    await http.delete(`/api/v1/core/workspace-memberships/${id}/`);
  },

  async switchWorkspace(workspace_id: number): Promise<{ workspace: Workspace; role: string; message: string }> {
    const res = await http.post('/api/v1/core/workspaces/switch/', { workspace_id });
    return res.data;
  },

  async getPortfolioStats(): Promise<PortfolioStats> {
    const res = await http.get('/api/v1/core/workspaces/portfolio-stats/');
    return res.data;
  },

  // User creation (creates user + membership together)
  async createUserWithMembership(data: CreateUserPayload): Promise<WorkspaceMembership> {
    const res = await http.post('/api/v1/core/users/', data);
    return res.data;
  },
};

// Types for Workspace APIs
export interface Workspace {
  id: number;
  name: string;
  code?: string;
  workspace_type?: string;
  is_active: boolean;
}

export interface MyWorkspace {
  workspace: Workspace;
  role: string;
  is_default: boolean;
}

export interface PortfolioStats {
  clients_count: number;
  projects_count?: number;
  projects_by_status: Record<string, number>;
  employees_count: number;
  contractors_count: number;
  assignments_count: number;
  compliance_by_status: Record<string, number>;
  assignments_by_client: Array<{ client__id: number; client__name: string; count: number }>;
}
