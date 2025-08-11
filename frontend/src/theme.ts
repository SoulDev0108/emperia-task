import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true, // Enable system preference detection
}

const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary color - professional blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
}

const semanticTokens = {
  colors: {
    'chakra-body-text': { _light: 'gray.800', _dark: 'white' },
    'chakra-body-bg': { _light: 'gray.50', _dark: 'gray.900' },
    'chakra-border-color': { _light: 'gray.200', _dark: 'gray.700' },
    'chakra-subtle-bg': { _light: 'gray.100', _dark: 'gray.800' },
    'chakra-subtle-text': { _light: 'gray.600', _dark: 'gray.400' },
  },
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'primary',
    },
    variants: {
      solid: {
        _light: {
          bg: 'primary.500',
          color: 'white',
          _hover: { bg: 'primary.600' },
          _active: { bg: 'primary.700' },
          shadow: 'md',
        },
        _dark: {
          bg: 'primary.400',
          color: 'gray.900',
          _hover: { bg: 'primary.300' },
          _active: { bg: 'primary.500' },
          shadow: 'lg',
        },
      },
      outline: {
        _light: {
          borderColor: 'primary.500',
          color: 'primary.500',
          _hover: { bg: 'primary.50' },
        },
        _dark: {
          borderColor: 'primary.400',
          color: 'primary.400',
          _hover: { bg: 'primary.900' },
        },
      },
      ghost: {
        _light: {
          color: 'primary.500',
          _hover: { bg: 'primary.50' },
        },
        _dark: {
          color: 'primary.400',
          _hover: { bg: 'primary.900' },
        },
      },
    },
    sizes: {
      md: {
        px: 6,
        py: 3,
        fontSize: 'sm',
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      lg: {
        px: 8,
        py: 4,
        fontSize: 'md',
        fontWeight: 'semibold',
        borderRadius: 'xl',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        _light: {
          bg: 'white',
          borderColor: 'gray.200',
          shadow: 'lg',
          borderRadius: 'xl',
        },
        _dark: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          shadow: '2xl',
          borderRadius: 'xl',
        },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          _light: {
            bg: 'white',
            borderColor: 'gray.300',
            _hover: { borderColor: 'primary.400' },
            _focus: { 
              borderColor: 'primary.500', 
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              bg: 'white'
            },
            borderRadius: 'lg',
          },
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.600',
            _hover: { borderColor: 'primary.400' },
            _focus: { 
              borderColor: 'primary.400', 
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)',
              bg: 'gray.800'
            },
            borderRadius: 'lg',
          },
        },
      },
    },
    sizes: {
      md: {
        field: {
          px: 4,
          py: 3,
          fontSize: 'sm',
        },
      },
    },
  },
  Select: {
    variants: {
      outline: {
        field: {
          _light: {
            bg: 'white',
            borderColor: 'gray.300',
            _hover: { borderColor: 'primary.400' },
            _focus: { 
              borderColor: 'primary.500', 
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              bg: 'white'
            },
            borderRadius: 'lg',
          },
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.600',
            _hover: { borderColor: 'primary.400' },
            _focus: { 
              borderColor: 'primary.400', 
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)',
              bg: 'gray.800'
            },
            borderRadius: 'lg',
          },
        },
      },
    },
    sizes: {
      md: {
        field: {
          px: 4,
          py: 3,
          fontSize: 'sm',
        },
      },
    },
  },
  Badge: {
    variants: {
      primary: {
        _light: {
          bg: 'primary.100',
          color: 'primary.800',
          fontWeight: 'semibold',
        },
        _dark: {
          bg: 'primary.900',
          color: 'primary.300',
          fontWeight: 'semibold',
        },
      },
    },
    sizes: {
      md: {
        px: 3,
        py: 1,
        fontSize: 'sm',
        borderRadius: 'full',
      },
    },
  },
}

const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
  styles: {
    global: (props: any) => ({
      body: {
        _light: {
          bg: 'gray.50',
          color: 'gray.800',
        },
        _dark: {
          bg: 'gray.900',
          color: 'white',
        },
      },
    }),
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  radii: {
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
})

export default theme 