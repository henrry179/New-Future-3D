"""
NewFutures VFX - Main Application Entry Point
"""

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from core.config import settings
from core.database import init_db
from core.redis_client import init_redis
from api import router as api_router
from utils.logger import setup_logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    应用生命周期管理
    """
    # 启动时的初始化
    logger.info("🚀 Starting NewFutures VFX Platform...")
    
    # 设置日志
    setup_logger()
    
    # 初始化数据库
    await init_db()
    logger.info("✅ Database initialized")
    
    # 初始化Redis
    await init_redis()
    logger.info("✅ Redis initialized")
    
    # 启动后台任务
    # asyncio.create_task(start_background_tasks())
    
    logger.info("✨ NewFutures VFX Platform is ready!")
    
    yield
    
    # 关闭时的清理
    logger.info("🔄 Shutting down NewFutures VFX Platform...")
    # await cleanup_resources()
    logger.info("👋 Goodbye!")


def create_app() -> FastAPI:
    """
    创建FastAPI应用实例
    """
    app = FastAPI(
        title="NewFutures VFX Platform",
        description="Professional VFX Operations Platform with AI-powered effects and rendering",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    
    # CORS中间件配置
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 静态文件服务
    app.mount("/static", StaticFiles(directory="public"), name="static")
    
    # 注册路由
    app.include_router(api_router, prefix="/api/v1")
    
    # 健康检查端点
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "newfutures-vfx",
            "version": "0.1.0"
        }
    
    return app


# 创建应用实例
app = create_app()


def run_server():
    """
    启动服务器
    """
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS,
        log_level=settings.LOG_LEVEL.lower(),
    )


def main():
    """
    主函数入口
    """
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "serve":
            run_server()
        elif command == "worker":
            from worker import run_worker
            run_worker()
        elif command == "migrate":
            from core.database import run_migrations
            asyncio.run(run_migrations())
        else:
            logger.error(f"Unknown command: {command}")
            sys.exit(1)
    else:
        # 默认启动服务器
        run_server()


if __name__ == "__main__":
    main()
