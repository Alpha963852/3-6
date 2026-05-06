from typing import List, Optional, Type, TypeVar, Dict
from datetime import datetime
from sqlalchemy import func, cast, String
from sqlalchemy.orm import Session
from models import VideoMaterial, AdData, ROISnapshot
from schemas import (
    VideoMaterialCreate, VideoMaterialUpdate,
    AdDataCreate, AdDataUpdate,
    ROISnapshotCreate, ROISnapshotUpdate,
)

ModelType = TypeVar("ModelType", bound=object)


def get_by_id(db: Session, model: Type[ModelType], item_id: int) -> Optional[ModelType]:
    return db.query(model).filter(model.id == item_id).first()


def get_list(db: Session, model: Type[ModelType], skip: int = 0, limit: int = 100) -> List[ModelType]:
    return db.query(model).offset(skip).limit(limit).all()


def create_video_material(db: Session, data: VideoMaterialCreate) -> VideoMaterial:
    obj = VideoMaterial(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_video_material(db: Session, obj: VideoMaterial, data: VideoMaterialUpdate) -> VideoMaterial:
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_video_material(db: Session, obj: VideoMaterial) -> None:
    db.delete(obj)
    db.commit()


def create_ad_data(db: Session, data: AdDataCreate) -> AdData:
    obj = AdData(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_ad_data(db: Session, obj: AdData, data: AdDataUpdate) -> AdData:
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_ad_data(db: Session, obj: AdData) -> None:
    db.delete(obj)
    db.commit()


def get_ad_data_by_video(db: Session, video_id: int, skip: int = 0, limit: int = 100) -> List[AdData]:
    return db.query(AdData).filter(AdData.video_id == video_id).offset(skip).limit(limit).all()


def create_roi_snapshot(db: Session, data: ROISnapshotCreate) -> ROISnapshot:
    obj = ROISnapshot(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_roi_snapshot(db: Session, obj: ROISnapshot, data: ROISnapshotUpdate) -> ROISnapshot:
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_roi_snapshot(db: Session, obj: ROISnapshot) -> None:
    db.delete(obj)
    db.commit()


def get_roi_snapshots_by_video(db: Session, video_id: int, skip: int = 0, limit: int = 100) -> List[ROISnapshot]:
    return db.query(ROISnapshot).filter(ROISnapshot.video_id == video_id).offset(skip).limit(limit).all()


def get_video_by_title(db: Session, title: str) -> Optional[VideoMaterial]:
    return db.query(VideoMaterial).filter(VideoMaterial.title == title).first()


def query_ad_data(
    db: Session,
    video_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[AdData]:
    q = db.query(AdData)
    if video_id is not None:
        q = q.filter(AdData.video_id == video_id)
    if start_date is not None:
        q = q.filter(AdData.date >= start_date)
    if end_date is not None:
        q = q.filter(AdData.date <= end_date)
    return q.order_by(AdData.date).offset(skip).limit(limit).all()


def aggregate_ad_data(
    db: Session,
    video_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    group_by: str = "day",
) -> List[Dict]:
    if group_by == "week":
        period_expr = func.strftime("%Y-W%W", AdData.date)
    elif group_by == "month":
        period_expr = func.strftime("%Y-%m", AdData.date)
    else:
        period_expr = func.strftime("%Y-%m-%d", AdData.date)

    q = db.query(
        period_expr.label("period"),
        func.sum(AdData.bean_cost).label("bean_cost"),
        func.sum(AdData.impressions).label("impressions"),
        func.sum(AdData.clicks).label("clicks"),
        func.sum(AdData.interactions).label("interactions"),
        func.sum(AdData.conversions).label("conversions"),
        func.sum(AdData.gmv).label("gmv"),
    )
    if video_id is not None:
        q = q.filter(AdData.video_id == video_id)
    if start_date is not None:
        q = q.filter(AdData.date >= start_date)
    if end_date is not None:
        q = q.filter(AdData.date <= end_date)
    q = q.group_by(period_expr).order_by(period_expr)
    rows = q.all()
    return [
        {
            "period": row.period,
            "bean_cost": row.bean_cost or 0.0,
            "impressions": row.impressions or 0,
            "clicks": row.clicks or 0,
            "interactions": row.interactions or 0,
            "conversions": row.conversions or 0,
            "gmv": row.gmv or 0.0,
        }
        for row in rows
    ]


def batch_create_ad_data(db: Session, data_list: List[AdDataCreate]) -> List[AdData]:
    objects = [AdData(**d.model_dump()) for d in data_list]
    db.add_all(objects)
    db.commit()
    for obj in objects:
        db.refresh(obj)
    return objects
