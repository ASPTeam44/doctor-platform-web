import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  Video,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate, formatTimeSlot, formatCurrency } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'doctor'],
    queryFn: () => appointmentApi.getDoctorAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];
  const todayAppointments = appointments.slice(0, 5);

  return (
    <PageContainer
      title={`Dr. ${user?.name || 'Physician'}'s Console`}
      description="Clinical dashboard for managing patient consultations, digital prescriptions, and teleconsultations."
      action={
        <Link to="/doctor/appointments">
          <Button variant="primary" size="md" leftIcon={<Calendar className="h-4 w-4" />}>
            View Schedule
          </Button>
        </Link>
      }
    >
      {/* Verification Status Banner */}
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Verified Medical Practitioner</h4>
            <p className="text-xs text-emerald-700">
              Your license is authenticated by DocTalk Medical Board. You are actively receiving patient bookings.
            </p>
          </div>
        </div>
        <Badge variant="success" size="md" dot>
          Active
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-brand-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultations
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoading ? <Skeleton className="h-8 w-12" /> : appointments.length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Total booked</p>
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
                Total Patients
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">38</h3>
              <p className="text-xs text-slate-500 mt-1">Unique patients</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Prescriptions
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">2</h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Awaiting sign-off</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultation Earnings
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{formatCurrency(24500)}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Net settled via Stripe/Razorpay</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Today's Patient Schedule</CardTitle>
            <CardDescription>Real-time queue for teleconsultations and reviews</CardDescription>
          </div>
          <Link to="/doctor/appointments" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Full Schedule <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {todayAppointments.map((appt: Appointment) => (
                <div key={appt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 text-xs">
                      {appt.patient?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'PT'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {appt.patient?.name || 'Consultation Patient'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(appt.appointmentDate)} • {formatTimeSlot()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge variant={statusVariantMap[appt.status]} dot>
                      {appt.status}
                    </Badge>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Video className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Starting video consultation session for appt #${appt.id}`)}
                    >
                      Start Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No consultations scheduled today"
              description="You have no patient visits on today's roster. Check your availability slots or profile settings."
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
