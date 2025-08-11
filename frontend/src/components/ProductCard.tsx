import { Link } from 'react-router-dom'
import {
  Box,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  Flex,
  useColorModeValue,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'
import { MoreVertical, Edit, Trash2, Eye, Star } from 'lucide-react'
import { Product } from '../types/product'
import ProductForm from './ProductForm'
import DeleteProduct from './DeleteProduct'

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
  onRefresh?: () => void
}

export default function ProductCard({ product, viewMode, onRefresh }: ProductCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.900', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const primaryColor = useColorModeValue('primary.500', 'primary.400')

  const handleSuccess = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  if (viewMode === 'list') {
    return (
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="start">
          <HStack spacing={4} flex={1}>
            <Image
              src={product.thumbnail || 'https://via.placeholder.com/80x80?text=No+Image'}
              alt={product.title}
              boxSize="80px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/80x80?text=No+Image"
            />
            
            <VStack align="start" spacing={2} flex={1}>
              <Link to={`/product/${product.id}`}>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color={textColor}
                  _hover={{ color: primaryColor }}
                  transition="color 0.2s"
                >
                  {product.title}
                </Text>
              </Link>
              
              <Text
                fontSize="sm"
                color={mutedTextColor}
                noOfLines={2}
                maxW="400px"
              >
                {product.description}
              </Text>
              
              {/* Rating Display */}
              <HStack spacing={2}>
                <HStack spacing={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color={star <= product.rating ? "yellow.400" : "gray.300"}
                      fill={star <= product.rating ? "currentColor" : "none"}
                    />
                  ))}
                </HStack>
                <Text fontSize="sm" color={mutedTextColor}>
                  {product.rating.toFixed(1)}
                </Text>
              </HStack>
              
              <HStack spacing={3}>
                <Badge colorScheme="primary" variant="subtle">
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge colorScheme="gray" variant="subtle">
                    {product.brand}
                  </Badge>
                )}
                <Badge
                  colorScheme={product.stock > 0 ? 'green' : 'red'}
                  variant="subtle"
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </Badge>
              </HStack>
            </VStack>
          </HStack>

          <VStack align="end" spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color={primaryColor}>
              ${product.price.toFixed(2)}
            </Text>
            
            {product.discount_percentage > 0 && (
              <Badge colorScheme="red" variant="solid">
                -{product.discount_percentage}%
              </Badge>
            )}

            <HStack spacing={2}>
              <Tooltip label="View details" placement="top">
                <IconButton
                  as={Link}
                  to={`/product/${product.id}`}
                  aria-label="View product details"
                  icon={<Eye size={16} />}
                  variant="ghost"
                  size="sm"
                  color={mutedTextColor}
                  _hover={{ color: primaryColor }}
                />
              </Tooltip>

              <ProductForm
                mode="edit"
                product={product}
                onSuccess={handleSuccess}
                trigger={
                  <Tooltip label="Edit product" placement="top">
                    <IconButton
                      aria-label="Edit product"
                      icon={<Edit size={16} />}
                      variant="ghost"
                      size="sm"
                      color={mutedTextColor}
                      _hover={{ color: primaryColor }}
                    />
                  </Tooltip>
                }
              />

              <DeleteProduct
                product={product}
                onSuccess={handleSuccess}
                trigger={
                  <Tooltip label="Delete product" placement="top">
                    <IconButton
                      aria-label="Delete product"
                      icon={<Trash2 size={16} />}
                      variant="ghost"
                      size="sm"
                      color="red.500"
                      _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                    />
                  </Tooltip>
                }
              />
            </HStack>
          </VStack>
        </Flex>
      </Box>
    )
  }

  // Grid view
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Box position="relative">
        <Image
          src={product.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.title}
          width="100%"
          height="200px"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x200?text=No+Image"
        />
        
        {/* Action Menu */}
        <Box position="absolute" top={2} right={2}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Product actions"
              icon={<MoreVertical size={16} />}
              variant="solid"
              size="sm"
              bg="rgba(0, 0, 0, 0.7)"
              color="white"
              _hover={{ bg: 'rgba(0, 0, 0, 0.8)' }}
            />
            <MenuList>
              <MenuItem
                as={Link}
                to={`/product/${product.id}`}
                icon={<Eye size={16} />}
              >
                View Details
              </MenuItem>
              <MenuDivider />
              <ProductForm
                mode="edit"
                product={product}
                onSuccess={handleSuccess}
                trigger={
                  <MenuItem icon={<Edit size={16} />}>
                    Edit Product
                  </MenuItem>
                }
              />
              <DeleteProduct
                product={product}
                onSuccess={handleSuccess}
                trigger={
                  <MenuItem icon={<Trash2 size={16} />} color="red.500">
                    Delete Product
                  </MenuItem>
                }
              />
            </MenuList>
          </Menu>
        </Box>

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="red"
            variant="solid"
          >
            -{product.discount_percentage}%
          </Badge>
        )}
      </Box>

      <Box p={4}>
        <VStack align="start" spacing={3}>
          <Link to={`/product/${product.id}`}>
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={textColor}
              _hover={{ color: primaryColor }}
              transition="color 0.2s"
              noOfLines={2}
            >
              {product.title}
            </Text>
          </Link>
          
          <Text
            fontSize="sm"
            color={mutedTextColor}
            noOfLines={2}
          >
            {product.description}
          </Text>
          
          {/* Rating Display */}
          <HStack spacing={2}>
            <HStack spacing={1}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  color={star <= product.rating ? "yellow.400" : "gray.300"}
                  fill={star <= product.rating ? "currentColor" : "none"}
                />
              ))}
            </HStack>
            <Text fontSize="sm" color={mutedTextColor}>
              {product.rating.toFixed(1)}
            </Text>
          </HStack>
          
          <HStack spacing={2} wrap="wrap">
            <Badge colorScheme="primary" variant="subtle">
              {product.category}
            </Badge>
            {product.brand && (
              <Badge colorScheme="gray" variant="subtle">
                {product.brand}
              </Badge>
            )}
          </HStack>
          
          <HStack justify="space-between" w="full">
            <Text fontSize="xl" fontWeight="bold" color={primaryColor}>
              ${product.price.toFixed(2)}
            </Text>
            
            <Badge
              colorScheme={product.stock > 0 ? 'green' : 'red'}
              variant="subtle"
            >
              {product.stock > 0 ? `In Stock` : 'Out of Stock'}
            </Badge>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
} 