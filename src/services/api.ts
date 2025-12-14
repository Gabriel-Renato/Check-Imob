/**
 * Cliente de API para comunicação com o backend PHP
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Recuperar token do localStorage se existir
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token') || null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ success: boolean; user: any; token: string }>(
      '/api/auth/login.php',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyToken(token: string) {
    const response = await this.request<{ success: boolean; user: any }>(
      '/api/auth/verify.php',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    );
    return response;
  }

  // Users
  async getUsers(role?: string) {
    const query = role ? `?role=${role}` : '';
    return this.request(`/api/users/index.php${query}`);
  }

  // Properties
  async getProperties() {
    return this.request('/api/properties/index.php');
  }

  async getProperty(id: string) {
    return this.request(`/api/properties/get.php?id=${id}`);
  }

  async createProperty(property: any) {
    return this.request('/api/properties/index.php', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  }

  // Inspections
  async getInspections(corretorId?: string) {
    const query = corretorId ? `?corretor_id=${corretorId}` : '';
    return this.request(`/api/inspections/index.php${query}`);
  }

  async getInspection(id: string) {
    return this.request(`/api/inspections/get.php?id=${id}`);
  }

  async createInspection(inspection: any) {
    return this.request('/api/inspections/index.php', {
      method: 'POST',
      body: JSON.stringify(inspection),
    });
  }

  async updateInspection(id: string, data: any) {
    return this.request('/api/inspections/update.php', {
      method: 'POST',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async uploadPhoto(inspectionId: string, cardId: string, file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('inspection_id', inspectionId);
    formData.append('card_id', cardId);

    const url = `${this.baseUrl}/api/inspections/upload-photo.php`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Inspection Cards
  async getInspectionCards() {
    return this.request('/api/inspection-cards/index.php');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/dashboard/stats.php');
  }

  // Settings
  async getSystemSettings() {
    return this.request('/api/settings/system.php');
  }

  async updateSystemSetting(key: string, value: string) {
    return this.request('/api/settings/system.php', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async testDatabase() {
    return this.request('/api/settings/database-test.php');
  }

  async createBackup() {
    return this.request('/api/settings/backup.php', {
      method: 'POST',
    });
  }

  async getPasswordPolicy() {
    return this.request('/api/settings/password-policy.php');
  }

  async updatePasswordPolicy(minLength: number) {
    return this.request('/api/settings/password-policy.php', {
      method: 'POST',
      body: JSON.stringify({ min_length: minLength }),
    });
  }

  async getSessionSettings() {
    return this.request('/api/settings/session.php');
  }

  async updateSessionSettings(durationHours: number) {
    return this.request('/api/settings/session.php', {
      method: 'POST',
      body: JSON.stringify({ duration_hours: durationHours }),
    });
  }

  async getAccessLogs(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/settings/logs.php${query}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

