from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.logging import get_logger, log_request_info
from ...schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductFilter,
    ProductSort,
    ProductPagination
)
from ...services.product_service import ProductService

logger = get_logger(__name__)
router = APIRouter(prefix="/products", tags=["products"])


@router.post(
    "/", 
    response_model=ProductResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product with the provided details. All required fields must be provided.",
    response_description="Product created successfully"
)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new product.
    
    **Example Request:**
    ```json
    {
        "title": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "brand": "Apple",
        "stock": 50,
        "thumbnail": "https://example.com/iphone15.jpg",
        "images": [
            "https://example.com/iphone15_1.jpg",
            "https://example.com/iphone15_2.jpg"
        ]
    }
    ```
    
    **Example Response:**
    ```json
    {
        "id": 1,
        "title": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "discount_percentage": null,
        "category": "Electronics",
        "brand": "Apple",
        "rating": null,
        "stock": 50,
        "thumbnail": "https://example.com/iphone15.jpg",
        "images": [
            "https://example.com/iphone15_1.jpg",
            "https://example.com/iphone15_2.jpg"
        ],
        "external_id": null,
        "external_source": null,
        "is_active": true,
        "discounted_price": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
    ```
    """
    try:
        service = ProductService(db)
        product = await service.create_product(product_data)
        
        log_request_info(
            request_id=f"create_{product['id']}",
            method="POST",
            url="/products",
            product_id=product['id']
        )
        
        return product
    except Exception as e:
        logger.error(f"Failed to create product - Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/", 
    response_model=ProductListResponse,
    summary="Get products with filtering, sorting, and pagination",
    description="Retrieve a paginated list of products with optional filtering and sorting capabilities.",
    response_description="Paginated list of products"
)
async def get_products(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get products with filtering, sorting, and pagination.
    
    **Example Request:**
    ```
    GET /api/v1/products?category=Electronics&brand=Apple&min_price=100&max_price=1000&sort_by=price&sort_order=desc&page=1&size=12
    ```
    
    **Example Response:**
    ```json
    {
        "products": [
            {
                "id": 1,
                "title": "iPhone 15 Pro",
                "description": "Latest iPhone with advanced features",
                "price": 999.99,
                "discount_percentage": 10.0,
                "category": "Electronics",
                "brand": "Apple",
                "rating": 4.8,
                "stock": 50,
                "thumbnail": "https://example.com/iphone15.jpg",
                "images": ["https://example.com/iphone15_1.jpg"],
                "external_id": null,
                "external_source": null,
                "is_active": true,
                "discounted_price": 899.99,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        ],
        "total": 1,
        "page": 1,
        "size": 12,
        "pages": 1,
        "has_next": false,
        "has_prev": false
    }
    ```
    
    **Available Filters:**
    - `category`: Filter by product category
    - `brand`: Filter by product brand
    - `min_price`/`max_price`: Price range filter
    - `min_rating`/`max_rating`: Rating range filter (0-5)
    - `in_stock`: Filter by stock availability
    - `search`: Text search across title, description, category, and brand
    
    **Available Sort Fields:**
    - `id`, `title`, `price`, `rating`, `stock`, `created_at`, `updated_at`
    
    **Pagination:**
    - `page`: Page number (starts from 1)
    - `size`: Items per page (max 100)
    """
    try:
        # Extract query parameters manually
        query_params = dict(request.query_params)
        
        # Get parameters with defaults
        category = query_params.get('category')
        brand = query_params.get('brand')
        min_price = float(query_params.get('min_price')) if query_params.get('min_price') else None
        max_price = float(query_params.get('max_price')) if query_params.get('max_price') else None
        min_rating = float(query_params.get('min_rating')) if query_params.get('min_rating') else None
        max_rating = float(query_params.get('max_rating')) if query_params.get('max_rating') else None
        in_stock = query_params.get('in_stock')
        if in_stock is not None:
            in_stock = in_stock.lower() in ('true', '1', 'yes', 'on')
        search = query_params.get('search')
        
        sort_by = query_params.get('sort_by', 'id')
        sort_order = query_params.get('sort_order', 'desc')
        
        page = int(query_params.get('page', 1))
        size = int(query_params.get('size', 20))
        
        # Debug: Log the received parameters
        logger.info(f"Received parameters - sort_by: {sort_by} (type: {type(sort_by)}), sort_order: {sort_order} (type: {type(sort_order)})")
        logger.info(f"Pagination - page: {page} (type: {type(page)}), size: {size} (type: {type(size)})")
        logger.info(f"Filters - category: {category}, brand: {brand}, min_price: {min_price}, max_price: {max_price}")
        
        # Build filter object - schema validators will handle empty values
        filters = ProductFilter(
            category=category,
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            max_rating=max_rating,
            in_stock=in_stock,
            search=search
        )
        
        # Build sort object - schema validators will handle empty values
        sort = ProductSort(sort_by=sort_by, sort_order=sort_order)
        
        # Build pagination object - schema validators will handle empty values
        pagination = ProductPagination(page=page, size=size)
        
        service = ProductService(db)
        result = await service.get_products(filters, sort, pagination)
        
        log_request_info(
            request_id=f"list_{page}_{size}",
            method="GET",
            url="/products",
            filters=filters.dict(),
            total=result.total
        )
        
        return result
    except Exception as e:
        logger.error(f"Failed to get products - Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/{product_id}", 
    response_model=ProductResponse,
    summary="Get a specific product by ID",
    description="Retrieve detailed information about a specific product using its unique ID.",
    response_description="Product details"
)
async def get_product(
    product_id: int = Path(..., description="Unique product identifier", example=1),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific product by ID.
    
    **Example Request:**
    ```
    GET /api/v1/products/1
    ```
    
    **Example Response:**
    ```json
    {
        "id": 1,
        "title": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "discount_percentage": 10.0,
        "category": "Electronics",
        "brand": "Apple",
        "rating": 4.8,
        "stock": 50,
        "thumbnail": "https://example.com/iphone15.jpg",
        "images": [
            "https://example.com/iphone15_1.jpg",
            "https://example.com/iphone15_2.jpg"
        ],
        "external_id": null,
        "external_source": null,
        "is_active": true,
        "discounted_price": 899.99,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
    ```
    
    **Error Responses:**
    - `404 Not Found`: Product with the specified ID does not exist
    - `500 Internal Server Error`: Server error occurred
    """
    try:
        service = ProductService(db)
        product = await service.get_product(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        log_request_info(
            request_id=f"get_{product_id}",
            method="GET",
            url=f"/products/{product_id}"
        )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get product - Product ID: {product_id}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{product_id}", 
    response_model=ProductResponse,
    summary="Update an existing product",
    description="Update an existing product's information. Only provided fields will be updated.",
    response_description="Updated product details"
)
async def update_product(
    product_id: int = Path(..., description="Unique product identifier", example=1),
    product_data: ProductUpdate = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing product.
    
    **Example Request:**
    ```json
    {
        "title": "iPhone 15 Pro Max",
        "price": 1099.99,
        "stock": 75,
        "discount_percentage": 15.0
    }
    ```
    
    **Example Response:**
    ```json
    {
        "id": 1,
        "title": "iPhone 15 Pro Max",
        "description": "Latest iPhone with advanced features",
        "price": 1099.99,
        "discount_percentage": 15.0,
        "category": "Electronics",
        "brand": "Apple",
        "rating": 4.8,
        "stock": 75,
        "thumbnail": "https://example.com/iphone15.jpg",
        "images": ["https://example.com/iphone15_1.jpg"],
        "external_id": null,
        "external_source": null,
        "is_active": true,
        "discounted_price": 934.99,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T11:45:00Z"
    }
    ```
    
    **Notes:**
    - Only provided fields will be updated
    - `updated_at` timestamp is automatically updated
    - `discounted_price` is calculated automatically if `discount_percentage` is provided
    
    **Error Responses:**
    - `404 Not Found`: Product with the specified ID does not exist
    - `500 Internal Server Error`: Server error occurred
    """
    try:
        service = ProductService(db)
        product = await service.update_product(product_id, product_data)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        log_request_info(
            request_id=f"update_{product_id}",
            method="PUT",
            url=f"/products/{product_id}"
        )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update product - Product ID: {product_id}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete(
    "/{product_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Permanently delete a product from the system. This action cannot be undone.",
    response_description="Product deleted successfully"
)
async def delete_product(
    product_id: int = Path(..., description="Unique product identifier", example=1),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a product.
    
    **Example Request:**
    ```
    DELETE /api/v1/products/1
    ```
    
    **Example Response:**
    ```
    HTTP 204 No Content
    (No response body)
    ```
    
    **Notes:**
    - This action permanently removes the product
    - Cannot be undone
    - Returns 204 No Content on success
    
    **Error Responses:**
    - `404 Not Found`: Product with the specified ID does not exist
    - `500 Internal Server Error`: Server error occurred
    """
    try:
        service = ProductService(db)
        success = await service.delete_product(product_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        log_request_info(
            request_id=f"delete_{product_id}",
            method="DELETE",
            url=f"/products/{product_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete product - Product ID: {product_id}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/categories/list", 
    response_model=list[str],
    summary="Get all unique product categories",
    description="Retrieve a list of all unique product categories available in the system.",
    response_description="List of unique product categories"
)
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all unique product categories.
    
    **Example Request:**
    ```
    GET /api/v1/products/categories/list
    ```
    
    **Example Response:**
    ```json
    [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports & Outdoors",
        "Books"
    ]
    ```
    
    **Notes:**
    - Returns only active product categories
    - Categories are sorted alphabetically
    - Empty array if no categories exist
    """
    try:
        service = ProductService(db)
        categories = await service.get_categories()
        
        log_request_info(
            request_id="categories_list",
            method="GET",
            url="/products/categories/list",
            count=len(categories)
        )
        
        return categories
    except Exception as e:
        logger.error(f"Failed to get categories - Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/brands/list", 
    response_model=list[str],
    summary="Get all unique product brands",
    description="Retrieve a list of all unique product brands available in the system.",
    response_description="List of unique product brands"
)
async def get_brands(db: AsyncSession = Depends(get_db)):
    """
    Get all unique product brands.
    
    **Example Request:**
    ```
    GET /api/v1/products/brands/list
    ```
    
    **Example Response:**
    ```json
    [
        "Apple",
        "Samsung",
        "Nike",
        "Adidas",
        "Sony",
        "Microsoft"
    ]
    ```
    
    **Notes:**
    - Returns only brands from active products
    - Brands are sorted alphabetically
    - Null brands are excluded
    - Empty array if no brands exist
    """
    try:
        service = ProductService(db)
        brands = await service.get_brands()
        
        log_request_info(
            request_id="brands_list",
            method="GET",
            url="/products/brands/list",
            count=len(brands)
        )
        
        return brands
    except Exception as e:
        logger.error(f"Failed to get brands - Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/price-range", 
    response_model=dict[str, float],
    summary="Get minimum and maximum product prices",
    description="Retrieve the minimum and maximum product prices across all active products.",
    response_description="Price range with min and max values"
)
async def get_price_range(db: AsyncSession = Depends(get_db)):
    """
    Get minimum and maximum product prices.
    
    **Example Request:**
    ```
    GET /api/v1/products/price-range
    ```
    
    **Example Response:**
    ```json
    {
        "min_price": 9.99,
        "max_price": 2499.99
    }
    ```
    
    **Notes:**
    - Only considers active products
    - Returns null values if no products exist
    - Useful for setting price filter ranges in UI
    """
    try:
        service = ProductService(db)
        price_range = await service.get_price_range()
        
        log_request_info(
            request_id="price_range",
            method="GET",
            url="/products/price-range"
        )
        
        return price_range
    except Exception as e:
        logger.error(f"Failed to get price range - Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post(
    "/sync/{source}", 
    response_model=dict,
    summary="Sync products from external API",
    description="Synchronize products from external APIs (DummyJSON or FakeStore) to keep the local database updated.",
    response_description="Sync operation results"
)
async def sync_products(
    source: str = Path(..., description="External API source", example="dummy"),
    db: AsyncSession = Depends(get_db)
):
    """
    Sync products from external API.
    
    **Example Request:**
    ```
    POST /api/v1/products/sync/dummy
    ```
    
    **Example Response:**
    ```json
    {
        "message": "Products synchronized successfully",
        "synced_count": 25,
        "updated_count": 3,
        "source": "dummy",
        "timestamp": "2024-01-15T12:00:00Z"
    }
    ```
    
    **Available Sources:**
    - `dummy`: DummyJSON API (https://dummyjson.com/products)
    - `fakestore`: FakeStore API (https://fakestoreapi.com/products)
    
    **Notes:**
    - New products are added to the database
    - Existing products (by external_id) are updated
    - Sync process may take several seconds for large datasets
    - Products are marked with their external source for tracking
    
    **Error Responses:**
    - `400 Bad Request`: Invalid source specified
    - `500 Internal Server Error`: Sync operation failed
    """
    try:
        if source not in ["dummy", "fakestore"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source must be 'dummy' or 'fakestore'"
            )
        
        service = ProductService(db)
        result = await service.sync_from_external_api(source)
        
        log_request_info(
            request_id=f"sync_{source}",
            method="POST",
            url=f"/products/sync/{source}",
            synced_count=result["synced_count"],
            updated_count=result["updated_count"]
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to sync products - Source: {source}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 