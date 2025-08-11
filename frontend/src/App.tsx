import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, Spinner, Center } from '@chakra-ui/react'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'

export default function App() {
  return (
    <ThemeProvider>
      <Box minH="100vh">
        <Header />
        <Suspense
          fallback={
            <Center h="100vh">
              <Spinner size="xl" color="primary.500" thickness="4px" />
            </Center>
          }
        >
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  )
} 