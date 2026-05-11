import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../pages/_layouts/PublicLayout';
import AdminLayout from '../pages/_layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/public/Home/Home';
import CarDetail from '../pages/public/CarDetail/CarDetail';
import LiveDraws from '../pages/public/LiveDraws/LiveDraws';
import Winners from '../pages/public/Winners/Winners';
import Login from '../pages/public/Login/Login';
import ManageInventory from '../pages/admin/ManageInventory/ManageInventory';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login is full-bleed, no public layout chrome */}
      <Route path="/login" element={<Login />} />

      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/draws" element={<LiveDraws />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/cars/:id" element={<CarDetail />} />
      </Route>

      {/* Admin (gated) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="/admin/inventory" element={<ManageInventory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
