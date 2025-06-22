"""
Configuration management for NewFutures VFX Platform
"""

from typing import List, Optional, Union
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    应用配置类
    """
    
    # 基础配置
    APP_NAME: str = "NewFutures VFX"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = Field(default=False, description="Debug mode")
    
    # 服务器配置
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    WORKERS: int = Field(default=4, description="Number of workers")
    
    # 数据库配置
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost/newfutures_vfx",
        description="PostgreSQL database URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, description="Database max overflow")
    
    # Redis配置
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL"
    )
    REDIS_POOL_SIZE: int = Field(default=10, description="Redis connection pool size")
    
    # 存储配置
    MINIO_ENDPOINT: str = Field(default="localhost:9000", description="MinIO endpoint")
    MINIO_ACCESS_KEY: str = Field(default="minioadmin", description="MinIO access key")
    MINIO_SECRET_KEY: str = Field(default="minioadmin", description="MinIO secret key")
    MINIO_SECURE: bool = Field(default=False, description="Use HTTPS for MinIO")
    MINIO_BUCKET_NAME: str = Field(default="newfutures-vfx", description="Default bucket name")
    
    # 安全配置
    SECRET_KEY: str = Field(
        default="your-secret-key-here-change-in-production",
        description="Secret key for JWT"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration")
    
    # CORS配置
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080", "http://localhost:8000", "http://127.0.0.1:8000"],
        description="Allowed CORS origins"
    )
    
    # 日志配置
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: Optional[str] = Field(default="logs/app.log", description="Log file path")
    
    # Celery配置
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/1",
        description="Celery broker URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/2",
        description="Celery result backend"
    )
    
    # AI/ML配置
    MODEL_CACHE_DIR: str = Field(default="models", description="Model cache directory")
    USE_GPU: bool = Field(default=True, description="Use GPU for inference")
    CUDA_DEVICE: int = Field(default=0, description="CUDA device index")
    
    # 特效处理配置
    MAX_VIDEO_SIZE_MB: int = Field(default=500, description="Maximum video size in MB")
    MAX_AUDIO_SIZE_MB: int = Field(default=100, description="Maximum audio size in MB")
    SUPPORTED_VIDEO_FORMATS: List[str] = Field(
        default=["mp4", "avi", "mov", "mkv", "webm"],
        description="Supported video formats"
    )
    SUPPORTED_AUDIO_FORMATS: List[str] = Field(
        default=["mp3", "wav", "aac", "flac", "ogg"],
        description="Supported audio formats"
    )
    
    # 渲染配置
    RENDER_THREADS: int = Field(default=8, description="Number of render threads")
    RENDER_TIMEOUT: int = Field(default=3600, description="Render timeout in seconds")
    RENDER_OUTPUT_DIR: str = Field(default="render_output", description="Render output directory")
    
    # 路径配置
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Optional[Path] = Field(default=None, description="Upload directory")
    TEMP_DIR: Optional[Path] = Field(default=None, description="Temporary directory")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # 设置路径
        if self.UPLOAD_DIR is None:
            self.UPLOAD_DIR = self.BASE_DIR / "uploads"
        if self.TEMP_DIR is None:
            self.TEMP_DIR = self.BASE_DIR / "temp"
        
        # 创建必要的目录
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.TEMP_DIR.mkdir(parents=True, exist_ok=True)
        (self.BASE_DIR / "logs").mkdir(parents=True, exist_ok=True)
        (self.BASE_DIR / self.MODEL_CACHE_DIR).mkdir(parents=True, exist_ok=True)
        (self.BASE_DIR / self.RENDER_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def validate_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """验证CORS origins，支持逗号分隔的字符串"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    @field_validator("SUPPORTED_VIDEO_FORMATS", "SUPPORTED_AUDIO_FORMATS", mode="before")
    @classmethod
    def validate_formats(cls, v: Union[str, List[str]]) -> List[str]:
        """验证格式列表，支持逗号分隔的字符串"""
        if isinstance(v, str):
            return [fmt.strip() for fmt in v.split(",") if fmt.strip()]
        return v
    
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """验证日志级别"""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level: {v}")
        return v.upper()
    
    @field_validator("PORT")
    @classmethod
    def validate_port(cls, v: int) -> int:
        """验证端口号"""
        if not 1 <= v <= 65535:
            raise ValueError(f"Port must be between 1 and 65535")
        return v


# 创建全局配置实例
settings = Settings()
