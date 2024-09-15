import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import { Join } from './pages/JoinPage'
import { Toaster } from "@/components/ui/toaster"
import ChatPage from './pages/ChatPage'
import { RecoilRoot } from 'recoil'
import RecoilNexus from 'recoil-nexus'
import {QueryClientProvider,QueryClient} from 'react-query'
import ChatsListPage from './pages/ChatsListPage'
const queryClient = new QueryClient()
export const router = createBrowserRouter([
  {
    path : "/",
    element : <Join/>
  },
{
  path : "/chats",
  element  : <ChatsListPage/>
},
{
  path : "/chats/:conversationId",
  element  : <ChatPage/>
}
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Toaster />
    <RecoilRoot>
    <RecoilNexus/>
    <QueryClientProvider client={queryClient}>
     <RouterProvider router={router} />
    </QueryClientProvider>
     </RecoilRoot>
    </ThemeProvider>
  </StrictMode>,
)
