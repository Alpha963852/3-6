import client from './client';
import type { VideoMaterial } from '../types';

export interface ROIFilterParams {
  roi_min?: number;
  roi_max?: number;
  sort_by?: 'roi' | 'bean_output' | 'ctr' | 'interaction_rate' | 'conversion_rate' | 'created_at';
  sort_order?: 'asc' | 'desc';
  material_type?: 'video' | 'image';
  duration_min?: number;
  duration_max?: number;
  date_range_type?: 'all' | '7d' | '30d' | 'custom';
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'pending_elimination';
  skip?: number;
  limit?: number;
}

export interface MaterialROIItem extends VideoMaterial {
  roi: number | null;
  beanOutput: number | null;
  ctr: number | null;
  interactionRate: number | null;
  conversionRate: number | null;
  totalBeanCost: number;
  totalGmv: number;
  roiLabel: 'high' | 'low' | null;
}

export interface ROIFilterResult {
  total: number;
  items: MaterialROIItem[];
}

export interface ROIThresholds {
  highThreshold: number;
  lowThreshold: number;
}

export interface ROIVideoParams {
  date_range_type?: string;
  start_date?: string;
  end_date?: string;
}

export function getMaterialsWithROI(params?: ROIFilterParams) {
  return client.get<ROIFilterResult>('/materials/roi-filter', { params });
}

export function getVideoROI(videoId: number, params?: ROIVideoParams) {
  return client.get(`/materials/${videoId}/roi`, { params });
}

export function getBatchROI(videoIds: number[], params?: ROIVideoParams) {
  return client.get('/materials/roi-batch', {
    params: { video_ids: videoIds.join(','), ...params },
  });
}

export function recalculateROI(videoId: number) {
  return client.post(`/materials/${videoId}/recalculate-roi`);
}

export function getROIThresholds() {
  return client.get<ROIThresholds>('/settings/roi-thresholds');
}

export function updateROIThresholds(data: Partial<ROIThresholds>) {
  return client.put<ROIThresholds>('/settings/roi-thresholds', data);
}

export function markElimination(videoId: number) {
  return client.put(`/materials/${videoId}`, { status: 'pending_elimination' });
}

export function eliminateMaterial(id: number) {
  return client.put(`/materials/${id}/eliminate`);
}

export function restoreMaterial(id: number) {
  return client.put(`/materials/${id}/restore`);
}

export function exportMaterials(params?: ROIFilterParams) {
  return client.get('/materials/export', { params, responseType: 'blob' });
}
