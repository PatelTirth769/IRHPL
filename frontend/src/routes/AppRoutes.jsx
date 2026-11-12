import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Home from '@/pages/Home';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Register = lazy(() => import('@/features/auth/pages/Register'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const EmployeeMaster = lazy(() => import('@/features/employeeMaster/pages/EmployeeMaster'));
const ComingSoon = lazy(() => import('@/pages/ComingSoon'));

// Using a full screen loading fallback for Suspense
const SuspenseFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#F6F8FC]">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/master-data-upload" element={<ComingSoon />} />
          <Route path="/dashboard/employee-master" element={<EmployeeMaster />} />
          <Route path="/checklist" element={<ComingSoon />} />
          <Route path="/registrations" element={<ComingSoon />} />
          <Route path="/expiry-reminders" element={<ComingSoon />} />
          <Route path="/calendar" element={<ComingSoon />} />
          <Route path="/gazette-notifications" element={<ComingSoon />} />
          <Route path="/blog" element={<ComingSoon />} />
          <Route path="/knowledge-base" element={<ComingSoon />} />
          <Route path="/minimum-wages" element={<ComingSoon />} />
          <Route path="/holiday-list" element={<ComingSoon />} />
          <Route path="/lwf-rates" element={<ComingSoon />} />
          <Route path="/professional-tax" element={<ComingSoon />} />
          <Route path="/working-hours" element={<ComingSoon />} />
          <Route path="/glossary" element={<ComingSoon />} />
          <Route path="/rules-and-acts" element={<ComingSoon />} />
          <Route path="/court-judgements" element={<ComingSoon />} />
          <Route path="/profile" element={<ComingSoon />} />
          <Route path="/settings" element={<ComingSoon />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
