from datetime import datetime, date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_material():
    resp = client.post("/api/materials", json={
        "title": "测试视频",
        "video_url": "https://example.com/video.mp4",
        "cover_url": "https://example.com/cover.jpg",
        "duration": 60.0,
        "aspect_ratio": "16:9",
        "material_type": "video",
    })
    assert resp.status_code == 200
    return resp.json()


@pytest.fixture
def sample_material_with_ad_data(sample_material):
    video_id = sample_material["id"]
    today = date.today()
    for i in range(3):
        ad_date = today - timedelta(days=i)
        resp = client.post("/api/ad-data", json={
            "video_id": video_id,
            "date": ad_date.isoformat() + "T00:00:00",
            "bean_cost": 1000.0,
            "impressions": 10000,
            "clicks": 500,
            "interactions": 300,
            "conversions": 50,
            "gmv": 2000.0,
        })
        assert resp.status_code == 200
    return sample_material


def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_create_material():
    resp = client.post("/api/materials", json={
        "title": "新素材",
        "video_url": "https://example.com/new.mp4",
        "duration": 30.0,
        "material_type": "video",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "新素材"
    assert data["duration"] == 30.0
    assert "id" in data


def test_create_ad_data(sample_material):
    video_id = sample_material["id"]
    resp = client.post("/api/ad-data", json={
        "video_id": video_id,
        "date": "2025-01-01T00:00:00",
        "bean_cost": 500.0,
        "impressions": 5000,
        "clicks": 250,
        "interactions": 150,
        "conversions": 25,
        "gmv": 1000.0,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["video_id"] == video_id
    assert data["bean_cost"] == 500.0


def test_get_ad_data_by_video(sample_material_with_ad_data):
    video_id = sample_material_with_ad_data["id"]
    resp = client.get(f"/api/materials/{video_id}/ad-data")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3


def test_get_video_roi(sample_material_with_ad_data):
    video_id = sample_material_with_ad_data["id"]
    resp = client.get(f"/api/materials/{video_id}/roi")
    assert resp.status_code == 200
    data = resp.json()
    assert data["roi"] == 100.0
    assert data["bean_output"] == 2.0
    assert data["ctr"] == 5.0
    assert data["interaction_rate"] == 3.0
    assert data["conversion_rate"] == 10.0
    assert data["total_bean_cost"] == 3000.0
    assert data["total_gmv"] == 6000.0


def test_roi_filter(sample_material_with_ad_data):
    resp = client.get("/api/materials/roi-filter")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    item = data["items"][0]
    assert item["roi"] == 100.0
    assert item["roi_label"] == "high"


def test_eliminate_material(sample_material):
    material_id = sample_material["id"]
    resp = client.put(f"/api/materials/{material_id}/eliminate")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "pending_elimination"


def test_restore_material(sample_material):
    material_id = sample_material["id"]
    client.put(f"/api/materials/{material_id}/eliminate")
    resp = client.put(f"/api/materials/{material_id}/restore")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "active"


def test_roi_trend(sample_material_with_ad_data):
    video_id = sample_material_with_ad_data["id"]
    today = date.today()
    resp = client.get(
        f"/api/materials/{video_id}/roi-trend",
        params={
            "group_by": "day",
            "start_date": (today - timedelta(days=5)).isoformat(),
            "end_date": today.isoformat(),
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["videoId"] == video_id
    assert data["groupBy"] == "day"
    assert len(data["data"]) == 3
    point = data["data"][0]
    assert point["roi"] == 100.0
    assert point["ctr"] == 5.0
