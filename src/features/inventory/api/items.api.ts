import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  InventoryItem,
  InventoryItemFormData,
  InventoryItemUpdateData,
  InventoryItemListResult,
  InventoryItemQueryParams,
  InventoryItemVendor,
  InventoryItemVendorFormData,
} from '../types/item.types';

export async function getItems(params?: InventoryItemQueryParams): Promise<InventoryItemListResult> {
  const response = await axiosInstance.get('/inventory/items', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getItem(id: string | number): Promise<InventoryItem> {
  const response = await axiosInstance.get(`/inventory/items/${id}`);
  return response.data.data || response.data;
}

export async function createItem(data: InventoryItemFormData): Promise<InventoryItem> {
  const response = await axiosInstance.post('/inventory/items', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateItem(id: string | number, data: InventoryItemUpdateData): Promise<InventoryItem> {
  const response = await axiosInstance.patch(`/inventory/items/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getItemVendors(id: string | number): Promise<InventoryItemVendor[]> {
  const response = await axiosInstance.get(`/inventory/items/${id}/vendors`);
  return response.data.data || response.data || [];
}

export interface InventoryUom {
  uom_id: number;
  name: string;
  symbol: string;
}

export async function getUoms(): Promise<InventoryUom[]> {
  const response = await axiosInstance.get('/inventory/items/uoms');
  return response.data.data || response.data || [];
}

/** Uploads an item photo and returns the stored path to save as `image_url`. */
export async function uploadItemImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await axiosInstance.post('/inventory/items/upload-image', body);
  const data = response.data.data || response.data;
  return data.path;
}

/**
 * Item images are served through an authenticated endpoint, not a public
 * static URL (same convention as Alumni's profile photos) — fetch as a blob
 * and hand back an object URL the caller must revoke when done with it.
 */
export async function getItemImageObjectUrl(storedPath: string): Promise<string> {
  const response = await axiosInstance.get('/inventory/items/image', {
    params: { path: storedPath },
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data as Blob);
}

export async function upsertItemVendor(
  id: string | number,
  data: InventoryItemVendorFormData
): Promise<InventoryItemVendor> {
  const response = await axiosInstance.post(`/inventory/items/${id}/vendors`, data);
  return response.data.data || response.data;
}
