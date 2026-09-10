import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Video, MessageSquare } from 'lucide-react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTimeSlot, formatCurrency } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const PatientAppointmentsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'patient'],
    queryFn: () => appointmentApi.getPatientAppointments(),
  });

  const appointments: Appointment[] = data?.appointments || [];

  const filteredAppointments = appointments.filter((appt: Appointment) => {
    if (filterStatus === 'ALL') return true;
    return appt.status === filterStatus;
  });

  return (
    <PageContainer
      title="My Appointments"
      description="View past consultations and manage your upcoming telehealth appointments."
    >
      {/* Filter Tabs */}
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
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : filteredAppointments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Telehealth Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appt: Appointment) => (
              <TableRow key={appt.id}>
                <TableCell className="font-semibold text-slate-900">
                  Dr. {appt.doctor?.name || 'Physician'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {appt.doctor?.doctorProfile?.specialization || 'Consultant'}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-medium text-slate-800">{formatDate(appt.appointmentDate)}</div>
                  <div className="text-xs text-slate-500">{formatTimeSlot()}</div>
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  {formatCurrency(appt.doctor?.doctorProfile?.consultationFee || 500)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[appt.status]} dot>
                    {appt.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Video className="h-3.5 w-3.5" />}
                        onClick={() => alert(`Connecting to WebRTC consultation session for appt #${appt.id}`)}
                      >
                        Join Call
                      </Button>
                    )}
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
          description="There are no consultations matching your selected status filter."
          actionLabel="Find a Doctor"
          onAction={() => window.location.assign('/patient/doctors')}
        />
      )}
    </PageContainer>
  );
};
