#!/usr/bin/env python3
"""
简化的NewFutures VFX服务器启动脚本
"""

import os
import sys
import uvicorn
from pathlib import Path

# 添加src目录到Python路径
sys.path.insert(0, str(Path(__file__).parent / "src"))

# 设置基本环境变量
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("HOST", "0.0.0.0")
os.environ.setdefault("PORT", "8000")
os.environ.setdefault("LOG_LEVEL", "info")

# 简化的FastAPI应用
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(
    title="NewFutures VFX Platform",
    description="Professional VFX Operations Platform",
    version="0.1.0",
)

# CORS中间件 - 完整配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# 静态文件服务
app.mount("/static", StaticFiles(directory="public"), name="static")

@app.get("/")
async def root():
    """提供主页面"""
    return FileResponse("public/index.html")

@app.options("/")
async def options_root():
    """处理根路径的OPTIONS请求"""
    return {"message": "CORS preflight OK"}

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "newfutures-vfx",
        "version": "0.1.0"
    }

@app.get("/api/status")
async def api_status():
    """API状态"""
    return {
        "status": "running",
        "message": "NewFutures VFX API is running"
    }

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Starting NewFutures VFX Platform on http://{host}:{port}")
    print(f"📁 Serving static files from: {Path('public').absolute()}")
    print(f"🌐 Web interface: http://localhost:{port}")
    print(f"📊 API docs: http://localhost:{port}/docs")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,  # 禁用reload模式
        log_level="info"
    ) 