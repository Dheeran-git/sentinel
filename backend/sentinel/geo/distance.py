"""Great-circle distance and nearest-neighbour selection."""
from math import asin, cos, radians, sin, sqrt


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance in kilometres between two lat/lng points."""
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * r * asin(sqrt(a))


def nearest(lat: float, lng: float, items: list[dict], k: int = 3) -> list[dict]:
    """Return the k items closest to (lat, lng). Items need lat/lng keys."""
    scored = [
        (haversine_km(lat, lng, it["lat"], it["lng"]), it)
        for it in items
        if it.get("lat") is not None and it.get("lng") is not None
    ]
    scored.sort(key=lambda x: x[0])
    return [{**it, "distance_km": round(d, 1)} for d, it in scored[:k]]
