from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import AdData, ROISnapshot


def get_roi_label(roi, high_threshold=100.0, low_threshold=0.0):
    if roi is None:
        return None
    if roi >= high_threshold:
        return "high"
    if roi <= low_threshold:
        return "low"
    return None


def calculate_roi(bean_cost, gmv, impressions, clicks, interactions, conversions):
    result = {
        "roi": None,
        "bean_output": None,
        "ctr": None,
        "interaction_rate": None,
        "conversion_rate": None,
    }

    if bean_cost != 0:
        result["roi"] = round((gmv - bean_cost) / bean_cost * 100, 2)
        result["bean_output"] = round(gmv / bean_cost, 2)

    if impressions != 0:
        result["ctr"] = round(clicks / impressions * 100, 2)
        result["interaction_rate"] = round(interactions / impressions * 100, 2)

    if clicks != 0:
        result["conversion_rate"] = round(conversions / clicks * 100, 2)

    return result


def calculate_video_roi(db: Session, video_id: int, date_range_type='all', start_date=None, end_date=None):
    today = date.today()

    if date_range_type == '7d':
        start_date = today - timedelta(days=7)
        end_date = today
    elif date_range_type == '30d':
        start_date = today - timedelta(days=30)
        end_date = today

    start_datetime = datetime.combine(start_date, datetime.min.time()) if start_date else None
    end_datetime = datetime.combine(end_date, datetime.max.time()) if end_date else None

    q = db.query(
        func.coalesce(func.sum(AdData.bean_cost), 0).label("bean_cost"),
        func.coalesce(func.sum(AdData.impressions), 0).label("impressions"),
        func.coalesce(func.sum(AdData.clicks), 0).label("clicks"),
        func.coalesce(func.sum(AdData.interactions), 0).label("interactions"),
        func.coalesce(func.sum(AdData.conversions), 0).label("conversions"),
        func.coalesce(func.sum(AdData.gmv), 0).label("gmv"),
    ).filter(AdData.video_id == video_id)

    if start_datetime is not None:
        q = q.filter(AdData.date >= start_datetime)
    if end_datetime is not None:
        q = q.filter(AdData.date <= end_datetime)

    row = q.one()

    metrics = calculate_roi(
        bean_cost=row.bean_cost,
        gmv=row.gmv,
        impressions=row.impressions,
        clicks=row.clicks,
        interactions=row.interactions,
        conversions=row.conversions,
    )

    result = {
        "roi": metrics["roi"],
        "bean_output": metrics["bean_output"],
        "ctr": metrics["ctr"],
        "interaction_rate": metrics["interaction_rate"],
        "conversion_rate": metrics["conversion_rate"],
        "total_bean_cost": row.bean_cost,
        "total_gmv": row.gmv,
    }

    existing = db.query(ROISnapshot).filter(
        ROISnapshot.video_id == video_id,
        ROISnapshot.date_range_type == date_range_type,
    ).first()

    snapshot_data = {
        "video_id": video_id,
        "date_range_type": date_range_type,
        "start_date": start_datetime,
        "end_date": end_datetime,
        "roi": metrics["roi"],
        "bean_output": metrics["bean_output"],
        "ctr": metrics["ctr"],
        "interaction_rate": metrics["interaction_rate"],
        "conversion_rate": metrics["conversion_rate"],
        "total_bean_cost": row.bean_cost,
        "total_gmv": row.gmv,
    }

    if existing:
        for key, value in snapshot_data.items():
            setattr(existing, key, value)
        existing.calculated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
    else:
        new_snapshot = ROISnapshot(**snapshot_data)
        db.add(new_snapshot)
        db.commit()
        db.refresh(new_snapshot)

    return result


def trigger_roi_recalculation(db: Session, video_id: int):
    for range_type in ['all', '7d', '30d']:
        calculate_video_roi(db, video_id, date_range_type=range_type)
