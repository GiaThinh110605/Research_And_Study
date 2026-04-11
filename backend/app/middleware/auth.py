import re
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.core.config import settings

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow preflight (OPTIONS) requests to bypass auth for CORS compatibility
        if request.method == "OPTIONS":
            return await call_next(request)

        # List of public paths that don't require authentication
        # Using regex for flexible matching (e.g., /uploads/...)
        EXEMPT_PATHS = [
            r"^/$",
            r"^/health$",
            r"^/docs",
            r"^/redoc",
            r"^/openapi.json",
            r"^/api/v1/auth/login",
            r"^/api/v1/auth/register",
            r"^/uploads/.*",
        ]
        
        path = request.url.path
        
        # Check if path is exempt
        if any(re.match(pattern, path) for pattern in EXEMPT_PATHS):
            return await call_next(request)
        
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated. Missing or invalid Authorization header."},
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            # Validate token (signature and expiration)
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            
            # Optionally inject user_id into request state for later use
            user_id: str = payload.get("sub")
            if user_id is None:
                raise JWTError("Token missing 'sub' claim")
                
            request.state.user_id = user_id
            
        except JWTError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Could not validate credentials: {str(e)}"},
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return await call_next(request)
