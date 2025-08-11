import os
from typing import List, Optional
from pydantic import Field, validator, BaseSettings


class Settings(BaseSettings):
    
    # Application Settings
    app_name: str = Field(default="Product Management API", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="production", env="ENVIRONMENT")
    
    # Server Settings
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    reload: bool = Field(default=False, env="RELOAD")
    
    # Database Settings
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/product_db",
        env="DATABASE_URL"
    )
    database_url_sync: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/product_db",
        env="DATABASE_URL_SYNC"
    )
    database_pool_size: int = Field(default=50, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")
    
    # External API Settings
    dummy_api_url: str = Field(
        default="https://dummyjson.com/products", 
        env="DUMMY_API_URL"
    )
    api_timeout: int = Field(default=30, env="API_TIMEOUT")
    api_retry_attempts: int = Field(default=3, env="API_RETRY_ATTEMPTS")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")
    
    @validator("allowed_origins", "allowed_methods", "allowed_headers", pre=True)
    def parse_list_fields(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.strip("[]").split(",")]
        return v
    
    @validator("database_url", "database_url_sync")
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("Database URL cannot be empty")
        if not v.startswith(("postgresql://", "postgresql+asyncpg://")):
            raise ValueError("Database URL must be a valid PostgreSQL connection string")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings 