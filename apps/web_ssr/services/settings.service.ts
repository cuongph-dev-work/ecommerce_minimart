import apiClient from '@/lib/api-client';

export interface Setting {
  key: string;
  value: string;
}

class SettingsService {
  async getAll(signal?: AbortSignal): Promise<Record<string, string>> {
    const response = await apiClient.get<{ success: boolean; data: Record<string, string> }>(
      '/settings',
      { signal }
    );
    return response.data.data;
  }

  async getByKey(key: string, signal?: AbortSignal): Promise<Setting> {
    const response = await apiClient.get<{ success: boolean; data: Setting }>(
      `/settings/${key}`,
      { signal }
    );
    return response.data.data;
  }
}

export const settingsService = new SettingsService();

