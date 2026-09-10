import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Video, MessageSquare } from 'lucide-react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTimeSlot } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const DoctorAppointmentsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'doctor'],
    queryFn: () => appointmentApi.getDoctorAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];

  const filteredAppointments = appointments.filter((appt: Appointment) => {
    if (filterStatus === 'ALL') return true;
    return appt.status === filterStatus;
  });

  return (
    <PageContainer
      title="Doctor Appointment Roster"
      description="Manage patient bookings, start encrypted telehealth sessions, and update appointment records."
    >
      <div className="flex flex-wrap gap-2 mb-6">
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

      {isLoading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredAppointments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appt: Appointment) => (
              <TableRow key={appt.id}>
                <TableCell className="font-semibold text-slate-900">
                  {appt.patient?.name || 'Patient'}
                </TableCell>
                <TableCell className="text-slate-700">{formatDate(appt.appointmentDate)}</TableCell>
                <TableCell className="text-slate-600">{formatTimeSlot()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[appt.status]} dot>
                    {appt.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Video className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Starting video consultation session for appt #${appt.id}`)}
                    >
                      Connect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Opening secure messaging channel for appt #${appt.id}`)}
                    >
                      Chat
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="There are currently no patient consultations matching this filter."
        />
      )}
    </PageContainer>
  );
};
