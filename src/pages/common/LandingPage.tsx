import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Video,
  FileText,
  ShoppingBag,
  Lock,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Users,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-navy-900">DocTalk</span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 mb-6">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Next-Generation Healthcare Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-navy-900 sm:text-6xl">
              Connected Healthcare,{' '}
              <span className="text-brand-600">Reimagined.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              DocTalk connects patients with verified specialist physicians, integrated pharmacy fulfilment,
              and encrypted medical records in a single cohesive platform.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to={isAuthenticated ? getDashboardLink() : '/register'}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {isAuthenticated ? 'Open Portal' : 'Create Free Account'}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Access Portal
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Verified Doctors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Digital Prescriptions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Instant Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Dedicated Workspaces for Every Role
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tailored workflows ensuring security, compliance, and frictionless care delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Patient Portal</h3>
              <p className="mt-2 text-sm text-slate-600">
                Book appointments, join HD video consultations, consult via encrypted chat, view prescriptions, and order medications.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Doctor Console</h3>
              <p className="mt-2 text-sm text-slate-600">
                Manage appointment slots, view medical histories, conduct WebRTC video visits, issue digital prescriptions, and track earnings.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Pharmacy Center</h3>
              <p className="mt-2 text-sm text-slate-600">
                Process digital prescription orders, manage medicine inventory stocks, coordinate dispatches, and verify authentic fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3">
                <Video className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">HD Video Calls</h4>
              <p className="mt-1 text-sm text-slate-500">
                Peer-to-peer WebRTC consultation with ICE/STUN/TURN signaling fallback.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Digital RX</h4>
              <p className="mt-1 text-sm text-slate-500">
                Legally compliant digital prescriptions instantly convertible to medicine orders.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Medicine Fulfilment</h4>
              <p className="mt-1 text-sm text-slate-500">
                Integrated pharmacy networks providing transparent pricing and doorstep delivery.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-3">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Encrypted Vault</h4>
              <p className="mt-1 text-sm text-slate-500">
                Strict role-based authorization, JWT security, and immutable audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-400" />
            <span className="text-sm font-semibold text-white">DocTalk Healthcare Platform</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} DocTalk. Telehealth & Consultation Infrastructure. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
