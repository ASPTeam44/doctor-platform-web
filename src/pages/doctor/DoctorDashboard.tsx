import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  FileText,
  Building2,
  CalendarCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { doctorApi } from '@/lib/api/doctorApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate, formatAppointmentTime, formatSlotTime } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { DoctorSchedule } from '@/types/doctor';
import { AppointmentDetailsModal } from '@/components/doctor/AppointmentDetailsModal';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // 1. Query Doctor's Appointments
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    isError: isAppointmentsError,
    error: appointmentsError,
  } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'doctor'],
    queryFn: () => appointmentApi.getDoctorAppointments(),
  });

  // 2. Query Doctor's Schedule
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
  } = useQuery<{ schedules: DoctorSchedule[] }>({
    queryKey: ['schedule', 'doctor'],
    queryFn: () => doctorApi.getMySchedule(),
  });

  const appointments: Appointment[] = appointmentsData?.appointments || [];
  const schedules: DoctorSchedule[] = scheduleData?.schedules || [];

  const todayUtcStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // Derived Metrics strictly from server data
  const metrics = useMemo(() => {
    const today = appointments.filter(
      (a) => a.appointmentDate.slice(0, 10) === todayUtcStr
    );
    const pending = appointments.filter((a) => a.status === 'PENDING');
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
    const completed = appointments.filter((a) => a.status === 'COMPLETED');
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED');
    const upcoming = appointments.filter(
      (a) =>
        new Date(a.appointmentDate) >= now &&
        (a.status === 'PENDING' || a.status === 'CONFIRMED')
    );

    // Sort upcoming ascending to find next appointment
    const sortedUpcoming = [...upcoming].sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );

    return {
      todayCount: today.length,
      todayAppointments: today,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      totalBooked: appointments.length,
      nextAppointment: sortedUpcoming[0] || null,
      activeWorkingDays: schedules.filter((s) => s.active).length,
    };
  }, [appointments, schedules, todayUtcStr, now]);

  return (
    <PageContainer
      title={`Dr. ${user?.name || 'Physician'}'s Console`}
      description="Clinical management overview: real-time patient appointments, upcoming telehealth sessions, and weekly availability."
      action={
        <div className="flex items-center gap-2.5">
          <Link to="/doctor/schedule">
            <Button variant="outline" size="md" leftIcon={<Clock className="h-4 w-4" />}>
              Manage Schedule
            </Button>
          </Link>
          <Link to="/doctor/appointments">
            <Button variant="primary" size="md" leftIcon={<Calendar className="h-4 w-4" />}>
              All Appointments
            </Button>
          </Link>
        </div>
      }
    >
      {/* Real Statistics Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Today's Consultations */}
        <Card className="border-l-4 border-l-brand-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Today's Consultations
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoadingAppointments ? <Skeleton className="h-8 w-10" /> : metrics.todayCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Scheduled for today</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Requests
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoadingAppointments ? <Skeleton className="h-8 w-10" /> : metrics.pendingCount}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Awaiting confirmation</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Consultations */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completed Visits
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoadingAppointments ? <Skeleton className="h-8 w-10" /> : metrics.completedCount}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Successfully concluded</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Active Days */}
        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Working Days
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                {isLoadingSchedule ? <Skeleton className="h-8 w-10" /> : `${metrics.activeWorkingDays} / 7`}
              </h3>
              <p className="text-xs text-sky-600 font-medium mt-1">Configured weekly days</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Today's Appointments & Next Up / Schedule Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Patient Queue (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle>Today's Patient Schedule</CardTitle>
                <CardDescription>
                  Real-time consultation queue for today ({formatDate(todayUtcStr)})
                </CardDescription>
              </div>
              <Link
                to="/doctor/appointments"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Full Roster <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAppointments ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : metrics.todayAppointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {metrics.todayAppointments.map((appt: Appointment) => {
                    const patientName = appt.patient?.name || 'Patient';

                    return (
                      <div
                        key={appt.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 text-xs">
                            {patientName
                              .split(' ')
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{patientName}</p>
                            <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{formatAppointmentTime(appt.appointmentDate)} UTC</span>
                              {appt.symptoms && (
                                <span className="text-slate-400 ml-1 truncate max-w-xs">
                                  • {appt.symptoms}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Badge variant={statusVariantMap[appt.status]} size="sm" dot>
                            {appt.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={() => setSelectedAppointment(appt)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={Calendar}
                    title="No consultations scheduled today"
                    description="You have no patient visits on today's roster. Check your availability slots in Schedule."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Next Consultation & Schedule Summary (1/3) */}
        <div className="space-y-6">
          {/* Next Consultation Card */}
          <Card className="border-brand-200 shadow-xs">
            <CardHeader className="bg-brand-50/50 border-b border-brand-100 pb-3">
              <CardTitle className="text-sm text-brand-900 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-brand-600" />
                <span>Next Upcoming Consultation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isLoadingAppointments ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : metrics.nextAppointment ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {metrics.nextAppointment.patient?.name || 'Patient'}
                    </span>
                    <Badge
                      variant={statusVariantMap[metrics.nextAppointment.status]}
                      size="sm"
                      dot
                    >
                      {metrics.nextAppointment.status}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(metrics.nextAppointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {formatAppointmentTime(metrics.nextAppointment.appointmentDate)} UTC
                      </span>
                    </div>
                  </div>

                  {metrics.nextAppointment.symptoms && (
                    <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-100 line-clamp-2">
                      "{metrics.nextAppointment.symptoms}"
                    </p>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center mt-2"
                    onClick={() => setSelectedAppointment(metrics.nextAppointment)}
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View & Manage Appointment
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">
                  No upcoming appointments awaiting review.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Schedule Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <CardTitle className="text-sm">Schedule Summary</CardTitle>
              <Link
                to="/doctor/schedule"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Edit
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              {isLoadingSchedule ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-semibold text-slate-800">{s.dayOfWeek}</span>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                        <span>
                          {formatSlotTime(s.startTime)} - {formatSlotTime(s.endTime)}
                        </span>
                        <Badge variant={s.active ? 'success' : 'neutral'} size="sm">
                          {s.active ? 'Active' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <p className="font-medium text-slate-700">No working hours set</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure your weekly availability so patients can book visits.
                  </p>
                  <Link to="/doctor/schedule" className="inline-block mt-3">
                    <Button variant="outline" size="sm">
                      Set Working Hours
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
      />
    </PageContainer>
  );
};
