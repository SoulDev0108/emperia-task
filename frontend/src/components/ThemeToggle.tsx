import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import {
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'solid'
}

export default function ThemeToggle({ size = 'sm', variant = 'ghost' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  
  const mutedTextColor = useColorModeValue('gray.700', 'gray.300')
  const primaryColor = useColorModeValue('primary.500', 'primary.400')
  const primaryBgColor = useColorModeValue('primary.100', 'primary.900')
  const primaryTextColor = useColorModeValue('primary.700', 'primary.300')

  const getActiveStyle = (themeType: string) => {
    if (theme === themeType) {
      return {
        bg: primaryBgColor,
        color: primaryTextColor,
      }
    }
    return {}
  }

  return (
    <HStack spacing={1}>
      <Tooltip label="Light theme" placement="top">
        <IconButton
          aria-label="Light theme"
          icon={<Sun size={size === 'lg' ? 20 : 16} />}
          size={size}
          variant={variant}
          color={mutedTextColor}
          _hover={{ color: primaryColor }}
          onClick={() => setTheme('light')}
          {...getActiveStyle('light')}
        />
      </Tooltip>
      
      <Tooltip label="Dark theme" placement="top">
        <IconButton
          aria-label="Dark theme"
          icon={<Moon size={size === 'lg' ? 20 : 16} />}
          size={size}
          variant={variant}
          color={mutedTextColor}
          _hover={{ color: primaryColor }}
          onClick={() => setTheme('dark')}
          {...getActiveStyle('dark')}
        />
      </Tooltip>
      
      <Tooltip label="System theme" placement="top">
        <IconButton
          aria-label="System theme"
          icon={<Monitor size={size === 'lg' ? 20 : 16} />}
          size={size}
          variant={variant}
          color={mutedTextColor}
          _hover={{ color: primaryColor }}
          onClick={() => setTheme('system')}
          {...getActiveStyle('system')}
        />
      </Tooltip>
    </HStack>
  )
} 