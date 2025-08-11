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
            
    async def get_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID."""
        try:
            result = await self.session.execute(
                select(Product).where(Product.id == product_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get product by ID - Product ID: {product_id}, Error: {str(e)}")
            raise
    
    async def get_by_external_id(self, external_id: int, source: str) -> Optional[Product]:
        """Get product by external ID and source."""
        try:
            result = await self.session.execute(
                select(Product).where(
                    and_(
                        Product.external_id == external_id,
                        Product.external_source == source
                    )
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f"Failed to get product by external ID - External ID: {external_id}, Source: {source}, Error: {str(e)}"
            )
            raise