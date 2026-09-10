import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  XCircle,
  Building2,
  Plus,
} from 'lucide-react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatAppointmentTime, formatCurrency } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const PatientAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Fetch Patient's appointments
  const { data, isLoading, isError, error, refetch } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'patient'],
    queryFn: () => appointmentApi.getPatientAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];

  // Filter appointments
  const filteredAppointments = appointments.filter((appt: Appointment) => {
    if (filterStatus === 'ALL') return true;
    return appt.status === filterStatus;
  });

  // Cancellation mutation
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await appointmentApi.updateStatus(appointmentId, 'CANCELLED');
    },
    onSuccess: (res) => {
      setActionSuccessMessage('Your appointment has been successfully cancelled.');
      setActionErrorMessage(null);
      setAppointmentToCancel(null);
      // Invalidate queries to refresh state immediately from server
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
    },
    onError: (err: any) => {
      setActionErrorMessage(
        err.message || 'Failed to cancel appointment. It may already be completed or cancelled.'
      );
      setAppointmentToCancel(null);
    },
  });

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      cancelMutation.mutate(appointmentToCancel.id);
    }
  };

  return (
    <PageContainer
      title="My Consultations & Appointments"
      description="Manage scheduled visits with your physicians, access teleconsultations, or cancel upcoming bookings."
      action={
        <Link to="/patient/doctors">
          <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
            Book New Appointment
          </Button>
        </Link>
      }
    >
      {/* Feedback Alerts */}
      {actionSuccessMessage && (
        <Alert variant="success" className="mb-6" onClose={() => setActionSuccessMessage(null)}>
          {actionSuccessMessage}
        </Alert>
      )}

      {actionErrorMessage && (
        <Alert variant="error" className="mb-6" onClose={() => setActionErrorMessage(null)}>
          {actionErrorMessage}
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filterStatus === status
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : isError ? (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{(error as any)?.message || 'Failed to load appointments.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : filteredAppointments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor & Specialization</TableHead>
              <TableHead>Date & Time (UTC)</TableHead>
              <TableHead>Clinical Note</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appt: Appointment) => {
              const doctorName = appt.doctor?.name || 'Physician';
              const specialty = appt.doctor?.doctorProfile?.specialization || 'Consultant';
              const hospital = appt.doctor?.doctorProfile?.hospitalName;
              const fee = appt.doctor?.doctorProfile?.consultationFee;
              const canCancel = appt.status === 'PENDING' || appt.status === 'CONFIRMED';

              return (
                <TableRow key={appt.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">Dr. {doctorName}</div>
                    <div className="text-xs text-brand-700 font-medium">{specialty}</div>
                    {hospital && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        <span>{hospital}</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-semibold text-slate-800">
                      {formatDate(appt.appointmentDate)}
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{formatAppointmentTime(appt.appointmentDate)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs">
                    <p className="text-xs text-slate-600 truncate" title={appt.symptoms || 'None'}>
                      {appt.symptoms || <span className="text-slate-400 italic">No notes provided</span>}
                    </p>
                  </TableCell>

                  <TableCell className="font-semibold text-slate-800 text-xs">
                    {fee ? formatCurrency(fee) : '₹500.00'}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariantMap[appt.status]} size="sm" dot>
                      {appt.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {appt.status === 'CONFIRMED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Video className="h-3.5 w-3.5" />}
                          onClick={() => alert(`Starting video consultation session for appt #${appt.id}`)}
                        >
                          Join Call
                        </Button>
                      )}

                      {canCancel && (
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          onClick={() => setAppointmentToCancel(appt)}
                        >
                          Cancel
                        </Button>
                      )}

                      {!canCancel && appt.status === 'CANCELLED' && (
                        <span className="text-xs text-slate-400 italic">Cancelled</span>
                      )}

                      {!canCancel && appt.status === 'COMPLETED' && (
                        <span className="text-xs text-emerald-600 font-medium">Completed</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            filterStatus === 'ALL'
              ? "You don't have any consultation appointments yet. Browse verified specialist doctors to book your first visit."
              : `There are currently no appointments matching status "${filterStatus}".`
          }
          actionLabel="Find a Doctor"
          onAction={() => window.location.assign('/patient/doctors')}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this scheduled consultation?"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppointmentToCancel(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={cancelMutation.isPending}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Yes, Cancel Appointment
            </Button>
          </>
        }
      >
        {appointmentToCancel && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Cancellation is irrevocable</p>
                <p className="mt-0.5 leading-relaxed">
                  Cancelling will immediately release this consultation slot for Dr.{' '}
                  {appointmentToCancel.doctor?.name || 'the doctor'}.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-800">
                  Dr. {appointmentToCancel.doctor?.name || 'Physician'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(appointmentToCancel.appointmentDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time (UTC):</span>
                <span className="font-mono text-slate-800">
                  {formatAppointmentTime(appointmentToCancel.appointmentDate)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
