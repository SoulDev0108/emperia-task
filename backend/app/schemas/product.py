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

class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100, decimal_places=2)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    rating: Optional[Decimal] = Field(None, ge=0, le=5, decimal_places=2)
    stock: Optional[int] = Field(None, ge=0)
    thumbnail: Optional[str] = Field(None, max_length=500)
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    
    @validator('images')
    def validate_images(cls, v):
        """Validate image URLs."""
        if v is not None:
            for url in v:
                if not url.startswith(('http://', 'https://')):
                    raise ValueError('Image URLs must be valid HTTP/HTTPS URLs')
        return v

class ProductFilter(BaseModel):
    """Schema for product filtering parameters."""
    
    category: Optional[str] = Field(None, description="Filter by category")
    brand: Optional[str] = Field(None, description="Filter by brand")
    min_price: Optional[float] = Field(None, description="Minimum price filter")
    max_price: Optional[float] = Field(None, description="Maximum price filter")
    min_rating: Optional[float] = Field(None, description="Minimum rating filter")
    max_rating: Optional[float] = Field(None, description="Maximum rating filter")
    in_stock: Optional[bool] = Field(None, description="Filter by stock availability")
    search: Optional[str] = Field(None, description="Search in title, description, category, and brand")
    
    @validator('category', 'brand', 'search', pre=True)
    def validate_string_fields(cls, v):
        """Convert empty strings to None for string fields."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return None
        return str(v) if v is not None else None
    
    @validator('min_price', 'max_price', 'min_rating', 'max_rating', pre=True)
    def validate_numeric_fields(cls, v):
        """Convert empty strings to None for numeric fields."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return float(v)
            except (ValueError, TypeError):
                return None
        return None
    
    @validator('in_stock', pre=True)
    def validate_boolean_field(cls, v):
        """Convert empty strings and string booleans to proper boolean or None."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return None
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            if v.lower() in ('true', '1', 'yes', 'on'):
                return True
            elif v.lower() in ('false', '0', 'no', 'off'):
                return False
            else:
                return None
        if isinstance(v, int):
            return bool(v)
        return None
    
    @validator('max_price')
    def validate_price_range(cls, v, values):
        """Validate that max_price is greater than min_price."""
        if v is not None and 'min_price' in values and values['min_price'] is not None:
            if v <= values['min_price']:
                raise ValueError('max_price must be greater than min_price')
        return v
    
    @validator('max_rating')
    def validate_rating_range(cls, v, values):
        """Validate that max_rating is greater than min_rating."""
        if v is not None and 'min_rating' in values and values['min_rating'] is not None:
            if v <= values['min_rating']:
                raise ValueError('max_rating must be greater than min_rating')
        return v


class ProductSort(BaseModel):
    """Schema for product sorting parameters."""
    
    sort_by: str = Field(default="id", description="Field to sort by")
    sort_order: str = Field(default="desc", description="Sort order (asc/desc)")
    
    @validator('sort_by', pre=True)
    def validate_sort_by(cls, v):
        """Convert empty values to default and validate sort field."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return "id"
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return "id"
        return str(v)
    
    @validator('sort_order', pre=True)
    def validate_sort_order(cls, v):
        """Convert empty values to default and validate sort order."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return "desc"
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return "desc"
        return str(v)
    
    @validator('sort_by')
    def validate_sort_field(cls, v):
        """Validate sort field."""
        allowed_fields = {
            'id', 'title', 'price', 'rating', 'stock', 'created_at', 'updated_at'
        }
        if v not in allowed_fields:
            raise ValueError(f'sort_by must be one of: {", ".join(allowed_fields)}')
        return v
    
    @validator('sort_order')
    def validate_sort_order_value(cls, v):
        """Validate sort order value."""
        if v not in ['asc', 'desc']:
            raise ValueError('sort_order must be either "asc" or "desc"')
        return v


class ProductPagination(BaseModel):
    """Schema for pagination parameters."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Page size")
    
    @validator('page', pre=True)
    def validate_page(cls, v):
        """Convert empty values to default and validate page number."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return 1
        if isinstance(v, str):
            try:
                v = int(v)
            except (ValueError, TypeError):
                return 1
        if isinstance(v, (int, float)):
            v = int(v)
            if v < 1:
                return 1
        return v
    
    @validator('size', pre=True)
    def validate_size(cls, v):
        """Convert empty values to default and validate page size."""
        if v is None or v == "" or v == "null" or v == "undefined":
            return 20
        if isinstance(v, str):
            try:
                v = int(v)
            except (ValueError, TypeError):
                return 20
        if isinstance(v, (int, float)):
            v = int(v)
            if v < 1:
                return 20
            if v > 100:
                return 100
        return v
    
    @validator('size')
    def validate_page_size(cls, v):
        """Validate page size."""
        if v > 100:
            raise ValueError('Page size cannot exceed 100')
        return v 