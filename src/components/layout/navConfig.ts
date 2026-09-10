import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  FileText,
  ShoppingBag,
  FolderHeart,
  Users,
  ShieldAlert,
  Boxes,
  LucideIcon,
  Stethoscope,
} from 'lucide-react';
import { UserRole } from '@/types/auth';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  PATIENT: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Find Doctors', href: '/patient/doctors', icon: Stethoscope },
    { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
    { label: 'Medicine Orders', href: '/patient/orders', icon: ShoppingBag },
    { label: 'Medical Records', href: '/patient/records', icon: FolderHeart },
  ],
  DOCTOR: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { label: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
    { label: 'Doctor Profile', href: '/doctor/profile', icon: UserCheck },
  ],
  PHARMACY: [
    { label: 'Dashboard', href: '/pharmacy/dashboard', icon: LayoutDashboard },
    { label: 'Medicine Orders', href: '/pharmacy/orders', icon: ShoppingBag },
    { label: 'Inventory', href: '/pharmacy/inventory', icon: Boxes },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Doctor Approvals', href: '/admin/doctors', icon: UserCheck },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Audit Logs', href: '/admin/audits', icon: ShieldAlert },
  ],
};
