import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import RecoilNexus from "recoil-nexus";
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RecoilRoot>
      <RecoilNexus /> 
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <App/>
      </ThemeProvider>
    </RecoilRoot>
  </QueryClientProvider>
);
