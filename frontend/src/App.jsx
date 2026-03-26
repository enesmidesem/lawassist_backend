import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth sayfaları (Enes'in kısmı)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Lawyer sayfaları (Enes'in kısmı)
import ProfilePage from "./pages/lawyer/ProfilePage";
import EditProfilePage from "./pages/lawyer/EditProfilePage";
import MyListingsPage from "./pages/lawyer/MyListingsPage";

// Kaan'ın sayfaları
import ListingsPage from "./pages/listings/ListingsPage";
import MyApplicationsPage from "./pages/listings/MyApplicationsPage";

// Admin sayfaları (Ünal'ın kısmı)
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLawyersPage from "./pages/admin/AdminLawyersPage";
import AdminLawyerDetailPage from "./pages/admin/AdminLawyerDetailPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";

// Ortak
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* ==================== AUTH (Enes) ==================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ==================== LAWYER (Enes) ==================== */}
        <Route path="/lawyers/:id" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/lawyers/:id/edit" element={
          <ProtectedRoute><EditProfilePage /></ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute><MyListingsPage /></ProtectedRoute>
        } />

        {/* ==================== KAAN ==================== */}
        <Route path="/listings" element={
          <ProtectedRoute><ListingsPage /></ProtectedRoute>
        } />
        <Route path="/my-applications" element={
          <ProtectedRoute><MyApplicationsPage /></ProtectedRoute>
        } />

        {/* ==================== ADMIN (Ünal) ==================== */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/lawyers" element={<AdminLawyersPage />} />
        <Route path="/admin/lawyers/:id" element={<AdminLawyerDetailPage />} />
        <Route path="/admin/listings" element={<AdminListingsPage />} />

        {/* ==================== FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
