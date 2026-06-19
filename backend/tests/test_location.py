from sentinel.perception.location import resolve_location


def test_device_location_takes_priority():
    loc = resolve_location(device=(12.97, 77.59), image_bytes=None)
    assert loc == (12.97, 77.59)


def test_no_location_returns_none():
    assert resolve_location(device=None, image_bytes=None) is None
