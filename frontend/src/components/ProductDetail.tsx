import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Spinner,
  Heading,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Center,
  useToast,
  Grid,
} from '@chakra-ui/react'
import { ArrowLeft, Edit, Trash2, Star, Heart, ShoppingCart, Share2 } from 'lucide-react'
import { productApi } from '../services/api'
import ProductForm from './ProductForm'
import DeleteProduct from './DeleteProduct'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const primaryColor = useColorModeValue('primary.500', 'primary.400')

  const productId = parseInt(id || '0')

  const {
    data: product,
    isLoading,
    error,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleProductSuccess = async () => {
    setIsRefreshing(true)
    try {
      await refetchProduct()
      toast({
        title: 'Product updated successfully',
        description: 'The product has been refreshed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to refresh product',
        description: 'Please refresh the page manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteSuccess = () => {
    toast({
      title: 'Product deleted successfully',
      description: 'Redirecting to product list...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setTimeout(() => navigate('/'), 2000)
  }

  const handleLike = () => setIsLiked(!isLiked)
  const handleAddToCart = () => setIsInCart(!isInCart)
  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied!',
        description: 'Product link has been copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  if (isLoading || isRefreshing) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color={primaryColor} thickness="4px" />
      </Center>
    )
  }

  if (error || !product) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Text color="red.600" fontSize="lg">Product not found</Text>
          <Button
            onClick={() => navigate('/')}
            colorScheme="primary"
          >
            Back to Products
          </Button>
        </VStack>
      </Center>
    )
  }

  const images = product.images || [product.thumbnail]

  return (
    <Box minH="100vh">
      {/* Header */}
      <Box bg={bgColor} borderBottomWidth="1px" borderColor={borderColor}>
        <Container maxW="container.xl" py={4}>
          <HStack justify="space-between" align="center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              leftIcon={<ArrowLeft size={20} />}
              color={mutedTextColor}
              _hover={{ color: textColor }}
            >
              Back to Products
            </Button>

            <HStack spacing={3}>
              <ProductForm
                mode="edit"
                product={product}
                onSuccess={handleProductSuccess}
                trigger={
                  <Button
                    leftIcon={<Edit size={16} />}
                    colorScheme="primary"
                    variant="outline"
                    size="md"
                  >
                    Edit Product
                  </Button>
                }
              />

              <DeleteProduct
                product={product}
                onSuccess={handleDeleteSuccess}
                trigger={
                  <Button
                    leftIcon={<Trash2 size={16} />}
                    colorScheme="red"
                    variant="outline"
                    size="md"
                  >
                    Delete Product
                  </Button>
                }
              />
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Product Content */}
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
          {/* Product Images */}
          <VStack spacing={4} align="stretch">
            {/* Main Image */}
            <Box
              aspectRatio={1}
              bg={bgColor}
              borderRadius="lg"
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Image
                src={images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.title}
                w="full"
                h="full"
                objectFit="cover"
                fallbackSrc="/placeholder-product.jpg"
              />
            </Box>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <SimpleGrid columns={4} spacing={2}>
                {images.map((image: string, index: number) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    variant="outline"
                    p={0}
                    h="auto"
                    minH="80px"
                    borderColor={selectedImage === index ? primaryColor : borderColor}
                    borderWidth={selectedImage === index ? '2px' : '1px'}
                    _hover={{ borderColor: primaryColor }}
                  >
                    <Image
                      src={image || '/placeholder-product.jpg'}
                      alt={`${product.title} ${index + 1}`}
                      w="full"
                      h="full"
                      objectFit="cover"
                      fallbackSrc="/placeholder-product.jpg"
                    />
                  </Button>
                ))}
              </SimpleGrid>
            )}
          </VStack>

          {/* Product Info */}
          <VStack spacing={6} align="stretch">
            {/* Title and Rating */}
            <Box>
              <Heading size="lg" fontWeight="bold" color={textColor} mb={2}>
                {product.title}
              </Heading>
                             <HStack spacing={4}>
                 <HStack>
                   <HStack spacing={1}>
                     {[1, 2, 3, 4, 5].map((star) => (
                       <Star
                         key={star}
                         size={20}
                         color={star <= product.rating ? "yellow.400" : "gray.300"}
                         fill={star <= product.rating ? "currentColor" : "none"}
                       />
                     ))}
                   </HStack>
                   <Text fontSize="lg" fontWeight="medium" color={textColor}>
                     {product.rating.toFixed(1)}
                   </Text>
                   <Text fontSize="sm" color={mutedTextColor}>
                     ({product.stock} reviews)
                   </Text>
                 </HStack>
                 <Text fontSize="sm" color={mutedTextColor}>
                   SKU: {product.id}
                 </Text>
               </HStack>
            </Box>

            {/* Price */}
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color={primaryColor}>
                ${product.price}
              </Text>
              {product.discount_percentage > 0 && (
                <HStack spacing={2} mt={2}>
                  <Text fontSize="lg" color="gray.500" textDecoration="line-through">
                    ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                  </Text>
                  <Badge colorScheme="red" variant="solid" fontSize="sm">
                    {product.discount_percentage}% OFF
                  </Badge>
                </HStack>
              )}
            </Box>

            {/* Description */}
            <Box>
              <Heading size="md" fontWeight="semibold" color={textColor} mb={2}>
                Description
              </Heading>
              <Text color="gray.600" fontSize="md">
                {product.description}
              </Text>
            </Box>

            {/* Product Details */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>Category</Text>
                <Text fontSize="md" color={textColor} textTransform="capitalize">
                  {product.category}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>Brand</Text>
                <Text fontSize="md" color={textColor} textTransform="capitalize">
                  {product.brand}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>Stock</Text>
                <Text fontSize="md" fontWeight="medium" color={product.stock > 0 ? 'green.600' : 'red.600'}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>Condition</Text>
                <Text fontSize="md" color={textColor}>New</Text>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <VStack spacing={3} align="stretch">
              <HStack spacing={3}>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  colorScheme={isInCart ? 'green' : 'primary'}
                  isDisabled={product.stock === 0}
                  w="full"
                  py={6}
                  px={12}
                  borderRadius="lg"
                  fontWeight="medium"
                  transition="all 0.2s"
                  _hover={{ opacity: 0.9 }}
                >
                  <ShoppingCart size={20} />
                  <Text>
                    {isInCart ? 'Added to Cart' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Text>
                </Button>
              </HStack>

              <HStack spacing={3}>
                <Button
                  onClick={handleLike}
                  variant="outline"
                  colorScheme={isLiked ? 'red' : 'gray'}
                  w="full"
                  py={6}
                  px={12}
                  borderRadius="lg"
                  fontWeight="medium"
                  transition="all 0.2s"
                  _hover={{ bg: isLiked ? 'red.50' : 'gray.100' }}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  <Text>{isLiked ? 'Liked' : 'Like'}</Text>
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  colorScheme="gray"
                  w="full"
                  py={6}
                  px={12}
                  borderRadius="lg"
                  fontWeight="medium"
                  transition="all 0.2s"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Share2 size={20} />
                  <Text>Share</Text>
                </Button>
              </HStack>
            </VStack>

            {/* Additional Info */}
            <Divider borderColor={borderColor} my={6} />
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="sm" color={mutedTextColor}>Free shipping</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={mutedTextColor}>30-day returns</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={mutedTextColor}>Secure checkout</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={mutedTextColor}>24/7 support</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Grid>
      </Container>
    </Box>
  )
} 