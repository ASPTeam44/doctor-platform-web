import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  FileText,
  ShoppingBag,
  Stethoscope,
  ArrowRight,
  FolderHeart,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate, formatTimeSlot } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'patient'],
    queryFn: () => appointmentApi.getPatientAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];

  const upcomingAppointments = appointments
    .filter((a: Appointment) => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .slice(0, 3);

  return (
    <PageContainer
      title={`Hello, ${user?.name || 'Patient'}`}
      description="Welcome to your personal health dashboard. Manage consultations, prescriptions, and orders."
      action={
        <Link to="/patient/doctors">
          <Button variant="primary" size="md" leftIcon={<Stethoscope className="h-4 w-4" />}>
            Find a Doctor
          </Button>
        </Link>
      }
    >
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-brand-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointments
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoading ? <Skeleton className="h-8 w-12" /> : appointments.length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {upcomingAppointments.length} upcoming
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prescriptions
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">3</h3>
              <p className="text-xs text-slate-500 mt-1">Digital copies available</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Medicine Orders
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">2</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">1 in transit</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Medical Records
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">4</h3>
              <p className="text-xs text-slate-500 mt-1">Encrypted S3 storage</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FolderHeart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>Scheduled telehealth visits with verified doctors</CardDescription>
              </div>
              <Link to="/patient/appointments" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingAppointments.map((appt: Appointment) => (
                    <div key={appt.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Dr. {appt.doctor?.name || 'Specialist'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appt.doctor?.doctorProfile?.specialization || 'General Physician'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium text-slate-700">{formatDate(appt.appointmentDate)}</p>
                          <p className="text-xs text-slate-500">{formatTimeSlot()}</p>
                        </div>
                        <Badge variant={statusVariantMap[appt.status]} dot>
                          {appt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming appointments"
                  description="You don't have any scheduled appointments right now. Search our verified doctors to book your consultation."
                  actionLabel="Book a Doctor"
                  onAction={() => window.location.assign('/patient/doctors')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Health Shield */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Health Actions</CardTitle>
              <CardDescription>Frictionless access to your healthcare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                to="/patient/doctors"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Find Specialist Doctors</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/patient/prescriptions"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">View Active Prescriptions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/patient/orders"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Track Medicine Orders</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
