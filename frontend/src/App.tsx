import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';

import LandingPage from './pages/Landing';
import AuthPage from './pages/Auth';
import DashboardPage from './pages/Dashboard';
import ProfilePage from './pages/Profile';
import MyProjectsPage from './pages/MyProjects';
import FindTeammatesPage from './pages/FindTeammates';
import FindProjectsPage from './pages/FindProjects';
import RequestsPage from './pages/Requests';
import ChatPage from './pages/Chat';

import './styles/globals.css';

// Protected Route Wrapper
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🌀</div>
      <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Page not found</h2>
      <p style={{ color: '#64748b' }}>The url you typed doesn't exist on our radar.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn, userId } = useAuth();
  const location = useLocation();

  console.log('[Routing] Current Location:', location.pathname, 'LoggedIn:', isLoggedIn, 'User:', userId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><MyProjectsPage /></RequireAuth>} />
          <Route path="/find-teammates" element={<RequireAuth><FindTeammatesPage /></RequireAuth>} />
          <Route path="/find-projects" element={<RequireAuth><FindProjectsPage /></RequireAuth>} />
          <Route path="/requests" element={<RequireAuth><RequestsPage /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

