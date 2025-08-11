import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  IconButton,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Heading,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Center,
} from '@chakra-ui/react'
import { Grid3X3, List, Plus } from 'lucide-react'
import { productApi } from '../services/api'
import { Product, ProductFilter, ProductSort, ProductPagination } from '../types/product'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import Pagination from '../components/Pagination'

export default function ProductList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<ProductFilter>({
    search: '',
    category: '',
    brand: '',
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    in_stock: undefined,
  })
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)

  const primaryColor = useColorModeValue('primary.500', 'primary.400')

  // Prepare API parameters
  const sortParams: ProductSort = {
    sort_by: sortBy,
    sort_order: sortOrder
  }
  
  const paginationParams: ProductPagination = {
    page: currentPage,
    size: pageSize
  }

  // Fetch products with filters and pagination
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', filters, sortBy, sortOrder, currentPage, pageSize],
    queryFn: () => productApi.getProducts(filters, sortParams, paginationParams),
    placeholderData: (previousData) => previousData,
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories()
  })

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productApi.getBrands()
  })

  // Fetch price range
  const { data: priceRange } = useQuery({
    queryKey: ['priceRange'],
    queryFn: productApi.getPriceRange
  })

  // Handle filter changes
  const handleFiltersChange = (newFilters: ProductFilter) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle sort changes
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle successful product operations
  const handleProductSuccess = () => {
    refetchProducts()
  }

  if (productsError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load products. Please try again.
        </Alert>
      </Container>
    )
  }

  const products = productsData?.products || []
  const totalPages = productsData?.pages || 0
  const hasNext = productsData?.has_next || false
  const hasPrev = productsData?.has_prev || false

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Product Management
          </Heading>
          <Text color="gray.600">
            Manage and browse your product catalog with advanced filtering and search
          </Text>
        </Box>

        {/* Filters and Search */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          brands={brands}
          priceRange={priceRange ? { min: priceRange.min_price, max: priceRange.max_price } : undefined}
        />

        {/* View Controls and Sorting */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          {/* Left side - Create Product and View Mode */}
          <HStack spacing={4}>
            {/* View Mode Toggle */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Grid view"
                icon={<Grid3X3 />}
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                colorScheme="primary"
                onClick={() => setViewMode('grid')}
              />
              <IconButton
                aria-label="List view"
                icon={<List />}
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme="primary"
                onClick={() => setViewMode('list')}
              />
            </HStack>
          </HStack>

          {/* Right side - Sorting */}
          <HStack spacing={4}>
            <Text fontSize="sm" fontWeight="medium">
              Sort by:
            </Text>
            <Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              size="md"
              w="auto"
            >
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="stock">Stock</option>
              <option value="created_at">Date Added</option>
            </Select>
            <Button
              size="md"
              variant="outline"
              onClick={() => handleSortChange(sortBy)}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </HStack>
        </Flex>

        {/* Results Summary */}
        <Flex justify="space-between" align="center">
          <Text color="gray.600">
            Showing {products.length} of {productsData?.total || 0} products
          </Text>
          <Badge colorScheme="primary" variant="subtle">
            Page {currentPage} of {totalPages}
          </Badge>
        </Flex>

        {/* Products Grid/List */}
        {isLoadingProducts ? (
          <Center py={20}>
            <Spinner size="xl" color={primaryColor} thickness="4px" />
          </Center>
        ) : products.length === 0 ? (
          <Box textAlign="center" py={20}>
            <Text fontSize="lg" color="gray.500">
              No products found matching your criteria.
            </Text>
            <Button
              mt={4}
              onClick={() => {
                setFilters({
                  search: '',
                  category: '',
                  brand: '',
                  min_price: undefined,
                  max_price: undefined,
                  min_rating: undefined,
                  in_stock: undefined,
                })
                setCurrentPage(1)
              }}
              colorScheme="primary"
              variant="outline"
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Box>
            {viewMode === 'grid' ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {products.map((product: Product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode="grid" 
                    onRefresh={handleProductSuccess}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <VStack spacing={4} align="stretch">
                {products.map((product: Product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode="list" 
                    onRefresh={handleProductSuccess}
                  />
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box>
            <Divider mb={6} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasNext={hasNext}
              hasPrev={hasPrev}
            />
          </Box>
        )}
      </VStack>
    </Container>
  )
} 