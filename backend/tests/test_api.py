from fastapi.testclient import TestClient
from sentinel.api.main import app

def test_cases_endpoint():
    client = TestClient(app)
    resp = client.get("/cases")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
