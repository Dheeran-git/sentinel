from sentinel.api.sessions import new_thread_id

def test_thread_ids_unique():
    a, b = new_thread_id(), new_thread_id()
    assert a != b and a.startswith("th-")
