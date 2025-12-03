import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  sector: string;
  deadline: string;
  fundingAmount: number;
  status?: string;
  applicants?: Array<{
    applicantId: string;
    appliedAt: string;
  }>;
  selectedApplicants?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChallengeData {
  title: string;
  description: string;
  sector: string;
  deadline: string;
  fundingAmount: number;
}

export interface UpdateChallengeData {
  title?: string;
  description?: string;
  sector?: string;
  deadline?: string;
  fundingAmount?: number;
}

export interface ChallengesResponse {
  success: boolean;
  count?: number;
  challenges: Challenge[];
}

export interface ChallengeResponse {
  success: boolean;
  message?: string;
  data: Challenge;
}

export interface ApplyToChallengeResponse {
  success: boolean;
  message: string;
  data: {
    challengeId: string;
    applicantsCount: number;
  };
}

export interface SelectApplicantResponse {
  success: boolean;
  message: string;
  data: {
    challengeId: string;
    selectedCount: number;
    applicant: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const challengeService = {
  /**
   * Obtenir tous les défis
   */
  async getChallenges(): Promise<ChallengesResponse> {
    return apiClient.get<ChallengesResponse>(API_ENDPOINTS.CHALLENGES.BASE);
  },

  /**
   * Obtenir un défi par son ID
   */
  async getChallenge(id: string): Promise<ChallengeResponse> {
    return apiClient.get<ChallengeResponse>(`${API_ENDPOINTS.CHALLENGES.BASE}/${id}`);
  },

  /**
   * Créer un nouveau défi
   */
  async createChallenge(data: CreateChallengeData): Promise<ChallengeResponse> {
    return apiClient.post<ChallengeResponse>(
      `${API_ENDPOINTS.CHALLENGES.BASE}/create-challenge`,
      data
    );
  },

  /**
   * Mettre à jour un défi
   */
  async updateChallenge(id: string, data: UpdateChallengeData): Promise<ChallengeResponse> {
    return apiClient.put<ChallengeResponse>(
      `${API_ENDPOINTS.CHALLENGES.BASE}/${id}/edit`,
      data
    );
  },

  /**
   * Supprimer un défi
   */
  async deleteChallenge(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.CHALLENGES.BASE}/${id}/delete`
    );
  },

  /**
   * Postuler à un défi
   */
  async applyToChallenge(id: string): Promise<ApplyToChallengeResponse> {
    return apiClient.post<ApplyToChallengeResponse>(
      `${API_ENDPOINTS.CHALLENGES.BASE}/${id}/apply`
    );
  },

  /**
   * Sélectionner un candidat pour un défi
   */
  async selectApplicant(
    challengeId: string,
    applicantId: string
  ): Promise<SelectApplicantResponse> {
    return apiClient.post<SelectApplicantResponse>(
      `${API_ENDPOINTS.CHALLENGES.BASE}/${challengeId}/select/${applicantId}`
    );
  },
};

