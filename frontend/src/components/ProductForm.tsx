import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Tooltip,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { Plus, Edit, Save, X, Star, ArrowUp } from 'lucide-react'
import { Product, ProductCreate, ProductUpdate } from '../types/product'
import { productApi } from '../services/api'

interface ProductFormProps {
  mode: 'create' | 'edit'
  product?: Product
  onSuccess: () => void
  trigger?: React.ReactNode
}

export default function ProductForm({ mode, product, onSuccess, trigger }: ProductFormProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Form state
  const [formData, setFormData] = useState<ProductCreate>({
    title: '',
    description: '',
    price: 0,
    discount_percentage: 0,
    category: '',
    brand: '',
    rating: 0,
    stock: 0,
    thumbnail: '',
    images: '',
  })

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof ProductCreate, string>>>({})

  // Load categories and brands on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productApi.getCategories(),
          productApi.getBrands(),
        ])
        setCategories(categoriesData)
        setBrands(brandsData)
      } catch (error) {
        console.error('Failed to load form data:', error)
      }
    }
    loadData()
  }, [])

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        discount_percentage: product.discount_percentage,
        category: product.category,
        brand: product.brand || '',
        rating: product.rating,
        stock: product.stock,
        thumbnail: product.thumbnail,
        images: Array.isArray(product.images) ? product.images.join(', ') : product.images || '',
      })
    }
  }, [mode, product])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductCreate, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (formData.discount_percentage && (formData.discount_percentage < 0 || formData.discount_percentage > 100)) {
      newErrors.discount_percentage = 'Discount must be between 0 and 100'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      console.log('Submitting product data:', formData)
      console.log('Form data type:', typeof formData)
      console.log('Images field type:', typeof formData.images)
      console.log('Images field value:', formData.images)

      if (mode === 'create') {
        await productApi.createProduct(formData)
        toast({
          title: 'Product created successfully',
          description: 'The product has been added to your catalog.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        if (product) {
          // Clean up the data for update - remove undefined and null values
          const cleanData: any = {}
          Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              cleanData[key] = value
            }
          })
          const updateData: ProductUpdate = cleanData
          console.log('Clean update data:', updateData)
          await productApi.updateProduct(product.id, updateData)
          toast({
            title: 'Product updated successfully',
            description: 'The product has been updated.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
        }
      }
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      toast({
        title: mode === 'create' ? 'Failed to create product' : 'Failed to update product',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      discount_percentage: 0,
      category: '',
      brand: '',
      rating: 0,
      stock: 0,
      thumbnail: '',
      images: '',
    })
    setErrors({})
  }

  const handleInputChange = (field: keyof ProductCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImagesChange = (value: string) => {
    handleInputChange('images', value)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setShowScrollTop(target.scrollTop > 100)
  }

  const scrollToTop = () => {
    const modalBody = document.querySelector('[data-modal-body]') as HTMLElement
    if (modalBody) {
      modalBody.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {trigger ? (
        <Box onClick={onOpen}>{trigger}</Box>
      ) : (
        <Button
          leftIcon={mode === 'create' ? <Plus size={16} /> : <Edit size={16} />}
          onClick={onOpen}
          colorScheme="primary"
          size="sm"
        >
          {mode === 'create' ? 'Add Product' : 'Edit'}
        </Button>
      )}

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "2xl" }}
        scrollBehavior="inside"
        isCentered
        closeOnOverlayClick={true}
        blockScrollOnMount={false}
        returnFocusOnClose={true}
      >
        <ModalOverlay bg="rgba(0, 0, 0, 0.6)" />
        <ModalContent 
          bg={bgColor} 
          borderColor={borderColor} 
          maxH="90vh"
          mx={4}
          my={8}
          boxShadow="2xl"
          borderRadius="xl"
        >
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                {mode === 'create' ? 'Create New Product' : 'Edit Product'}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Scroll down to see all form fields
              </Text>
            </VStack>
          </ModalHeader>

          <form onSubmit={handleSubmit}>
            <ModalBody 
              overflowY="auto" 
              maxH={{ base: "calc(100vh - 200px)", md: "calc(90vh - 140px)" }}
              px={{ base: 4, md: 6 }}
              pb={6}
              onScroll={handleScroll}
              data-modal-body
            >
              <VStack spacing={4} align="stretch">
                {/* Title */}
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>Title *</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter product title"
                  />
                  <FormErrorMessage>{errors.title}</FormErrorMessage>
                </FormControl>

                {/* Description */}
                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Description *</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </FormControl>

                {/* Price and Discount */}
                <HStack spacing={4}>
                  <FormControl isInvalid={!!errors.price}>
                    <FormLabel>Price *</FormLabel>
                    <NumberInput
                      value={formData.price}
                      onChange={(_, value) => handleInputChange('price', value)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.price}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.discount_percentage}>
                    <FormLabel>Discount (%)</FormLabel>
                    <NumberInput
                      value={formData.discount_percentage}
                      onChange={(_, value) => handleInputChange('discount_percentage', value)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.discount_percentage}</FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Category and Brand */}
                <HStack spacing={4}>
                  <FormControl isInvalid={!!errors.category}>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Select category"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.category}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Select brand"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                {/* Rating and Stock */}
                <HStack spacing={4}>
                  <FormControl isInvalid={!!errors.rating}>
                    <FormLabel>Rating</FormLabel>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={1}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <IconButton
                            key={star}
                            aria-label={`Rate ${star} stars`}
                            icon={<Star size={20} />}
                            variant="ghost"
                            size="sm"
                            color={star <= (formData.rating || 0) ? "yellow.400" : "gray.300"}
                            _hover={{ color: "yellow.400" }}
                            onClick={() => handleInputChange('rating', star)}
                          />
                        ))}
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Click on the stars to set the rating (0-5)
                      </Text>
                    </VStack>
                    <FormErrorMessage>{errors.rating}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.stock}>
                    <FormLabel>Stock</FormLabel>
                    <NumberInput
                      value={formData.stock}
                      onChange={(_, value) => handleInputChange('stock', value)}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.stock}</FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Thumbnail */}
                <FormControl>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    placeholder="Enter thumbnail URL"
                  />
                </FormControl>

                                {/* Images */}
                <FormControl>
                  <FormLabel>Image URLs (comma-separated)</FormLabel>
                  <Input
                    value={formData.images || ''}
                    onChange={(e) => handleImagesChange(e.target.value)}
                    placeholder="Enter image URLs separated by commas"
                  />
                  {formData.images && formData.images.trim() !== '' && (
                    <HStack mt={2} wrap="wrap">
                      {formData.images.split(',').map((img, index) => (
                        <Badge key={index} colorScheme="primary" variant="subtle">
                          {img.trim()}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </FormControl>
               
               {/* Scroll Indicator */}
               <Box textAlign="center" py={2}>
                 <Text fontSize="xs" color="gray.400">
                   {showScrollTop ? '↑ Scroll to top' : '↓ Scroll for more fields'}
                 </Text>
               </Box>
             </VStack>
           </ModalBody>

            <ModalFooter borderTopWidth="1px" borderColor={borderColor} bg={bgColor}>
              <HStack spacing={3} w="full" justify="space-between">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="primary"
                  isLoading={isLoading}
                  loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
                  leftIcon={mode === 'create' ? <Plus size={16} /> : <Save size={16} />}
                >
                  {mode === 'create' ? 'Create Product' : 'Update Product'}
                </Button>
              </HStack>
            </ModalFooter>
          </form>
                  </ModalContent>
          
          {/* Scroll to Top Button */}
          {showScrollTop && (
            <Box position="fixed" bottom="120px" right="50%" transform="translateX(50%)" zIndex={1500}>
              <Tooltip label="Scroll to top" placement="top">
                <IconButton
                  aria-label="Scroll to top"
                  icon={<ArrowUp size={16} />}
                  colorScheme="primary"
                  variant="solid"
                  size="md"
                  onClick={scrollToTop}
                  shadow="lg"
                  _hover={{ transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                />
              </Tooltip>
            </Box>
          )}
        </Modal>
      </>
  )
} 