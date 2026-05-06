from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base


class VideoMaterial(Base):
    __tablename__ = "video_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    video_url = Column(String(1024), nullable=True)
    cover_url = Column(String(1024), nullable=True)
    duration = Column(Float, nullable=True)
    aspect_ratio = Column(String(20), nullable=True)
    material_type = Column(SAEnum("video", "image", name="material_type_enum"), default="video")
    status = Column(SAEnum("active", "pending_elimination", name="status_enum"), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ad_data = relationship("AdData", back_populates="video_material")
    roi_snapshots = relationship("ROISnapshot", back_populates="video_material")


class AdData(Base):
    __tablename__ = "ad_data"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("video_materials.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    bean_cost = Column(Float, default=0.0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    gmv = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    video_material = relationship("VideoMaterial", back_populates="ad_data")


class ROISnapshot(Base):
    __tablename__ = "roi_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("video_materials.id"), nullable=False)
    date_range_type = Column(SAEnum("all", "7d", "30d", "custom", name="date_range_enum"), default="all")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    roi = Column(Float, default=0.0)
    bean_output = Column(Float, default=0.0)
    ctr = Column(Float, default=0.0)
    interaction_rate = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=0.0)
    total_bean_cost = Column(Float, default=0.0)
    total_gmv = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    video_material = relationship("VideoMaterial", back_populates="roi_snapshots")
