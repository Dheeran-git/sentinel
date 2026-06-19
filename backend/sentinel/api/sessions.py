"""Thread id helper for per-mission graph state."""
import uuid


def new_thread_id() -> str:
    return f"th-{uuid.uuid4().hex[:8]}"
