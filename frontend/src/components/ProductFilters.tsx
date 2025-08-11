import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  IconButton,
  Collapse,
  useDisclosure,
  Divider,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react'
import { X, Sliders } from 'lucide-react'
import { ProductFilter } from '../types/product'

interface ProductFiltersProps {
  filters: ProductFilter
  onFiltersChange: (filters: ProductFilter) => void
  categories: string[]
  brands: string[]
  priceRange?: { min: number; max: number }
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  brands,
  priceRange,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilter>(filters)
  const { isOpen, onToggle } = useDisclosure()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const clearFilters = () => {
         const clearedFilters: ProductFilter = {
       search: '',
       category: '',
       brand: '',
       min_price: undefined,
       max_price: undefined,
       min_rating: undefined,
       in_stock: undefined,
     }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== false && value !== 0
  )

  return (
    <Box borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
      <Box p={4} pb={3} borderBottomWidth="1px" borderColor={borderColor}>
        <HStack justify="space-between">
          <Heading size="md">Filters & Search</Heading>
          <IconButton
            aria-label="Toggle filters"
            icon={<Sliders size={16} />}
            size="sm"
            variant="outline"
            onClick={onToggle}
          />
        </HStack>
      </Box>
      
      <Box p={4} pt={0}>
        {/* Search Bar */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">
              Search Products
            </FormLabel>
            <Input
              placeholder="Search by title, description, or brand..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size="md"
            />
          </FormControl>

          <Collapse in={isOpen} animateOpacity>
            <VStack spacing={4} align="stretch" pt={2}>
              <Divider />
              
              {/* Category and Brand */}
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Category
                  </FormLabel>
                  <Select
                    placeholder="All Categories"
                    value={localFilters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    size="md"
                    isDisabled={categories.length === 0}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Brand
                  </FormLabel>
                  <Select
                    placeholder="All Brands"
                    value={localFilters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    size="md"
                    isDisabled={brands.length === 0}
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Price Range */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Price Range
                </FormLabel>
                <HStack spacing={3}>
                  <NumberInput
                    min={0}
                    max={priceRange?.max || 1000}
                    value={localFilters.min_price || ''}
                    onChange={(value) => handleFilterChange('min_price', value)}
                    size="md"
                  >
                    <NumberInputField placeholder="Min" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  
                  <Text fontSize="sm" color="gray.500">
                    to
                  </Text>
                  
                  <NumberInput
                    min={0}
                    max={priceRange?.max || 1000}
                    value={localFilters.max_price || ''}
                    onChange={(value) => handleFilterChange('max_price', value)}
                    size="md"
                  >
                    <NumberInputField placeholder="Max" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </FormControl>
            </VStack>
          </Collapse>

          {/* Action Buttons */}
          <HStack spacing={3} pt={2}>
            <Button
              colorScheme="primary"
              onClick={applyFilters}
              size="md"
              flex={1}
            >
              Apply Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                size="md"
                leftIcon={<X size={16} />}
              >
                Clear All
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
} 