export interface Product {
  id: number
  title: string
  description: string
  price: number
  discount_percentage: number
  discounted_price: number
  category: string
  brand: string
  rating: number
  stock: number
  thumbnail: string
  images: string[]
  external_id?: number
  external_source?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  size: number
  pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ProductFilter {
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  max_rating?: number
  in_stock?: boolean
  search?: string
}

export interface ProductSort {
  sort_by: string
  sort_order: 'asc' | 'desc'
}

export interface ProductPagination {
  page: number
  size: number
}

export interface ProductCreate {
  title: string
  description: string
  price: number
  discount_percentage?: number
  category: string
  brand?: string
  rating?: number
  stock: number
  thumbnail?: string
  images?: string[]
}

export interface ProductUpdate {
  title?: string
  description?: string
  price?: number
  discount_percentage?: number
  category?: string
  brand?: string
  rating?: number
  stock?: number
  thumbnail?: string
  images?: string[]
  is_active?: boolean
} 