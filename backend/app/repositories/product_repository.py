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

    async def update(self, product_id: int, update_data: dict) -> Optional[Product]:
        """Update an existing product."""
        try:
            product = await self.get_by_id(product_id)
            if not product:
                return None
            
            for field, value in update_data.items():
                if hasattr(product, field):
                    setattr(product, field, value)
            
            await self.session.commit()
            await self.session.refresh(product)
            
            logger.info(f"Product updated - Product ID: {product_id}")
            return product
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Failed to update product - Product ID: {product_id}, Error: {str(e)}")
            raise

    async def delete(self, product_id: int) -> bool:
        """Delete a product."""
        try:
            product = await self.get_by_id(product_id)
            if not product:
                return False
            
            await self.session.delete(product)
            await self.session.commit()
            
            logger.info(f"Product deleted - Product ID: {product_id}")
            return True
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Failed to delete product - Product ID: {product_id}, Error: {str(e)}")
            raise

    async def get_categories(self) -> List[str]:
        """Get all unique product categories."""
        try:
            result = await self.session.execute(
                select(Product.category).distinct().where(Product.is_active == True)
            )
            return [row[0] for row in result.fetchall()]
        except Exception as e:
            logger.error(f"Failed to get categories - Error: {str(e)}")
            raise
    
    async def get_brands(self) -> List[str]:
        """Get all unique product brands."""
        try:
            result = await self.session.execute(
                select(Product.brand).distinct().where(
                    and_(Product.is_active == True, Product.brand.isnot(None))
                )
            )
            return [row[0] for row in result.fetchall()]
        except Exception as e:
            logger.error(f"Failed to get brands - Error: {str(e)}")
            raise
    
    async def get_price_range(self) -> Tuple[Decimal, Decimal]:
        """Get minimum and maximum product prices."""
        try:
            result = await self.session.execute(
                select(
                    func.min(Product.price),
                    func.max(Product.price)
                ).where(Product.is_active == True)
            )
            min_price, max_price = result.fetchone()
            return min_price or Decimal('0'), max_price or Decimal('0')
        except Exception as e:
            logger.error(f"Failed to get price range - Error: {str(e)}")
            raise
    
    def _apply_filters(self, query, count_query, filters: ProductFilter):
        """Apply filters to query."""
        conditions = []
        
        if filters.category:
            conditions.append(Product.category.ilike(f"%{filters.category}%"))
        
        if filters.brand:
            conditions.append(Product.brand.ilike(f"%{filters.brand}%"))
        
        if filters.min_price is not None:
            conditions.append(Product.price >= filters.min_price)
        
        if filters.max_price is not None:
            conditions.append(Product.price <= filters.max_price)
        
        if filters.min_rating is not None:
            conditions.append(Product.rating >= filters.min_rating)
        
        if filters.max_rating is not None:
            conditions.append(Product.rating <= filters.max_rating)
        
        if filters.in_stock is not None:
            if filters.in_stock:
                conditions.append(Product.stock > 0)
            else:
                conditions.append(Product.stock == 0)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            conditions.append(
                or_(
                    Product.title.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.category.ilike(search_term),
                    Product.brand.ilike(search_term)
                )
            )
        
        conditions.append(Product.is_active == True)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        return query, count_query

    def _apply_sorting(self, query, sort: ProductSort):
        """Apply sorting to query."""
        sort_field = getattr(Product, sort.sort_by)
        if sort.sort_order == "desc":
            return query.order_by(desc(sort_field))
        return query.order_by(asc(sort_field))
    
    def _apply_pagination(self, query, pagination: ProductPagination):
        """Apply pagination to query."""
        offset = (pagination.page - 1) * pagination.size
        return query.offset(offset).limit(pagination.size) 