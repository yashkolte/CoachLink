import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface CoachRequest {
  email: string;
  name: string;
}

export interface CoachResponse {
  id: string | null;
  email: string;
  name: string | null;
  accountId: string | null;
  status: string;
  isRegistered: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class StripeApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/stripe`;
  }

  async createAccount(data: CoachRequest): Promise<CoachResponse> {
    const response = await axios.post(`${this.baseURL}/create-account`, data);
    return response.data.data; // Extract data from ApiResponse
  }

  async generateOnboardingLink(data: { accountId: string }): Promise<{ onboardingUrl: string }> {
    const response = await axios.post(`${this.baseURL}/generate-onboarding-link`, data);
    return response.data.data; // Extract data from ApiResponse
  }

  async checkAccountStatus(accountId: string): Promise<{
    accountId: string;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
    onboardingComplete: boolean;
  }> {
    const response = await axios.get(`${this.baseURL}/check-status`, {
      params: { accountId }
    });
    return response.data.data; // Extract data from ApiResponse
  }

  async getDashboardLink(accountId: string): Promise<{ dashboardUrl: string }> {
    const response = await axios.get(`${this.baseURL}/dashboard-link`, {
      params: { accountId }
    });
    return response.data.data; // Extract data from ApiResponse
  }

  async checkEmailRegistration(email: string): Promise<CoachResponse> {
    const response = await axios.get(`${this.baseURL}/check-email`, {
      params: { email }
    });
    return response.data.data; // Extract data from ApiResponse
  }
}

export const stripeApi = new StripeApiClient();
