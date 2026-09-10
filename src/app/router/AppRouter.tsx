import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/common/RoleProtectedRoute';

// Public Pages
import { LandingPage } from '@/pages/common/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { UnauthorizedPage } from '@/pages/common/UnauthorizedPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';

// Patient Pages
import { PatientDashboard } from '@/pages/patient/PatientDashboard';
import { PatientDoctorsPage } from '@/pages/patient/PatientDoctorsPage';
import { PatientDoctorDetailPage } from '@/pages/patient/PatientDoctorDetailPage';
import { PatientAppointmentsPage } from '@/pages/patient/PatientAppointmentsPage';
import { PatientPrescriptionsPage } from '@/pages/patient/PatientPrescriptionsPage';
import { PatientOrdersPage } from '@/pages/patient/PatientOrdersPage';
import { PatientMedicalRecordsPage } from '@/pages/patient/PatientMedicalRecordsPage';

// Doctor Pages
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from '@/pages/doctor/DoctorAppointmentsPage';
import { DoctorSchedulePage } from '@/pages/doctor/DoctorSchedulePage';
import { DoctorPrescriptionsPage } from '@/pages/doctor/DoctorPrescriptionsPage';
import { DoctorProfilePage } from '@/pages/doctor/DoctorProfilePage';

// Pharmacy Pages
import { PharmacyDashboard } from '@/pages/pharmacy/PharmacyDashboard';
import { PharmacyOrdersPage } from '@/pages/pharmacy/PharmacyOrdersPage';
import { PharmacyInventoryPage } from '@/pages/pharmacy/PharmacyInventoryPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminDoctorsPage } from '@/pages/admin/AdminDoctorsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditsPage } from '@/pages/admin/AdminAuditsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* PATIENT Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
          <Route path="/patient/doctors/:doctorId" element={<PatientDoctorDetailPage />} />
          <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
          <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
          <Route path="/patient/orders" element={<PatientOrdersPage />} />
          <Route path="/patient/records" element={<PatientMedicalRecordsPage />} />
        </Route>

        {/* DOCTOR Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        </Route>

        {/* PHARMACY Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['PHARMACY']} />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/orders" element={<PharmacyOrdersPage />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
        </Route>

        {/* ADMIN Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/audits" element={<AdminAuditsPage />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
