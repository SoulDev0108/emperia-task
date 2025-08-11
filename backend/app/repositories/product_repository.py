from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload

from ..models.product import Product
from ..schemas.product import ProductFilter, ProductSort, ProductPagination
from ..core.logging import get_logger

logger = get_logger(__name__)


class ProductRepository:
    """Repository for product database operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, product_data: dict) -> Product:
        """Create a new product."""
        try:
            product = Product(**product_data)
            self.session.add(product)
            await self.session.commit()
            await self.session.refresh(product)
            
            logger.info(f"Product created - Product ID: {product.id}, Title: {product.title}")
            return product
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Failed to create product - Error: {str(e)}")
            raise