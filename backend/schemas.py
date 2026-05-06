from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class VideoMaterialBase(BaseModel):
    title: str
    video_url: Optional[str] = None
    cover_url: Optional[str] = None
    duration: Optional[float] = None
    aspect_ratio: Optional[str] = None
    material_type: Optional[str] = "video"
    status: Optional[str] = "active"


class VideoMaterialCreate(VideoMaterialBase):
    pass


class VideoMaterialUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    cover_url: Optional[str] = None
    duration: Optional[float] = None
    aspect_ratio: Optional[str] = None
    material_type: Optional[str] = None
    status: Optional[str] = None


class VideoMaterialOut(VideoMaterialBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdDataBase(BaseModel):
    video_id: int
    date: datetime
    bean_cost: Optional[float] = 0.0
    impressions: Optional[int] = 0
    clicks: Optional[int] = 0
    interactions: Optional[int] = 0
    conversions: Optional[int] = 0
    gmv: Optional[float] = 0.0


class AdDataCreate(AdDataBase):
    pass


class AdDataUpdate(BaseModel):
    date: Optional[datetime] = None
    bean_cost: Optional[float] = None
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    interactions: Optional[int] = None
    conversions: Optional[int] = None
    gmv: Optional[float] = None


class AdDataOut(AdDataBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdDataAggregatedOut(BaseModel):
    period: str
    bean_cost: float
    impressions: int
    clicks: int
    interactions: int
    conversions: int
    gmv: float


class ImportFailureDetail(BaseModel):
    row: int
    reason: str


class AdDataImportResult(BaseModel):
    success_count: int
    failure_count: int
    failures: List[ImportFailureDetail]


class ROISnapshotBase(BaseModel):
    video_id: int
    date_range_type: Optional[str] = "all"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    roi: Optional[float] = 0.0
    bean_output: Optional[float] = 0.0
    ctr: Optional[float] = 0.0
    interaction_rate: Optional[float] = 0.0
    conversion_rate: Optional[float] = 0.0
    total_bean_cost: Optional[float] = 0.0
    total_gmv: Optional[float] = 0.0


class ROISnapshotCreate(ROISnapshotBase):
    pass


class ROISnapshotUpdate(BaseModel):
    date_range_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    roi: Optional[float] = None
    bean_output: Optional[float] = None
    ctr: Optional[float] = None
    interaction_rate: Optional[float] = None
    conversion_rate: Optional[float] = None
    total_bean_cost: Optional[float] = None
    total_gmv: Optional[float] = None


class ROISnapshotOut(ROISnapshotBase):
    id: int
    calculated_at: datetime

    model_config = {"from_attributes": True}


class ROIDataOut(BaseModel):
    roi: Optional[float] = None
    bean_output: Optional[float] = None
    ctr: Optional[float] = None
    interaction_rate: Optional[float] = None
    conversion_rate: Optional[float] = None
    total_bean_cost: float = 0.0
    total_gmv: float = 0.0


class ROIBatchItemOut(BaseModel):
    video_id: int
    roi: Optional[float] = None
    bean_output: Optional[float] = None
    ctr: Optional[float] = None
    interaction_rate: Optional[float] = None
    conversion_rate: Optional[float] = None
    total_bean_cost: float = 0.0
    total_gmv: float = 0.0


class MaterialROIItemOut(BaseModel):
    id: int
    title: str
    video_url: Optional[str] = None
    cover_url: Optional[str] = None
    duration: Optional[float] = None
    aspect_ratio: Optional[str] = None
    material_type: Optional[str] = "video"
    status: Optional[str] = "active"
    created_at: datetime
    updated_at: datetime
    roi: Optional[float] = None
    bean_output: Optional[float] = None
    ctr: Optional[float] = None
    interaction_rate: Optional[float] = None
    conversion_rate: Optional[float] = None
    total_bean_cost: float = 0.0
    total_gmv: float = 0.0
    roi_label: Optional[str] = None

    model_config = {"from_attributes": True}


class MaterialROIFilterResult(BaseModel):
    total: int
    items: List[MaterialROIItemOut]


class ROIThresholdsOut(BaseModel):
    high_threshold: float = 100.0
    low_threshold: float = 0.0


class ROIThresholdsUpdate(BaseModel):
    high_threshold: Optional[float] = None
    low_threshold: Optional[float] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ROITrendDataPoint(BaseModel):
    period: str
    beanCost: float = 0.0
    gmv: float = 0.0
    roi: Optional[float] = None
    ctr: Optional[float] = None
    interactionRate: Optional[float] = None
    conversionRate: Optional[float] = None


class ROITrendResponse(BaseModel):
    videoId: int
    videoTitle: str
    groupBy: str
    data: List[ROITrendDataPoint]


class ROICompareVideoItem(BaseModel):
    videoId: int
    videoTitle: str
    data: List[ROITrendDataPoint]


class ROICompareResponse(BaseModel):
    groupBy: str
    videos: List[ROICompareVideoItem]
