from fastapi import APIRouter
from .auth import router as auth_router
from .games import router as games_router
from .admin import router as admin_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(games_router)
api_v1_router.include_router(admin_router)

__all__ = ["api_v1_router"]
