import os
import pytest
from sentinel.llm import flash

needs_key = pytest.mark.skipif(
    not os.getenv("GOOGLE_API_KEY"), reason="no GOOGLE_API_KEY set"
)


@needs_key
def test_flash_text():
    resp = flash().invoke("Reply with the single word: ok")
    assert "ok" in resp.content.lower()
