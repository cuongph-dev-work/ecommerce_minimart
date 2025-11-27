import apiClient from '@/lib/api-client';

export interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  status: string;
}

export interface CreateVoucherData {
  code: string;
  type: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  status?: string;
}

export type UpdateVoucherData = Partial<CreateVoucherData>;

class VouchersService {
  async getAll(signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: Voucher[] }>(
      '/admin/vouchers',
      { signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Voucher> {
    const response = await apiClient.get<{ success: boolean; data: Voucher }>(
      `/admin/vouchers/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async create(data: CreateVoucherData): Promise<Voucher> {
    const response = await apiClient.post<{ success: boolean; data: Voucher }>(
      '/admin/vouchers',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateVoucherData): Promise<Voucher> {
    const response = await apiClient.patch<{ success: boolean; data: Voucher }>(
      `/admin/vouchers/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/vouchers/${id}`);
  }
}

export const vouchersService = new VouchersService();

