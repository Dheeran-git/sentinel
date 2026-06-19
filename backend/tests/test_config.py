from sentinel.config import Settings


def test_settings_defaults(monkeypatch):
    monkeypatch.setenv("GOOGLE_API_KEY", "test-key")
    s = Settings()
    assert s.google_api_key == "test-key"
    assert s.flash_model == "gemini-2.5-flash"
    assert s.pro_model == "gemini-2.5-pro"
