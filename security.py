"""
Simple service-level bearer-token auth for operator/admin roles.
"""
from enum import Enum
import os
from typing import Optional

from fastapi import Depends, Header, HTTPException, status


class ApiRole(str, Enum):
    OPERATOR = "operator"
    ADMIN = "admin"


def _extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return authorization.split(" ", 1)[1].strip()


def _resolve_role(token: str) -> ApiRole:
    admin_token = os.environ.get("ADMIN_TOKEN")
    operator_token = os.environ.get("OPERATOR_TOKEN")

    if admin_token and token == admin_token:
        return ApiRole.ADMIN
    if operator_token and token == operator_token:
        return ApiRole.OPERATOR

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token is missing or invalid",
    )


def require_operator_role(authorization: Optional[str] = Header(None)) -> ApiRole:
    token = _extract_bearer_token(authorization)
    return _resolve_role(token)


def require_admin_role(role: ApiRole = Depends(require_operator_role)) -> ApiRole:
    if role != ApiRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return role
