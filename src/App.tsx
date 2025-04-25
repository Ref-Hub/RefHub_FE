// src/App.tsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { router } from "@/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ToastProvider } from "@/contexts/ToastProvider";
import { LoadingProvider } from "@/components/LoadingProvider";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                <RouterProvider router={router} />
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </ErrorBoundary>
  );
};

export default App;
