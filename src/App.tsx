import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Header } from "@/components/layout/Header";
import Bancos from "@/pages/Bancos";
import Salario from "@/pages/Salario";
import Gastos from "@/pages/Gastos";
import Historial from "@/pages/Historial";
import { AppStoreProvider } from "@/store/app-store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppStoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/bancos" element={<Bancos />} />
              <Route path="/salario" element={<Salario />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/historial" element={<Historial />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AppStoreProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
