import client from './client';
import type { VideoMaterial } from '../types';

export interface MaterialQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface CreateMaterialPayload {
  title: string;
  videoUrl: string;
  coverUrl: string;
  duration: number;
  aspectRatio: string;
  materialType: 'video' | 'image';
}

export interface UpdateMaterialPayload {
  title?: string;
  status?: 'active' | 'pending_elimination';
}

export function getMaterials(params?: MaterialQueryParams) {
  return client.get<VideoMaterial[]>('/materials', { params });
}

export function createMaterial(data: CreateMaterialPayload) {
  return client.post<VideoMaterial>('/materials', data);
}

export function updateMaterial(id: number, data: UpdateMaterialPayload) {
  return client.put<VideoMaterial>(`/materials/${id}`, data);
}
