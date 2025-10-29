import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Pages - lazy loaded for better performance
import { lazy } from 'react';

// Lazy load pages for better initial load performance
const Auth = lazy(() => import("@/pages/Auth"));
const Landing = lazy(() => import("@/pages/Landing"));
const ProjectList = lazy(() => import("@/pages/ProjectList"));
const Board = lazy(() => import("@/pages/Board"));
const SprintView = lazy(() => import("@/pages/SprintView"));
const Reports = lazy(() => import("@/pages/Reports"));
const OKRs = lazy(() => import("@/pages/OKRs"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const Hypotheses = lazy(() => import("@/pages/Hypotheses"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Prioritization = lazy(() => import("@/pages/Prioritization"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 400 && error.status < 500 ? false : failureCount < 3;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <KeyboardShortcutsProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <ProjectList />
                    </ProtectedRoute>
                  } />

                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <ProjectList />
                    </ProtectedRoute>
                  } />

                  <Route path="/board/:projectId" element={
                    <ProtectedRoute>
                      <Board />
                    </ProtectedRoute>
                  } />

                  <Route path="/sprints/:projectId" element={
                    <ProtectedRoute>
                      <SprintView />
                    </ProtectedRoute>
                  } />

                  <Route path="/reports/:projectId" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />

                  <Route path="/okrs/:projectId" element={
                    <ProtectedRoute>
                      <OKRs />
                    </ProtectedRoute>
                  } />

                  <Route path="/roadmap/:projectId" element={
                    <ProtectedRoute>
                      <Roadmap />
                    </ProtectedRoute>
                  } />

                  <Route path="/hypotheses/:projectId" element={
                    <ProtectedRoute>
                      <Hypotheses />
                    </ProtectedRoute>
                  } />

                  <Route path="/feedback/:projectId" element={
                    <ProtectedRoute>
                      <Feedback />
                    </ProtectedRoute>
                  } />

                  <Route path="/prioritization/:projectId" element={
                    <ProtectedRoute>
                      <Prioritization />
                    </ProtectedRoute>
                  } />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </KeyboardShortcutsProvider>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
