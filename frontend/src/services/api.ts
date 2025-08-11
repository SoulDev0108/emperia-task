import { Product, ProductFilter, ProductSort, ProductPagination, ProductListResponse, ProductCreate, ProductUpdate } from '../types/product'

const API_BASE_URL = 'http://localhost:8000/api/v1'

class ProductApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProducts(
    filters?: ProductFilter,
    sort?: ProductSort,
    pagination?: ProductPagination
  ): Promise<ProductListResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    if (sort) {
      if (sort.sort_by) params.append('sort_by', sort.sort_by)
      if (sort.sort_order) params.append('sort_order', sort.sort_order)
    }
    
    if (pagination) {
      params.append('page', String(pagination.page))
      params.append('size', String(pagination.size))
    }

    const queryString = params.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    return this.request<ProductListResponse>(endpoint)
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`)
  }

  async createProduct(productData: ProductCreate): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: number, productData: ProductUpdate): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async getCategories(): Promise<string[]> {
    console.log('Fetching categories from:', `${API_BASE_URL}/products/categories/list`)
    const result = await this.request<string[]>('/products/categories/list')
    console.log('Categories result:', result)
    return result
  }

  async getBrands(): Promise<string[]> {
    console.log('Fetching brands from:', `${API_BASE_URL}/products/brands/list`)
    const result = await this.request<string[]>('/products/brands/list')
    console.log('Brands result:', result)
    return result
  }

  async getPriceRange(): Promise<{ min_price: number; max_price: number }> {
    return this.request<{ min_price: number; max_price: number }>('/products/price-range')
  }

  async syncProducts(source: 'dummy' | 'fakestore'): Promise<any> {
    return this.request(`/products/sync/${source}`, {
      method: 'POST',
    })
  }
}

export const productApi = new ProductApi() 