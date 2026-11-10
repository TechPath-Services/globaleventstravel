"""Short-lived cache for public trek reads. Writes invalidate it."""

import threading
import time
from typing import Any, Optional

PUBLIC_CACHE_TTL_SECONDS = 60

_lock = threading.Lock()
_store: dict[str, tuple[float, Any]] = {}


def cache_get(key: str) -> Optional[Any]:
    now = time.monotonic()
    with _lock:
        item = _store.get(key)
        if item is None:
            return None
        expires, value = item
        if expires <= now:
            _store.pop(key, None)
            return None
        return value


def cache_set(key: str, value: Any, ttl: int = PUBLIC_CACHE_TTL_SECONDS) -> None:
    with _lock:
        _store[key] = (time.monotonic() + ttl, value)


def clear_public_cache() -> None:
    with _lock:
        _store.clear()
