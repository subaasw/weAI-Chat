from datetime import timedelta
from fastapi import Request, Response

class CookieManager:
    _cookie_name = "access_token"

    def read_cookie(self, request: Request) -> str:
        return request.cookies.get(self._cookie_name) or ""

    def set_cookie(self, response: Response, value: str) -> None:
        response.set_cookie(key=self._cookie_name, path="/", value=value, secure=True, max_age=int(timedelta(hours=24).total_seconds()), samesite="none")

    def remove_cookie(self, response: Response) -> None:
        response.delete_cookie(self._cookie_name, secure=True, httponly=True, samesite="none")
