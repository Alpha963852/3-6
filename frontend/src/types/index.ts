export interface VideoMaterial {
  id: number;
  title: string;
  videoUrl: string;
  coverUrl: string;
  duration: number;
  aspectRatio: string;
  materialType: 'video' | 'image';
  status: 'active' | 'pending_elimination';
  createdAt: string;
  updatedAt: string;
}

export interface AdData {
  id: number;
  videoId: number;
  date: string;
  beanCost: number;
  impressions: number;
  clicks: number;
  interactions: number;
  conversions: number;
  gmv: number;
  createdAt: string;
  updatedAt: string;
}

export interface ROIData {
  videoId: number;
  dateRangeType: string;
  startDate: string;
  endDate: string;
  roi: number;
  beanOutput: number;
  ctr: number;
  interactionRate: number;
  conversionRate: number;
  totalBeanCost: number;
  totalGmv: number;
}

export interface VideoWithROI extends VideoMaterial {
  roi?: ROIData;
  roiLabel?: 'high' | 'low' | null;
}

export interface ROITrendDataPoint {
  period: string;
  beanCost: number;
  gmv: number;
  roi: number | null;
  ctr: number | null;
  interactionRate: number | null;
  conversionRate: number | null;
}

export interface ROITrendResponse {
  videoId: number;
  videoTitle: string;
  groupBy: string;
  data: ROITrendDataPoint[];
}

export interface ROICompareVideoItem {
  videoId: number;
  videoTitle: string;
  data: ROITrendDataPoint[];
}

export interface ROICompareResponse {
  groupBy: string;
  videos: ROICompareVideoItem[];
}
