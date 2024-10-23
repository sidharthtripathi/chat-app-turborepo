import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
import RecoilNexus from "recoil-nexus";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <RecoilNexus />
          <Toaster />
          <App />
        </RecoilRoot>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
