"""Resolve a photo's location: device GPS first, EXIF as a bonus."""
from io import BytesIO

from PIL import Image
from PIL.ExifTags import GPSTAGS, TAGS


def _exif_gps(image_bytes: bytes) -> tuple[float, float] | None:
    try:
        img = Image.open(BytesIO(image_bytes))
        exif = img._getexif() or {}
    except Exception:
        return None
    gps = {}
    for tag, value in exif.items():
        if TAGS.get(tag) == "GPSInfo":
            for t, v in value.items():
                gps[GPSTAGS.get(t, t)] = v
    if not gps or "GPSLatitude" not in gps:
        return None

    def to_deg(dms, ref):
        d, m, s = (float(x) for x in dms)
        val = d + m / 60 + s / 3600
        return -val if ref in ("S", "W") else val

    return (
        to_deg(gps["GPSLatitude"], gps.get("GPSLatitudeRef", "N")),
        to_deg(gps["GPSLongitude"], gps.get("GPSLongitudeRef", "E")),
    )


def resolve_location(
    device: tuple[float, float] | None, image_bytes: bytes | None
) -> tuple[float, float] | None:
    """Device GPS wins; otherwise try EXIF; otherwise None (caller asks user)."""
    if device is not None:
        return device
    if image_bytes is not None:
        return _exif_gps(image_bytes)
    return None
