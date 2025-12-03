import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Project {
  _id: string;
  title: string;
  description: string;
  sector: string;
  stage: string;
  fundingGoal: number;
  raisedAmount?: number;
  status?: string;
  createdBy?: {
    _id: string;
    fullname: string;
    username: string;
  };
  investors?: Array<{
    investorId: string;
    amount: number;
    investedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  sector: string;
  stage: string;
  fundingGoal: number;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  sector?: string;
  stage?: string;
  status?: string;
}

export interface ProjectsResponse {
  success: boolean;
  count?: number;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}

export interface InvestInProjectData {
  amount: number;
}

export interface InvestInProjectResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    raisedAmount: number;
    fundingGoal: number;
    status: string;
  };
}

export const projectService = {
  /**
   * Obtenir tous les projets
   */
  async getProjects(): Promise<ProjectsResponse> {
    return apiClient.get<ProjectsResponse>(API_ENDPOINTS.PROJECTS.BASE);
  },

  /**
   * Obtenir un projet par son ID
   */
  async getProject(id: string): Promise<ProjectResponse> {
    return apiClient.get<ProjectResponse>(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
  },

  /**
   * Créer un nouveau projet
   */
  async createProject(data: CreateProjectData): Promise<ProjectResponse> {
    return apiClient.post<ProjectResponse>(
      `${API_ENDPOINTS.PROJECTS.BASE}/create-project`,
      data
    );
  },

  /**
   * Mettre à jour un projet
   */
  async updateProject(id: string, data: UpdateProjectData): Promise<ProjectResponse> {
    return apiClient.put<ProjectResponse>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}/edit`,
      data
    );
  },

  /**
   * Supprimer un projet
   */
  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}/delete`
    );
  },

  /**
   * Investir dans un projet
   */
  async investInProject(id: string, data: InvestInProjectData): Promise<InvestInProjectResponse> {
    return apiClient.post<InvestInProjectResponse>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}/invest`,
      data
    );
  },
};

