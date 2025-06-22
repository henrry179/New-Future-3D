#!/usr/bin/env python3
"""
🚀 NewFutures VFX Web界面启动器
包含完整的错误处理、日志记录和自动测试功能
"""

import os
import sys
import time
import uvicorn
import asyncio
import requests
import threading
from pathlib import Path
from typing import Optional

# 添加src目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "src"))

def setup_environment():
    """设置环境变量"""
    os.environ.setdefault("DEBUG", "true")
    os.environ.setdefault("HOST", "0.0.0.0")
    os.environ.setdefault("PORT", "8000")
    os.environ.setdefault("LOG_LEVEL", "info")
    
    # 创建必要的目录
    directories = ["logs", "uploads", "temp", "render_output", "models"]
    for dir_name in directories:
        (project_root / dir_name).mkdir(exist_ok=True)

def check_dependencies():
    """检查依赖包是否正确安装"""
    required_packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "loguru"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ 缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    return True

def check_static_files():
    """检查静态文件是否存在"""
    static_files = [
        "public/index.html",
        "public/css/styles.css",
        "public/js/app.js"
    ]
    
    missing_files = []
    for file_path in static_files:
        if not (project_root / file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"⚠️  缺少静态文件: {', '.join(missing_files)}")
        return False
    
    return True

def create_app():
    """创建FastAPI应用"""
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, JSONResponse
    import logging
    
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    app = FastAPI(
        title="NewFutures VFX Platform",
        description="Professional VFX Operations Platform with 3D Effects",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc"
    )
    
    # CORS中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 静态文件服务
    try:
        app.mount("/static", StaticFiles(directory="public"), name="static")
        logger.info("✅ 静态文件服务已配置")
    except Exception as e:
        logger.error(f"❌ 静态文件服务配置失败: {e}")
    
    @app.get("/")
    async def root():
        """主页面"""
        try:
            return FileResponse("public/index.html")
        except Exception as e:
            logger.error(f"主页面加载失败: {e}")
            raise HTTPException(status_code=500, detail="主页面加载失败")
    
    @app.get("/health")
    async def health_check():
        """健康检查"""
        return {
            "status": "healthy",
            "service": "newfutures-vfx",
            "version": "0.1.0",
            "timestamp": time.time()
        }
    
    @app.get("/api/status")
    async def api_status():
        """API状态检查"""
        return {
            "status": "running",
            "message": "NewFutures VFX API is operational",
            "features": [
                "3D Effects Rendering",
                "Particle Systems",
                "Fluid Simulation", 
                "Real-time Ray Tracing"
            ]
        }
    
    @app.get("/api/test")
    async def test_endpoint():
        """测试端点"""
        return {
            "test": "success",
            "static_files": check_static_files(),
            "timestamp": time.time()
        }
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """全局异常处理"""
        logger.error(f"全局异常: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "内部服务器错误", "detail": str(exc)}
        )
    
    return app, logger

def test_server(host: str, port: int, timeout: int = 30) -> bool:
    """测试服务器是否正常响应"""
    base_url = f"http://{host}:{port}"
    
    print(f"🧪 开始测试服务器 {base_url}...")
    
    # 等待服务器启动
    for i in range(timeout):
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ 健康检查通过 (耗时: {i+1}秒)")
                break
        except requests.exceptions.RequestException:
            if i == timeout - 1:
                print(f"❌ 服务器启动超时 ({timeout}秒)")
                return False
            time.sleep(1)
            print(f"⏳ 等待服务器启动... ({i+1}/{timeout})")
    
    # 测试各个端点
    test_endpoints = [
        ("/health", "健康检查"),
        ("/api/status", "API状态"),
        ("/api/test", "测试端点"),
        ("/", "主页面")
    ]
    
    all_passed = True
    for endpoint, name in test_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {name}: 正常")
            else:
                print(f"❌ {name}: HTTP {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {name}: {e}")
            all_passed = False
    
    return all_passed

def run_server_with_testing():
    """运行服务器并进行测试"""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print("🚀 NewFutures VFX Platform 启动器")
    print("=" * 50)
    
    # 预检查
    print("📋 执行预检查...")
    if not check_dependencies():
        sys.exit(1)
    
    if not check_static_files():
        print("⚠️  静态文件缺失，但将继续启动...")
    
    setup_environment()
    
    # 创建应用
    try:
        app, logger = create_app()
        print("✅ FastAPI应用创建成功")
    except Exception as e:
        print(f"❌ FastAPI应用创建失败: {e}")
        sys.exit(1)
    
    # 启动服务器
    print(f"🌐 启动服务器 http://{host}:{port}")
    print(f"📁 静态文件目录: {project_root / 'public'}")
    print(f"📊 API文档: http://localhost:{port}/api/docs")
    print("=" * 50)
    
    # 在后台线程中运行测试
    def run_tests():
        time.sleep(3)  # 等待服务器启动
        success = test_server("localhost", port)
        if success:
            print("\n🎉 所有测试通过！Web界面已成功启动")
            print(f"🌐 访问: http://localhost:{port}")
        else:
            print("\n❌ 部分测试失败，请检查日志")
    
    test_thread = threading.Thread(target=run_tests, daemon=True)
    test_thread.start()
    
    # 启动服务器
    try:
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"\n❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_server_with_testing() 