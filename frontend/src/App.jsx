import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { GoogleConfigContext } from './context/GoogleConfigContext';
import { BrandingProvider } from './context/BrandingContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailChangePage from './pages/VerifyEmailChangePage';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminGeneralSettingsPage from './pages/admin/AdminGeneralSettingsPage';
import AdminGoogleAuthPage from './pages/admin/AdminGoogleAuthPage';
import PrivateRoute from './components/PrivateRoute';
import UserLayout from './layouts/UserLayout';
import UserDashboardPage from './pages/user/UserDashboardPage';


const API_URL = import.meta.env.VITE_API_URL;


// AuthWrapper (Keep existing)
const AuthWrapper = ({ children }) => {
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [oauthEnabled, setOauthEnabled] = useState(false);

  useEffect(() => {
    const fetchOAuthConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/oauth/public`);
        if (res.ok) {
          const data = await res.json();
          if (data.client_id) setClientId(data.client_id);
          setOauthEnabled(data.enabled);
        }
      } catch (err) {
        console.error('Failed to load OAuth config:', err);
      }
    };
    fetchOAuthConfig();
  }, []);

  const isEnabled = oauthEnabled && !!clientId;

  const content = isEnabled ? (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

  return (
    <GoogleConfigContext.Provider value={{ enabled: isEnabled }}>
      {content}
    </GoogleConfigContext.Provider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthWrapper>
          <AuthProvider>
            <BrandingProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />

                  {/* User Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <UserLayout />
                    </PrivateRoute>
                  }>
                    <Route index element={<UserDashboardPage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<Navigate to="/admin/profile" replace />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="general" element={<AdminGeneralSettingsPage />} />
                    <Route path="google-auth" element={<AdminGoogleAuthPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </BrandingProvider>
          </AuthProvider>
        </AuthWrapper>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
