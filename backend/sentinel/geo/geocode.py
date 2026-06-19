"""Forward and reverse geocoding via Nominatim (OpenStreetMap)."""
from geopy.geocoders import Nominatim

_geo = Nominatim(user_agent="sentinel-civic-agent")


def geocode(address: str) -> tuple[float, float] | None:
    """Address -> (lat, lng), or None if not found."""
    loc = _geo.geocode(address, timeout=10)
    if loc is None:
        return None
    return (loc.latitude, loc.longitude)


def reverse(lat: float, lng: float) -> str:
    """(lat, lng) -> a human-readable address string (best effort)."""
    try:
        loc = _geo.reverse((lat, lng), timeout=10)
        return loc.address if loc else f"{lat:.5f}, {lng:.5f}"
    except Exception:
        return f"{lat:.5f}, {lng:.5f}"
