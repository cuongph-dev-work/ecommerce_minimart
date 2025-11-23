import apiClient from '@/lib/api-client';

export interface Setting {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

export interface UpdateSettingData {
  value: string;
}

class SettingsService {
  async getAll(signal?: AbortSignal): Promise<Setting[] | Record<string, any>> {
    const response = await apiClient.get<{ success: boolean; data: Setting[] | Record<string, any> }>(
      '/admin/settings',
      { signal }
    );
    return response.data.data;
  }

  async getByKey(key: string, signal?: AbortSignal): Promise<Setting> {
    const response = await apiClient.get<{ success: boolean; data: Setting }>(
      `/admin/settings/${key}`,
      { signal }
    );
    return response.data.data;
  }

  async update(key: string, data: UpdateSettingData): Promise<Setting> {
    const response = await apiClient.patch<{ success: boolean; data: Setting }>(
      `/admin/settings/${key}`,
      data
    );
    return response.data.data;
  }
}

export const settingsService = new SettingsService();

