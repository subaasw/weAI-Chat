from fastapi import Request, Response

class CookieManager:
    _cookie_name = "access_token"
    def read_cookie(self, request: Request) -> str:
        return request.cookies.get(self._cookie_name) or ""

    def set_cookie(self, response: Response, value: str) -> None:
        response.set_cookie(key=self._cookie_name, value=value, secure=True)

    def remove_cookie(self, response: Response) -> None:
        response.set_cookie(self._cookie_name, "")
