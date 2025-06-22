"""
API路由模块
"""

from fastapi import APIRouter

from .vfx import router as vfx_router
from .render import router as render_router

# 创建主路由器
router = APIRouter()

# 包含子路由
router.include_router(vfx_router, prefix="/vfx", tags=["VFX"])
router.include_router(render_router, prefix="/render", tags=["Render"])

@router.get("/")
async def api_root():
    """API根路径"""
    return {
        "message": "NewFutures VFX API",
        "version": "0.1.0",
        "status": "running"
    } 