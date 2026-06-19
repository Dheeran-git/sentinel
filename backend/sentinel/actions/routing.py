"""Route a located issue to the nearest recycler or jurisdiction authority."""
import json
from pathlib import Path

from sentinel.geo.distance import haversine_km, nearest

DATA = Path(__file__).resolve().parent.parent / "data"


def _load(name: str) -> list[dict]:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def nearest_recyclers(lat: float, lng: float, k: int = 3) -> list[dict]:
    """Closest authorized e-waste recyclers to the location."""
    return nearest(lat, lng, _load("recyclers.bengaluru.json"), k=k)


def ward_authority(lat: float, lng: float) -> dict:
    """The BBMP ward authority whose centroid is closest to the location."""
    wards = _load("wards.bengaluru.json")
    best = min(
        wards,
        key=lambda w: haversine_km(lat, lng, w["centroid"]["lat"], w["centroid"]["lng"]),
    )
    return {"authority": best["authority"], "contact": best["contact"], "ward": best["ward"]}
