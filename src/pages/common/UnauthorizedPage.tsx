import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'PATIENT':
        return '/patient/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'PHARMACY':
        return '/pharmacy/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="h-9 w-9" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">403 Error</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            You do not have administrative or role-level permissions to view this resource. This attempt has been logged in accordance with healthcare compliance guidelines.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={getHomeLink()} className="w-full sm:w-auto">
            <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />} className="w-full">
              Return to My Dashboard
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
