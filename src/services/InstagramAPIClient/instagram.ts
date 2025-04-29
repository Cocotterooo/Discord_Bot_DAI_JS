export class InstagramAPIClient {
  private baseURL: string;
  private accessToken: string;

  constructor(baseURL: string, accessToken: string) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
  }

  private async request<T = any>(endpoint: string, method: 'GET' | 'POST' = 'GET', params: Record<string, any> = {}): Promise<T | null> {
    try {
      const queryParams = new URLSearchParams({ ...params, access_token: this.accessToken }).toString();
      const url = `${this.baseURL}${endpoint}?${queryParams}`;

      const response = await fetch(url, { method });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || 'Error en la API de Instagram');

      return data as T;
    } catch (error: any) {
      console.error(`❌ Error en la petición a ${endpoint}:`, error.message);
      return null;
    }
  }

  async getUserProfile(): Promise<any | null> {
    return await this.request('/me', 'GET', { fields: 'id,username,account_type' });
  }

  async getUserMedia(): Promise<any | null> {
    return await this.request('/me/media', 'GET', { fields: 'id,caption,media_type,media_url,timestamp' });
  }
}
