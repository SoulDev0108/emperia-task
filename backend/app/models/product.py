from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    Column, 
    Integer, 
    String, 
    Text, 
    Numeric, 
    DateTime, 
    Boolean,
    Index,
    CheckConstraint
)
from sqlalchemy.sql import func

from ..core.database import Base


class Product(Base):
    """Product model for storing product information."""
    
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    discount_percentage = Column(Numeric(5, 2), nullable=True, default=0)
    
    category = Column(String(100), nullable=False, index=True)
    brand = Column(String(100), nullable=True, index=True)
    
    rating = Column(Numeric(3, 2), nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    
    thumbnail = Column(String(500), nullable=True)
    images = Column(Text, nullable=True)
    
    external_id = Column(Integer, nullable=True, unique=True, index=True)
    external_source = Column(String(50), nullable=True, index=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_positive'),
        CheckConstraint('discount_percentage >= 0 AND discount_percentage <= 100', name='check_discount_range'),
        CheckConstraint('rating >= 0 AND rating <= 5', name='check_rating_range'),
        CheckConstraint('stock >= 0', name='check_stock_positive'),
        Index('idx_category_price', 'category', 'price'),
        Index('idx_brand_category', 'brand', 'category'),
        Index('idx_price_rating', 'price', 'rating'),
        Index('idx_search', 'title', 'description', 'category', 'brand'),
    )
    
    def __repr__(self) -> str:
        return f"<Product(id={self.id}, title='{self.title}', price={self.price})>"
    
    @property
    def discounted_price(self) -> Optional[Decimal]:
        if self.discount_percentage and self.discount_percentage > 0:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price
    
    @property
    def image_list(self) -> list:
        if self.images:
            try:
                import json
                return json.loads(self.images)
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': float(self.price) if self.price else None,
            'discount_percentage': float(self.discount_percentage) if self.discount_percentage else None,
            'discounted_price': float(self.discounted_price) if self.discounted_price else None,
            'category': self.category,
            'brand': self.brand,
            'rating': float(self.rating) if self.rating else None,
            'stock': self.stock,
            'thumbnail': self.thumbnail,
            'images': self.image_list,
            'external_id': self.external_id,
            'external_source': self.external_source,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        } 