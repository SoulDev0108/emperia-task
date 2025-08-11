import {
  HStack,
  Button,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  const buttonBg = useColorModeValue('white', 'gray.800')
  const buttonBorder = useColorModeValue('gray.200', 'gray.700')
  const activeBg = useColorModeValue('primary.500', 'primary.400')
  const activeColor = useColorModeValue('white', 'white')

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <HStack spacing={2} justify="center" align="center">
      {/* Previous Button */}
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeft size={16} />}
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={!hasPrev}
        variant="outline"
        size="sm"
      />

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <IconButton
              key={`ellipsis-${index}`}
              aria-label="More pages"
              icon={<MoreHorizontal size={16} />}
              variant="ghost"
              size="sm"
              isDisabled
              _hover={{ bg: 'transparent' }}
            />
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            variant={isActive ? 'solid' : 'outline'}
            colorScheme={isActive ? 'primary' : 'gray'}
            size="sm"
            minW="40px"
            _hover={
              isActive
                ? { bg: activeBg, color: activeColor }
                : { bg: buttonBg, borderColor: buttonBorder }
            }
          >
            {pageNum}
          </Button>
        )
      })}

      {/* Next Button */}
      <IconButton
        aria-label="Next page"
        icon={<ChevronRight size={16} />}
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={!hasNext}
        variant="outline"
        size="sm"
      />
    </HStack>
  )
} 