import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const EmployeeMaster = lazy(() => import('@/features/employeeMaster/pages/EmployeeMaster'));
const PassManagementList = lazy(() => import('@/features/passManagement/pages/PassManagementList'));
const PassApplicationForm = lazy(() => import('@/features/passManagement/pages/PassApplicationForm'));
const PassApplicationDetail = lazy(() => import('@/features/passManagement/pages/PassApplicationDetail'));
const ExpiryReminders = lazy(() => import('@/features/passManagement/pages/ExpiryReminders'));
const AuditLog = lazy(() => import('@/features/audit/pages/AuditLog'));
const LicenseManagementIndex = lazy(() => import('@/features/licenseManagement/pages/LicenseManagementIndex'));
const TradeLicenseForm = lazy(() => import('@/features/licenseManagement/pages/TradeLicenseForm'));
const LicenseDetail = lazy(() => import('@/features/licenseManagement/pages/LicenseDetail'));

const OrgManagementIndex = lazy(() => import('@/features/orgManagement/pages/OrgManagementIndex'));
const OrgChainForm = lazy(() => import('@/features/orgManagement/pages/OrgChainForm'));
const OrgChainDetail = lazy(() => import('@/features/orgManagement/pages/OrgChainDetail'));

const ChecklistIndex = lazy(() => import('@/features/checklist/pages/ChecklistIndex'));
const CalendarIndex = lazy(() => import('@/features/calendar/pages/CalendarIndex'));
const WorkingHours = lazy(() => import('@/features/resources/pages/WorkingHours'));
const MasterDataUpload = lazy(() => import('@/features/masterData/pages/MasterDataUpload'));

const ComingSoon = lazy(() => import('@/pages/ComingSoon'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/register',
        element: (
          <PublicRoute>
            <Suspense fallback={null}><Register /></Suspense>
          </PublicRoute>
        ),
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Suspense fallback={null}><Login /></Suspense>
          </PublicRoute>
        ),
      },
      // placeholder for forgot/reset password
    ]
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Suspense fallback={null}><Dashboard /></Suspense>,
      },
      {
        path: '/dashboard/employee-master',
        element: <Suspense fallback={null}><EmployeeMaster /></Suspense>,
      },
      {
        path: '/dashboard/pass-management',
        element: <Suspense fallback={null}><PassManagementList /></Suspense>,
      },
      {
        path: '/dashboard/pass-management/new',
        element: <Suspense fallback={null}><PassApplicationForm /></Suspense>,
      },
      {
        path: '/dashboard/pass-management/:id',
        element: <Suspense fallback={null}><PassApplicationDetail /></Suspense>,
      },
      {
        path: '/expiry-reminders',
        element: <Suspense fallback={null}><ExpiryReminders /></Suspense>,
      },
      {
        path: '/audit-log',
        element: <Suspense fallback={null}><AuditLog /></Suspense>,
      },
      {
        path: '/dashboard/license-management',
        element: <Suspense fallback={null}><LicenseManagementIndex /></Suspense>,
      },
      {
        path: '/dashboard/license-management/new-trade',
        element: <Suspense fallback={null}><TradeLicenseForm /></Suspense>,
      },
      {
        path: '/dashboard/license-management/:id',
        element: <Suspense fallback={null}><LicenseDetail /></Suspense>,
      },
      {
        path: '/dashboard/org-management',
        element: <Suspense fallback={null}><OrgManagementIndex /></Suspense>,
      },
      {
        path: '/dashboard/org-management/new',
        element: <Suspense fallback={null}><OrgChainForm /></Suspense>,
      },
      {
        path: '/dashboard/org-management/:id',
        element: <Suspense fallback={null}><OrgChainDetail /></Suspense>,
      },
      {
        path: '/dashboard/master-data-upload',
        element: <Suspense fallback={null}><MasterDataUpload /></Suspense>,
      },
      {
        path: '/checklist',
        element: <Suspense fallback={null}><ChecklistIndex /></Suspense>,
      },
      {
        path: '/registrations',
        element: <Suspense fallback={null}><ComingSoon title="Registrations" /></Suspense>,
      },
      {
        path: '/calendar',
        element: <Suspense fallback={null}><CalendarIndex /></Suspense>,
      },
      {
        path: '/gazette-notifications',
        element: <Suspense fallback={null}><ComingSoon title="Gazette Notifications" /></Suspense>,
      },
      {
        path: '/blog',
        element: <Suspense fallback={null}><ComingSoon title="Blog" /></Suspense>,
      },
      {
        path: '/knowledge-base',
        element: <Suspense fallback={null}><ComingSoon title="Knowledge Base" /></Suspense>,
      },
      {
        path: '/holiday-list',
        element: <Suspense fallback={null}><ComingSoon title="Holiday List" /></Suspense>,
      },
      {
        path: '/working-hours',
        element: <Suspense fallback={null}><WorkingHours /></Suspense>,
      },
      {
        path: '/rules-and-acts',
        element: <Suspense fallback={null}><ComingSoon title="Rules & Acts" /></Suspense>,
      },
      {
        path: '/court-judgements',
        element: <Suspense fallback={null}><ComingSoon title="Court Judgements" /></Suspense>,
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export { router };
