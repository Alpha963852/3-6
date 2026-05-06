import client from './client';
import type { ROITrendResponse, ROICompareResponse } from '../types';

export interface TrendQueryParams {
  group_by?: 'day' | 'week';
  start_date?: string;
  end_date?: string;
}

export function getROITrend(videoId: number, params?: TrendQueryParams) {
  return client.get<ROITrendResponse>(`/materials/${videoId}/roi-trend`, { params });
}

export function getROICompare(videoIds: number[], params?: TrendQueryParams) {
  return client.get<ROICompareResponse>('/materials/roi-compare', {
    params: {
      video_ids: videoIds.join(','),
      ...params,
    },
  });
}
