from roi_engine import calculate_roi, get_roi_label


def test_calculate_roi_normal():
    result = calculate_roi(
        bean_cost=1000, gmv=2000, impressions=10000,
        clicks=500, interactions=300, conversions=50,
    )
    assert result["roi"] == 100.0
    assert result["bean_output"] == 2.0
    assert result["ctr"] == 5.0
    assert result["interaction_rate"] == 3.0
    assert result["conversion_rate"] == 10.0


def test_calculate_roi_zero_cost():
    result = calculate_roi(
        bean_cost=0, gmv=1000, impressions=10000,
        clicks=500, interactions=300, conversions=50,
    )
    assert result["roi"] is None
    assert result["bean_output"] is None
    assert result["ctr"] == 5.0
    assert result["interaction_rate"] == 3.0
    assert result["conversion_rate"] == 10.0


def test_calculate_roi_zero_impressions():
    result = calculate_roi(
        bean_cost=1000, gmv=2000, impressions=0,
        clicks=0, interactions=0, conversions=0,
    )
    assert result["roi"] == 100.0
    assert result["bean_output"] == 2.0
    assert result["ctr"] is None
    assert result["interaction_rate"] is None
    assert result["conversion_rate"] is None


def test_calculate_roi_negative_roi():
    result = calculate_roi(
        bean_cost=2000, gmv=1000, impressions=10000,
        clicks=500, interactions=300, conversions=50,
    )
    assert result["roi"] == -50.0


def test_get_roi_label():
    assert get_roi_label(150.0) == "high"
    assert get_roi_label(-10.0) == "low"
    assert get_roi_label(50.0) is None
    assert get_roi_label(None) is None
