import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ListingDetail from './pages/ListingDetail';
import NotFound from './pages/NotFound';
import DonorDashboard from './pages/donor/DonorDashboard';
import NewListing from './pages/donor/NewListing';
import MyListings from './pages/donor/MyListings';
import Browse from './pages/ngo/Browse';
import MyPickups from './pages/ngo/MyPickups';
import AdminDashboard from './pages/admin/AdminDashboard';

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={`/app/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/app" element={<RoleHome />} />
          <Route path="/app/listing/:id" element={<ListingDetail />} />
          <Route path="/app/notifications" element={<Notifications />} />
          <Route path="/app/profile" element={<Profile />} />

          <Route element={<ProtectedRoute roles={['donor']} />}>
            <Route path="/app/donor" element={<DonorDashboard />} />
            <Route path="/app/donor/new" element={<NewListing />} />
            <Route path="/app/donor/edit/:id" element={<NewListing />} />
            <Route path="/app/donor/listings" element={<MyListings />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ngo']} />}>
            <Route path="/app/ngo" element={<Browse />} />
            <Route path="/app/ngo/pickups" element={<MyPickups />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/app/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
