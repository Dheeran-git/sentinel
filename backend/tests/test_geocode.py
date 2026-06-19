import os
import pytest
from sentinel.geo.geocode import geocode

online = pytest.mark.skipif(os.getenv("OFFLINE") == "1", reason="offline mode")


@online
def test_geocode_bengaluru():
    result = geocode("Peenya Industrial Area, Bengaluru")
    assert result is not None
    lat, lng = result
    assert 12.5 < lat < 13.5 and 77.0 < lng < 78.0
