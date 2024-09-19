import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { RecoilRoot } from 'recoil'
import RecoilNexus from 'recoil-nexus'
import { QueryClient, QueryClientProvider } from 'react-query'
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
          <RecoilRoot>
            <RecoilNexus/>
              <App/>
          </RecoilRoot>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
