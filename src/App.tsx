import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppRouter } from '@/routes/AppRouter'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
