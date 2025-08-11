import asyncio
import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import init_db, close_db, get_sync_database_url
from app.services.product_service import ProductService
from app.core.database import AsyncSessionLocal
from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger

settings = get_settings()
setup_logging()
logger = get_logger(__name__)


async def seed_database():
    try:
        logger.info("Starting database seeding process")
        
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Create database session
        async with AsyncSessionLocal() as session:
            service = ProductService(session)
            
            # Sync products from DummyJSON API
            logger.info("Syncing products from DummyJSON API")
            dummy_result = await service._sync_from_dummy_api()
            logger.info(f"DummyJSON sync completed - {dummy_result}")
            
            # Get total products count
            products, total = await service.repository.get_all()
            logger.info(f"Database seeding completed - Total products: {total}")
            
            return {
                "dummy_sync": dummy_result,
                "total_products": total
            }
            
    except Exception as e:
        logger.error(f"Database seeding failed - Error: {str(e)}")
        raise
    finally:
        await close_db()


async def main():
    """Main function to run the seeding process."""
    try:
        result = await seed_database()
        print("✅ Database seeding completed successfully!")
        print(f"📊 Total products: {result['total_products']}")
        print(f"🔄 DummyJSON: {result['dummy_sync']['synced_count']} new, {result['dummy_sync']['updated_count']} updated")
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main()) 