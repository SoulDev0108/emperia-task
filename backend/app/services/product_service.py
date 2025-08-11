import json
import asyncio
from typing import List, Optional, Dict, Any
from decimal import Decimal
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings
from ..core.logging import get_logger, log_external_api_call

settings = get_settings()
logger = get_logger(__name__)


class ProductService:
    """Service for product business logic."""
    
    def __init__(self, session: AsyncSession):
        self.repository = ProductRepository(session)
        self.session = session

    async def sync_from_external_api(self, source: str = "dummy") -> Dict[str, Any]:
        """Sync products from external API."""
        try:
            if source == "dummy":
                return await self._sync_from_dummy_api()
            else:
                raise ValueError(f"Unsupported source: {source}")
        except Exception as e:
            logger.error(f"Failed to sync from external API - Source: {source}, Error: {str(e)}")
            raise
    
    async def _sync_from_dummy_api(self) -> Dict[str, Any]:
        """Sync products from DummyJSON API."""
        try:
            log_external_api_call("DummyJSON", "/products")
            
            async with httpx.AsyncClient(timeout=settings.api_timeout) as client:
                response = await client.get(settings.dummy_api_url)
                response.raise_for_status()
                
                data = response.json()
                products = data.get("products", [])
                
                synced_count = 0
                updated_count = 0
                errors = []
                
                for product_data in products:
                    try:
                        # Check if product already exists
                        existing_product = await self.repository.get_by_external_id(
                            product_data["id"], "dummy"
                        )
                        
                        # Prepare product data with safe field extraction
                        product_dict = {
                            "title": product_data.get("title", "Unknown Title"),
                            "description": product_data.get("description", ""),
                            "price": Decimal(str(product_data.get("price", 0))),
                            "discount_percentage": Decimal(str(product_data.get("discountPercentage", 0))),
                            "category": product_data.get("category", "Uncategorized"),
                            "brand": product_data.get("brand"),  # Can be None
                            "rating": Decimal(str(product_data.get("rating", 0))),
                            "stock": product_data.get("stock", 0),
                            "thumbnail": product_data.get("thumbnail", ""),
                            "images": json.dumps(product_data.get("images", [])),
                            "external_id": product_data["id"],
                            "external_source": "dummy"
                        }
                        
                        # Validate required fields
                        if not product_dict["title"] or product_dict["title"] == "Unknown Title":
                            raise ValueError("Missing or invalid title")
                        
                        if not product_dict["category"] or product_dict["category"] == "Uncategorized":
                            raise ValueError("Missing or invalid category")
                        
                        if existing_product:
                            # Update existing product
                            await self.repository.update(existing_product.id, product_dict)
                            updated_count += 1
                        else:
                            # Create new product
                            await self.repository.create(product_dict)
                            synced_count += 1
                            
                    except Exception as e:
                        errors.append({
                            "external_id": product_data.get("id"),
                            "error": str(e)
                        })
                        logger.warning(f"Failed to sync product {product_data.get('id')} - Error: {str(e)}")
                
                return {
                    "source": "dummy",
                    "total_products": len(products),
                    "synced_count": synced_count,
                    "updated_count": updated_count,
                    "errors": errors
                }
                
        except httpx.RequestError as e:
            logger.error(f"HTTP request failed for DummyJSON API - Error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to sync from DummyJSON API - Error: {str(e)}")
            raise
    
    async def create_product(self, product_data: ProductCreate) -> Dict[str, Any]:
        """Create a new product."""
        try:
            product_dict = product_data.dict()
            
            # Handle images list
            if product_data.images:
                product_dict['images'] = json.dumps(product_data.images)
            
            product = await self.repository.create(product_dict)
            return product.to_dict()
        except Exception as e:
            logger.error(f"Failed to create product - Error: {str(e)}")
            raise

    async def get_product(self, product_id: int) -> Optional[Dict[str, Any]]:
        """Get product by ID."""
        try:
            product = await self.repository.get_by_id(product_id)
            if product:
                return product.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get product - Product ID: {product_id}, Error: {str(e)}")
            raise
    
    async def get_products(
        self,
        filters: Optional[ProductFilter] = None,
        sort: Optional[ProductSort] = None,
        pagination: Optional[ProductPagination] = None
    ) -> ProductListResponse:
        """Get products with filtering, sorting, and pagination."""
        try:
            if not pagination:
                pagination = ProductPagination()
            
            if not sort:
                sort = ProductSort()
            
            products, total = await self.repository.get_all(filters, sort, pagination)
            
            pages = (total + pagination.size - 1) // pagination.size
            has_next = pagination.page < pages
            has_prev = pagination.page > 1
            
            product_dicts = [product.to_dict() for product in products]
            
            return ProductListResponse(
                products=product_dicts,
                total=total,
                page=pagination.page,
                size=pagination.size,
                pages=pages,
                has_next=has_next,
                has_prev=has_prev
            )
        except Exception as e:
            logger.error(f"Failed to get products - Error: {str(e)}")
            raise