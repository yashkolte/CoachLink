import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface CreateAccountRequest {
  email: string;
  name: string;
}

export interface CreateAccountResponse {
  accountId: string;
  coachId: string;
  message: string;
}

export interface OnboardingLinkRequest {
  accountId: string;
}

export interface OnboardingLinkResponse {
  onboardingUrl: string;
}

export interface AccountStatusResponse {
  accountId: string;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

export interface DashboardLinkResponse {
  dashboardUrl: string;
}

export interface EmailCheckResponse {
  isRegistered: boolean;
  accountId: string | null;
  status: string;
  name?: string;
}

class StripeApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/stripe`;
  }

  async createAccount(data: CreateAccountRequest): Promise<CreateAccountResponse> {
    const response = await axios.post(`${this.baseURL}/create-account`, data);
    return response.data;
  }

  async generateOnboardingLink(data: OnboardingLinkRequest): Promise<OnboardingLinkResponse> {
    const response = await axios.post(`${this.baseURL}/generate-onboarding-link`, data);
    return response.data;
  }

  async checkAccountStatus(accountId: string): Promise<AccountStatusResponse> {
    const response = await axios.get(`${this.baseURL}/check-status`, {
      params: { accountId }
    });
    return response.data;
  }

  async getDashboardLink(accountId: string): Promise<DashboardLinkResponse> {
    const response = await axios.get(`${this.baseURL}/dashboard-link`, {
      params: { accountId }
    });
    return response.data;
  }

  async checkEmailRegistration(email: string): Promise<EmailCheckResponse> {
    const response = await axios.get(`${this.baseURL}/check-email`, {
      params: { email }
    });
    return response.data;
  }
}

export const stripeApi = new StripeApiClient();
