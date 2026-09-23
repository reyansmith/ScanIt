import re
import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware


BARCODE_RE = re.compile(r"^[A-Za-z0-9._-]{3,50}$")


def validate_barcode(value: str) -> str:
    barcode = value.strip()
    if not BARCODE_RE.fullmatch(barcode):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Barcode must be 3-50 characters and contain only letters, numbers, dots, underscores, or hyphens.",
        )
    return barcode


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Permissions-Policy", "camera=(self)")
        return response


class InMemoryRateLimiter:
    """Per-process sliding-window limiter for basic abuse resistance."""

    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    async def __call__(self, request: Request) -> None:
        forwarded = request.headers.get("x-forwarded-for", "")
        client = forwarded.split(",", 1)[0].strip()
        if not client and request.client:
            client = request.client.host
        key = f"{client or 'unknown'}:{request.url.path}"
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and now - bucket[0] >= self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.limit:
            retry_after = max(1, int(self.window_seconds - (now - bucket[0])))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(retry_after)},
            )
        bucket.append(now)
