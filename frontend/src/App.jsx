import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import api from './utils/api';

import LandingPage            from './pages/LandingPage';
import LoginPage              from './pages/LoginPage';
import RegisterPlayerPage     from './pages/RegisterPlayerPage';
import RegisterCaptainPage    from './pages/RegisterCaptainPage';
import RegisterFanPage        from './pages/RegisterFanPage';
import RegisterOrganiserPage  from './pages/RegisterOrganiserPage';
import OrganiserDashboard     from './pages/OrganiserDashboard';
import FeedPage               from './pages/FeedPage';
import PlayerProfilePage      from './pages/PlayerProfilePage';
import BiddingPage            from './pages/BiddingPage';
import MyProfilePage          from './pages/MyProfilePage';
import NotificationsPage      from './pages/NotificationsPage';

import AdminLoginPage    from './pages/admin/AdminLoginPage';
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminPlayers      from './pages/admin/AdminPlayers';
import AdminCaptains     from './pages/admin/AdminCaptains';
import AdminBidding      from './pages/admin/AdminBidding';
import AdminTournaments  from './pages/admin/AdminTournaments';
import AdminBroadcast    from './pages/admin/AdminBroadcast';

import BottomNav         from './components/common/BottomNav';
import TopBar            from './components/common/TopBar';
import PWAInstallButton  from './components/common/PWAInstallButton';
import SplashScreen      from './components/common/SplashScreen';

// ── Route guards ─────────────────────────────────────────────────────────────
function UserRoute({ children }) {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);
  if (!token) return <Navigate to="/login" replace />;
  // Organisers get their own dashboard
  if (role === 'organiser') return <Navigate to="/organiser" replace />;
  return children;
}

function OrganiserRoute({ children }) {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);
  if (!token || role !== 'organiser') return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);
  if (!token || role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

function AppLayout({ children }) {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <main style={{ flex: 1 }}>{children}</main>
      {token && role !== 'admin' && role !== 'organiser' && <BottomNav />}
    </div>
  );
}

export default function App() {
  const token      = useAuthStore(s => s.token);
  const role       = useAuthStore(s => s.user?.role);
  const setProfile = useAuthStore(s => s.setProfile);

  const [showSplash, setShowSplash] = useState(() => {
    try { return !sessionStorage.getItem('gt_splash_shown'); } catch { return false; }
  });

  useEffect(() => {
    if (!showSplash) return;
    try { sessionStorage.setItem('gt_splash_shown', '1'); } catch {}
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, [showSplash]);

  useEffect(() => {
    if (token && role !== 'admin') {
      api.get('/auth/profile').then(({ data }) => setProfile(data)).catch(() => {});
    }
  }, [token, role]);

  if (showSplash) return <SplashScreen />;

  return (
    <BrowserRouter>
      <Toaster position="top-center" containerStyle={{ top: 16 }}
        toastOptions={{
          duration: 3500,
          style: { background: '#ffffff', color: '#1a1a2e', border: '1px solid rgba(245,200,66,0.25)', fontFamily: 'Outfit, sans-serif', borderRadius: '12px', fontSize: '14px', maxWidth: '360px' },
          success: { iconTheme: { primary: '#1877f2', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ff4444', secondary: '#ffffff' } },
        }}
      />
      <PWAInstallButton />

      <Routes>
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/"                      element={<AppLayout><LandingPage /></AppLayout>} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register/player"       element={<RegisterPlayerPage />} />
        <Route path="/register/captain"      element={<RegisterCaptainPage />} />
        <Route path="/register/fan"          element={<RegisterFanPage />} />
        <Route path="/register/organiser"    element={<RegisterOrganiserPage />} />

        {/* ── Organiser ───────────────────────────────────────────────── */}
        <Route path="/organiser"             element={<OrganiserRoute><OrganiserDashboard /></OrganiserRoute>} />

        {/* ── Authenticated (player / captain / fan) ───────────────────── */}
        <Route path="/feed"               element={<UserRoute><AppLayout><FeedPage /></AppLayout></UserRoute>} />
        <Route path="/player/:id"         element={<UserRoute><AppLayout><PlayerProfilePage /></AppLayout></UserRoute>} />
        <Route path="/bidding"            element={<UserRoute><AppLayout><BiddingPage /></AppLayout></UserRoute>} />
        <Route path="/bidding/:sessionId" element={<UserRoute><AppLayout><BiddingPage /></AppLayout></UserRoute>} />
        <Route path="/profile"            element={<UserRoute><AppLayout><MyProfilePage /></AppLayout></UserRoute>} />
        <Route path="/notifications"      element={<UserRoute><AppLayout><NotificationsPage /></AppLayout></UserRoute>} />

        {/* ── Admin ───────────────────────────────────────────────────── */}
        <Route path="/admin/login"        element={<AdminLoginPage />} />
        <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/players"      element={<AdminRoute><AdminPlayers /></AdminRoute>} />
        <Route path="/admin/captains"     element={<AdminRoute><AdminCaptains /></AdminRoute>} />
        <Route path="/admin/bidding"      element={<AdminRoute><AdminBidding /></AdminRoute>} />
        <Route path="/admin/tournaments"  element={<AdminRoute><AdminTournaments /></AdminRoute>} />
        <Route path="/admin/broadcast"    element={<AdminRoute><AdminBroadcast /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
