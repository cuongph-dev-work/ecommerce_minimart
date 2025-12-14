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

  async getDeliveryFee(signal?: AbortSignal): Promise<number> {
    try {
      const settings = await this.getAll(signal);
      const deliveryFee = Number(settings.deliveryFee) || 0;
      return deliveryFee;
    } catch (error) {
      // Return default if API fails
      return 0;
    }
  }
}

export const settingsService = new SettingsService();

