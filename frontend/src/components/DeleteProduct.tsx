import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
  Box,
} from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { Product } from '../types/product'
import { productApi } from '../services/api'

interface DeleteProductProps {
  product: Product
  onSuccess: () => void
  trigger?: React.ReactNode
}

export default function DeleteProduct({ product, onSuccess, trigger }: DeleteProductProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await productApi.deleteProduct(product.id)
      toast({
        title: 'Product deleted successfully',
        description: `"${product.title}" has been removed from your catalog.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: 'Failed to delete product',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {trigger ? (
        <Box onClick={onOpen}>{trigger}</Box>
      ) : (
        <Tooltip label="Delete product" placement="top">
          <IconButton
            aria-label="Delete product"
            icon={<Trash2 size={16} />}
            variant="ghost"
            size="sm"
            color="red.500"
            _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
            onClick={onOpen}
          />
        </Tooltip>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>"{product.title}"</strong>? 
              This action cannot be undone and will permanently remove the product from your catalog.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isLoading}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
} 