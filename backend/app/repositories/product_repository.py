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

    async def get_all(
        self,
        filters: Optional[ProductFilter] = None,
        sort: Optional[ProductSort] = None,
        pagination: Optional[ProductPagination] = None
    ) -> Tuple[List[Product], int]:
        """Get all products with filtering, sorting, and pagination."""
        try:
            query = select(Product)
            count_query = select(func.count(Product.id))
            
            if filters:
                query, count_query = self._apply_filters(query, count_query, filters)
            
            total_result = await self.session.execute(count_query)
            total = total_result.scalar()
            
            if sort:
                query = self._apply_sorting(query, sort)
            
            if pagination:
                query = self._apply_pagination(query, pagination)
            
            result = await self.session.execute(query)
            products = result.scalars().all()
            
            logger.info(
                f"Products retrieved - Count: {len(products)}, Total: {total}, Filters: {filters.dict() if filters else None}"
            )
            
            return products, total
        except Exception as e:
            logger.error(f"Failed to get products - Error: {str(e)}")
            raise