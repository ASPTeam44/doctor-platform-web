import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Filter,
  Pill,
  FolderHeart,
} from 'lucide-react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { formatDate, formatAppointmentTime } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { AppointmentDetailsModal } from '@/components/doctor/AppointmentDetailsModal';
import { PrescriptionModal } from '@/components/doctor/PrescriptionModal';
import { PatientReportsModal } from '@/components/doctor/PatientReportsModal';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

type TimeFilter = 'ALL' | 'TODAY' | 'UPCOMING' | 'PAST';

export const DoctorAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescribeAppointment, setPrescribeAppointment] = useState<Appointment | null>(null);
  const [viewReportsPatient, setViewReportsPatient] = useState<{ id: string; name: string } | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Fetch all doctor appointments
  const { data, isLoading, isError, error, refetch } = useQuery<{
    appointments: Appointment[];
  }>({
    queryKey: ['appointments', 'doctor'],
    queryFn: () => appointmentApi.getDoctorAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];

  // Quick Status Transition Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      return await appointmentApi.updateStatus(id, status);
    },
    onSuccess: (_, variables) => {
      setFeedbackSuccess(`Appointment marked as ${variables.status}.`);
      setFeedbackError(null);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
    },
    onError: (err: any) => {
      setFeedbackError(err.message || 'Failed to update appointment status.');
    },
  });

  // Calculate today in UTC: YYYY-MM-DD
  const todayUtcStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // Status Counts
  const counts = useMemo(() => {
    return {
      ALL: appointments.length,
      PENDING: appointments.filter((a) => a.status === 'PENDING').length,
      CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
      COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Status Filter
      if (filterStatus !== 'ALL' && appt.status !== filterStatus) {
        return false;
      }

      // 2. Time Filter
      const apptDateStr = appt.appointmentDate.slice(0, 10);
      const apptDate = new Date(appt.appointmentDate);

      if (timeFilter === 'TODAY') {
        if (apptDateStr !== todayUtcStr) return false;
      } else if (timeFilter === 'UPCOMING') {
        if (apptDate < now || appt.status === 'COMPLETED' || appt.status === 'CANCELLED') {
          return false;
        }
      } else if (timeFilter === 'PAST') {
        if (apptDate >= now && appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED') {
          return false;
        }
      }

      // 3. Search Term (patient name or email)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const patientName = (appt.patient?.name || '').toLowerCase();
        const patientEmail = (appt.patient?.email || '').toLowerCase();
        if (!patientName.includes(query) && !patientEmail.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, filterStatus, timeFilter, searchTerm, todayUtcStr, now]);

  return (
    <PageContainer
      title="Appointment Management"
      description="Review patient consultations, accept bookings, verify symptoms, and update clinical appointment statuses."
    >
      {/* Feedback Alerts */}
      {feedbackSuccess && (
        <Alert variant="success" className="mb-6" onClose={() => setFeedbackSuccess(null)}>
          {feedbackSuccess}
        </Alert>
      )}

      {feedbackError && (
        <Alert variant="error" className="mb-6" onClose={() => setFeedbackError(null)}>
          {feedbackError}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filterStatus === status
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {counts[status]}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <Input
              id="patient-search"
              placeholder="Search by patient name..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Secondary Time Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            Timeframe:
          </span>
          {(['ALL', 'TODAY', 'UPCOMING', 'PAST'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeFilter(t)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                timeFilter === t
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL'
                ? 'All Time'
                : t === 'TODAY'
                ? "Today's"
                : t === 'UPCOMING'
                ? 'Upcoming'
                : 'Past/Completed'}
            </button>
          ))}
        </div>
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
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Date & Time (UTC)</TableHead>
                  <TableHead>Clinical Note</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt: Appointment) => {
                  const patientName = appt.patient?.name || 'Patient';
                  const isPending = appt.status === 'PENDING';
                  const isConfirmed = appt.status === 'CONFIRMED';

                  return (
                    <TableRow key={appt.id}>
                      <TableCell>
                        <div className="font-bold text-slate-900">{patientName}</div>
                        {appt.patient?.email && (
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {appt.patient.email}
                          </div>
                        )}
                        {appt.patient?.phone && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {appt.patient.phone}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-semibold text-slate-800">
                          {formatDate(appt.appointmentDate)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatAppointmentTime(appt.appointmentDate)} UTC</span>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <p
                          className="text-xs text-slate-600 truncate"
                          title={appt.symptoms || 'None'}
                        >
                          {appt.symptoms || (
                            <span className="text-slate-400 italic">No notes provided</span>
                          )}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Badge variant={statusVariantMap[appt.status]} size="sm" dot>
                          {appt.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                onClick={() =>
                                  statusMutation.mutate({ id: appt.id, status: 'CONFIRMED' })
                                }
                                disabled={statusMutation.isPending}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                                onClick={() =>
                                  statusMutation.mutate({ id: appt.id, status: 'CANCELLED' })
                                }
                                disabled={statusMutation.isPending}
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {isConfirmed && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Video className="h-3.5 w-3.5" />}
                                onClick={() =>
                                  alert(`Starting video consultation for #${appt.id}`)
                                }
                              >
                                Join
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                onClick={() =>
                                  statusMutation.mutate({ id: appt.id, status: 'COMPLETED' })
                                }
                                disabled={statusMutation.isPending}
                              >
                                Complete
                              </Button>
                            </>
                          )}

                          {(isConfirmed || appt.status === 'COMPLETED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Pill className="h-3.5 w-3.5 text-brand-600" />}
                              onClick={() => setPrescribeAppointment(appt)}
                            >
                              Prescribe
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FolderHeart className="h-3.5 w-3.5 text-blue-600" />}
                            onClick={() =>
                              setViewReportsPatient({
                                id: appt.patientId,
                                name: appt.patient?.name || 'Patient',
                              })
                            }
                          >
                            Reports
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={() => setSelectedAppointment(appt)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAppointments.map((appt) => {
              const patientName = appt.patient?.name || 'Patient';
              const isPending = appt.status === 'PENDING';
              const isConfirmed = appt.status === 'CONFIRMED';

              return (
                <Card key={appt.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{patientName}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {formatDate(appt.appointmentDate)} • {formatAppointmentTime(appt.appointmentDate)} UTC
                      </p>
                    </div>
                    <Badge variant={statusVariantMap[appt.status]} size="sm" dot>
                      {appt.status}
                    </Badge>
                  </div>

                  {appt.symptoms && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                      {appt.symptoms}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setViewReportsPatient({
                          id: appt.patientId,
                          name: appt.patient?.name || 'Patient',
                        })
                      }
                    >
                      Reports
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppointment(appt)}
                    >
                      Details
                    </Button>
                    {(isConfirmed || appt.status === 'COMPLETED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrescribeAppointment(appt)}
                      >
                        Prescribe
                      </Button>
                    )}
                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({ id: appt.id, status: 'CONFIRMED' })
                        }
                        disabled={statusMutation.isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    {isConfirmed && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({ id: appt.id, status: 'COMPLETED' })
                        }
                        disabled={statusMutation.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            filterStatus === 'ALL'
              ? 'No patient consultations currently booked. Share your profile or ensure active working hours in Schedule.'
              : `No appointments currently match status "${filterStatus}".`
          }
        />
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
      />

      {/* Prescription Modal */}
      {prescribeAppointment && (
        <PrescriptionModal
          isOpen={!!prescribeAppointment}
          onClose={() => setPrescribeAppointment(null)}
          preselectedAppointmentId={prescribeAppointment.id}
          preselectedPatientName={prescribeAppointment.patient?.name}
          onSuccess={() => {
            setFeedbackSuccess(`Prescription saved for appointment #${prescribeAppointment.id.slice(-6)}.`);
            setPrescribeAppointment(null);
          }}
        />
      )}

      {/* Patient Reports Modal */}
      {viewReportsPatient && (
        <PatientReportsModal
          isOpen={!!viewReportsPatient}
          onClose={() => setViewReportsPatient(null)}
          patientId={viewReportsPatient.id}
          patientName={viewReportsPatient.name}
        />
      )}
    </PageContainer>
  );
};
