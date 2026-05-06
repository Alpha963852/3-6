import client from './client';
import type { AdData } from '../types';

export interface CreateAdDataPayload {
  videoId: number;
  date: string;
  beanCost: number;
  impressions: number;
  clicks: number;
  interactions: number;
  conversions: number;
  gmv: number;
}

export interface AdDataQueryParams {
  video_id?: number;
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}

export interface ImportResult {
  successCount: number;
  failCount: number;
  failures: { row: number; reason: string }[];
}

export function createAdData(data: CreateAdDataPayload) {
  return client.post<AdData>('/ad-data', data);
}

export function importAdData(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return client.post<ImportResult>('/ad-data/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getAdData(params?: AdDataQueryParams) {
  return client.get<AdData[]>('/ad-data', { params });
}

export function getVideoAdData(videoId: number, params?: Omit<AdDataQueryParams, 'video_id'>) {
  return client.get<AdData[]>(`/ad-data/video/${videoId}`, { params });
}
