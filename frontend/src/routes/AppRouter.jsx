import { Routes, Route } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ListenerHome from '../pages/listener/Home';
import Search from '../pages/listener/Search';
import Library from '../pages/listener/Library';
import PlaylistDetails from '../pages/listener/PlaylistDetails';
import Profile from '../pages/listener/Profile';
import History from '../pages/listener/History';
import ArtistDashboard from '../pages/artist/ArtistDashboard';
import ArtistUpload from '../pages/artist/ArtistUpload';
import ArtistAnalytics from '../pages/artist/ArtistAnalytics';
import ArtistReleases from '../pages/artist/ArtistReleases';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ListenerHome />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />

        <Route
          path="/artist/dashboard"
          element={
            <RoleRoute role="artist">
              <ArtistDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/artist/upload"
          element={
            <RoleRoute role="artist">
              <ArtistUpload />
            </RoleRoute>
          }
        />
        <Route
          path="/artist/analytics"
          element={
            <RoleRoute role="artist">
              <ArtistAnalytics />
            </RoleRoute>
          }
        />
        <Route
          path="/artist/releases"
          element={
            <RoleRoute role="artist">
              <ArtistReleases />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  );
}
