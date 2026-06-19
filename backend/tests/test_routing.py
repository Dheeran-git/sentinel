from sentinel.actions.routing import nearest_recyclers, ward_authority


def test_nearest_recyclers_returns_sorted():
    out = nearest_recyclers(12.97, 77.59, k=2)
    assert 1 <= len(out) <= 2
    assert "distance_km" in out[0]


def test_ward_authority_returns_contact():
    a = ward_authority(12.91, 77.58)
    assert a["authority"]
    assert a["contact"]
