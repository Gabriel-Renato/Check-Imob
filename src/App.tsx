import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layouts
import { AdminLayout } from "./components/layout/AdminLayout";
import { CorretorLayout } from "./components/layout/CorretorLayout";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProperties from "./pages/admin/Properties";
import AdminCorretores from "./pages/admin/Corretores";
import AdminInspections from "./pages/admin/Inspections";
import AdminSettings from "./pages/admin/Settings";

// Corretor Pages
import CorretorHome from "./pages/corretor/Home";
import CorretorAgenda from "./pages/corretor/Agenda";
import CorretorInspectionsList from "./pages/corretor/InspectionsList";
import CorretorProfile from "./pages/corretor/Profile";
import Inspection from "./pages/corretor/Inspection";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated && user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/corretor'} replace /> 
            : <Login />
        } 
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="corretores" element={<AdminCorretores />} />
        <Route path="inspections" element={<AdminInspections />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Admin Inspection Detail (outside layout for full screen) */}
      <Route
        path="/admin/inspection/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Inspection />
          </ProtectedRoute>
        }
      />

      {/* Corretor Routes */}
      <Route
        path="/corretor"
        element={
          <ProtectedRoute allowedRoles={['corretor']}>
            <CorretorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CorretorHome />} />
        <Route path="agenda" element={<CorretorAgenda />} />
        <Route path="inspections" element={<CorretorInspectionsList />} />
        <Route path="profile" element={<CorretorProfile />} />
      </Route>

      {/* Inspection Detail (outside layout for full screen) */}
      <Route
        path="/corretor/inspection/:id"
        element={
          <ProtectedRoute allowedRoles={['corretor']}>
            <Inspection />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
