"""Persist cases for the impact map and tracking IDs."""
import sqlite3
from pathlib import Path


class CaseStore:
    """Tiny SQLite-backed store of submitted cases."""

    def __init__(self, path: Path):
        self.path = Path(path)
        self._conn = sqlite3.connect(self.path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS cases ("
            "tracking_id TEXT PRIMARY KEY, category TEXT, lat REAL, lng REAL, "
            "authority TEXT, address TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)"
        )
        self._conn.commit()

    def new_case(self, category: str, lat: float, lng: float, authority: str, address: str) -> str:
        """Insert a new case and return its tracking ID."""
        count = self._conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        tid = f"SNT-{count + 1:04d}"
        self._conn.execute(
            "INSERT INTO cases (tracking_id, category, lat, lng, authority, address) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (tid, category, lat, lng, authority, address),
        )
        self._conn.commit()
        return tid

    def all_cases(self) -> list[dict]:
        """Return all cases ordered newest first."""
        rows = self._conn.execute("SELECT * FROM cases ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]
