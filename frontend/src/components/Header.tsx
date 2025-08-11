import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Monitor, Menu, X } from 'lucide-react'
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Container,
  useColorModeValue,
  Collapse,
  useDisclosure,
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  Image,
} from '@chakra-ui/react'
import { useTheme } from '../contexts/ThemeContext'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { isOpen, onToggle } = useDisclosure()
  const location = useLocation()

  const navigation = [
    { name: 'Products', href: '/', current: location.pathname === '/' },
  ]

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const mutedTextColor = useColorModeValue('gray.700', 'gray.300')
  const primaryColor = useColorModeValue('primary.500', 'primary.400')
  const primaryBgColor = useColorModeValue('primary.100', 'primary.900')
  const primaryTextColor = useColorModeValue('primary.700', 'primary.300')

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />
      case 'dark':
        return <Moon size={20} />
      case 'system':
        return <Monitor size={20} />
      default:
        return <Monitor size={20} />
    }
  }

  return (
    <Box as="header" bg={bgColor} shadow="lg" borderBottomWidth="1px" borderColor={borderColor}>
      <Container maxW="container.xl" px={4}>
        <Flex justify="space-between" align="center" h={20}>
          {/* Logo */}
          <Flex align="center">
            <Link to="/">
              <HStack spacing={3}>
                <Image 
                  src="assets/logo/logo.png" 
                  alt="Emperia" 
                  width={48} 
                  height={48}
                  objectFit="contain"
                />
              </HStack>
            </Link>
          </Flex>

          {/* Desktop Navigation */}
          <HStack as="nav" spacing={8} display={{ base: 'none', md: 'flex' }}>
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <Box
                  px={4}
                  py={2}
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  bg={item.current ? primaryBgColor : 'transparent'}
                  color={item.current ? primaryTextColor : mutedTextColor}
                  _hover={{
                    color: item.current ? primaryTextColor : primaryColor,
                    bg: item.current ? primaryBgColor : 'gray.50',
                    _dark: {
                      bg: item.current ? primaryBgColor : 'gray.700',
                    }
                  }}
                >
                  {item.name}
                </Box>
              </Link>
            ))}
          </HStack>

          {/* Right side actions */}
          <HStack spacing={4} align="center">
            {/* Theme toggle with dropdown */}
            <ChakraMenu>
              <Tooltip label="Change theme" placement="bottom">
                <MenuButton
                  as={IconButton}
                  aria-label="Theme options"
                  icon={getThemeIcon()}
                  variant="ghost"
                  size="md"
                  color={mutedTextColor}
                  _hover={{ 
                    color: primaryColor,
                    bg: 'gray.50',
                    _dark: { bg: 'gray.700' }
                  }}
                  _active={{ bg: 'gray.100', _dark: { bg: 'gray.600' } }}
                />
              </Tooltip>
              <MenuList>
                <MenuItem
                  icon={<Sun size={16} />}
                  onClick={() => setTheme('light')}
                  bg={theme === 'light' ? primaryBgColor : 'transparent'}
                  color={theme === 'light' ? primaryTextColor : 'inherit'}
                  _hover={{
                    bg: theme === 'light' ? primaryBgColor : 'gray.50',
                    _dark: { bg: theme === 'light' ? primaryBgColor : 'gray.700' }
                  }}
                >
                  Light
                </MenuItem>
                <MenuItem
                  icon={<Moon size={16} />}
                  onClick={() => setTheme('dark')}
                  bg={theme === 'dark' ? primaryBgColor : 'transparent'}
                  color={theme === 'dark' ? primaryTextColor : 'inherit'}
                  _hover={{
                    bg: theme === 'dark' ? primaryBgColor : 'gray.50',
                    _dark: { bg: theme === 'dark' ? primaryBgColor : 'gray.700' }
                  }}
                >
                  Dark
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<Monitor size={16} />}
                  onClick={() => setTheme('system')}
                  bg={theme === 'system' ? primaryBgColor : 'transparent'}
                  color={theme === 'system' ? primaryTextColor : 'inherit'}
                  _hover={{
                    bg: theme === 'system' ? primaryBgColor : 'gray.50',
                    _dark: { bg: theme === 'system' ? primaryBgColor : 'gray.700' }
                  }}
                >
                  System
                </MenuItem>
              </MenuList>
            </ChakraMenu>

            {/* Mobile menu button */}
            <IconButton
              onClick={onToggle}
              aria-label="Toggle mobile menu"
              variant="ghost"
              size="md"
              icon={isOpen ? <X size={20} /> : <Menu size={20} />}
              color={mutedTextColor}
              _hover={{ 
                color: primaryColor,
                bg: 'gray.50',
                _dark: { bg: 'gray.700' }
              }}
              display={{ base: 'flex', md: 'none' }}
            />
          </HStack>
        </Flex>

        {/* Mobile Navigation */}
        <Collapse in={isOpen} animateOpacity>
          <Box display={{ base: 'block', md: 'none' }}>
            <VStack spacing={1} pt={2} pb={4} px={2} borderTopWidth="1px" borderColor={borderColor}>
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} onClick={onToggle}>
                  <Box
                    w="full"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    fontSize="base"
                    fontWeight="semibold"
                    transition="all 0.2s"
                    bg={item.current ? primaryBgColor : 'transparent'}
                    color={item.current ? primaryTextColor : mutedTextColor}
                    _hover={{
                      color: item.current ? primaryTextColor : primaryColor,
                      bg: item.current ? primaryBgColor : 'gray.50',
                      _dark: { bg: item.current ? primaryBgColor : 'gray.700' }
                    }}
                  >
                    {item.name}
                  </Box>
                </Link>
              ))}
            </VStack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  )
} 