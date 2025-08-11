from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Union, Any
from pydantic import BaseModel, Field, validator


class ProductBase(BaseModel):
    """Base product schema with common fields."""
    
    title: str = Field(..., min_length=1, max_length=255, description="Product title")
    description: Optional[str] = Field(None, description="Product description")
    price: Decimal = Field(..., ge=0, decimal_places=2, description="Product price")
    discount_percentage: Optional[Decimal] = Field(
        None, ge=0, le=100, decimal_places=2, description="Discount percentage"
    )
    category: str = Field(..., min_length=1, max_length=100, description="Product category")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    rating: Optional[Decimal] = Field(
        None, ge=0, le=5, decimal_places=2, description="Product rating (0-5)"
    )
    stock: int = Field(..., ge=0, description="Available stock quantity")
    thumbnail: Optional[str] = Field(None, max_length=500, description="Thumbnail image URL")
    images: Optional[List[str]] = Field(None, description="List of product image URLs")
    external_id: Optional[int] = Field(None, description="External API product ID")
    external_source: Optional[str] = Field(None, max_length=50, description="External API source")
    is_active: bool = Field(True, description="Product availability status")


class ProductCreate(ProductBase):    
    @validator('images')
    def validate_images(cls, v):
        if v is not None:
            for url in v:
                if not url.startswith(('http://', 'https://')):
                    raise ValueError('Image URLs must be valid HTTP/HTTPS URLs')
        return v

class ProductResponse(ProductBase):
    """Schema for product response."""
    
    id: int
    discounted_price: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }

class ProductListResponse(BaseModel):
    """Schema for paginated product list response."""
    
    products: List[ProductResponse]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool