from datetime import datetime, timedelta

from fastapi import status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitingMiddleware(BaseHTTPMiddleware):
    RATE_LIMIT_DURATION = timedelta(seconds=1)
    RATE_LIMIT_REQUESTS = 5

    def __init__(self, app):
        super().__init__(app)
        self.request_counts = {}

    async def dispatch(self, request, call_next):
        client_ip = request.client.host

        request_count, last_request = self.request_counts.get(client_ip, (0, datetime.min))
        elapsed_time = datetime.now() - last_request

        if elapsed_time > self.RATE_LIMIT_DURATION:
            request_count = 1
        else:
            if request_count >= self.RATE_LIMIT_REQUESTS:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"message": "Rate limit exceeded. Please try again later."}
                )
            request_count += 1

        self.request_counts[client_ip] = (request_count, datetime.now())
        response = await call_next(request)
        return response