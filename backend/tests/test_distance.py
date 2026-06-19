from sentinel.geo.distance import haversine_km, nearest


def test_haversine_known_distance():
    d = haversine_km(12.9716, 77.5946, 13.0285, 77.5190)
    assert 8 < d < 16


def test_nearest_picks_closest():
    items = [
        {"name": "far", "lat": 13.20, "lng": 77.70},
        {"name": "near", "lat": 12.98, "lng": 77.60},
    ]
    result = nearest(12.97, 77.59, items, k=1)
    assert result[0]["name"] == "near"
