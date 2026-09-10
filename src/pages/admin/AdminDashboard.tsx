import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Activity,
  ArrowRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageContainer
      title="Platform Administration Console"
      description="System-level governance, doctor credential verification, user moderation, and security auditing."
      action={
        <Link to="/admin/doctors">
          <Button variant="primary" size="md" leftIcon={<UserCheck className="h-4 w-4" />}>
            Doctor Verification Queue
          </Button>
        </Link>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-brand-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">1,428</h3>
              <p className="text-xs text-slate-500 mt-1">Patients, doctors & pharmacies</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Approvals
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">3</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Doctor licenses awaiting review</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Consultations
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">2,890</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">100% encrypted WebRTC</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Audit Events (24h)
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">456</h3>
              <p className="text-xs text-slate-500 mt-1">Zero security anomalies</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verification Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Doctor Verification Queue</CardTitle>
              <CardDescription>Recently submitted physician licenses requiring verification</CardDescription>
            </div>
            <Link to="/admin/doctors" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Review all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Dr. Meera Nambiar</h4>
                <p className="text-xs text-slate-500">Neurology • MCI-2024-1188</p>
              </div>
              <Badge variant="warning" dot>
                Pending Review
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Dr. Rajesh Iyer</h4>
                <p className="text-xs text-slate-500">Dermatology • MCI-2024-9902</p>
              </div>
              <Badge variant="warning" dot>
                Pending Review
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security and Audits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Security & Audit Feed</CardTitle>
              <CardDescription>Real-time audit trails of critical system events</CardDescription>
            </div>
            <Link to="/admin/audits" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Full Log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 text-xs text-slate-600 py-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">DOCTOR_VERIFIED</p>
                <p className="text-slate-500">Dr. Sharma verification approved by Admin</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-600 py-1">
              <span className="flex h-2 w-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">VIDEO_SESSION_INITIATED</p>
                <p className="text-slate-500">Room created with WebRTC peer handshake</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-600 py-1">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">PAYMENT_CAPTURED</p>
                <p className="text-slate-500">Consultation payment verified via webhook</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
