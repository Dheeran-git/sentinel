import os
from pathlib import Path
import pytest
from sentinel.perception.vision import perceive
from sentinel.models import ViolationCategory

needs_key = pytest.mark.skipif(
    not os.getenv("GOOGLE_API_KEY"), reason="no GOOGLE_API_KEY"
)


@needs_key
def test_perceive_ewaste_photo():
    img = (Path(__file__).parent / "fixtures" / "ewaste.jpg").read_bytes()
    report = perceive(img)
    assert report.is_violation
    assert report.category == ViolationCategory.EWASTE
    assert report.confidence > 0.5
