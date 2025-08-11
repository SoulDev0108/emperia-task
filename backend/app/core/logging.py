import logging
import sys
from pathlib import Path
from typing import Any, Dict

from .config import get_settings

settings = get_settings()


def setup_logging() -> None:
        
    if settings.log_file:
        log_path = Path(settings.log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
    
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )
    
    if settings.log_file:
        file_handler = logging.FileHandler(settings.log_file)
        file_handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        )
        logging.getLogger().addHandler(file_handler)
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("aiohttp").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_request_info(request_id: str, method: str, url: str, **kwargs) -> None:
    logger = get_logger("request")
    logger.info(
        f"Request processed - ID: {request_id}, Method: {method}, URL: {url}, "
        f"Additional: {kwargs}"
    )


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    logger = get_logger("error")
    logger.error(
        f"Error occurred - Type: {type(error).__name__}, Message: {str(error)}, "
        f"Context: {context or {}}",
        exc_info=True
    )


def log_database_operation(operation: str, table: str, **kwargs) -> None:
    logger = get_logger("database")
    logger.info(
        f"Database operation - Operation: {operation}, Table: {table}, "
        f"Additional: {kwargs}"
    )


def log_external_api_call(api_name: str, endpoint: str, **kwargs) -> None:
    logger = get_logger("external_api")
    logger.info(
        f"External API call - API: {api_name}, Endpoint: {endpoint}, "
        f"Additional: {kwargs}"
    ) 