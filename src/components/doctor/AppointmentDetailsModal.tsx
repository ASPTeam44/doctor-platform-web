import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Video,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { formatDate, formatAppointmentTime } from '@/lib/utils/formatters';

export interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const statusVariantMap: Record<AppointmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<AppointmentStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: async (targetStatus: AppointmentStatus) => {
      if (!appointment) throw new Error('No appointment selected');
      return await appointmentApi.updateStatus(appointment.id, targetStatus);
    },
    onSuccess: (data, variables) => {
      setSuccessMessage(`Appointment status successfully updated to ${variables}.`);
      setErrorMessage(null);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update appointment status.');
      setConfirmAction(null);
    },
  });

  if (!appointment) return null;

  const patientName = appointment.patient?.name || 'Patient';
  const patientEmail = appointment.patient?.email;
  const patientPhone = appointment.patient?.phone;
  const symptoms = appointment.symptoms;

  const isPending = appointment.status === 'PENDING';
  const isConfirmed = appointment.status === 'CONFIRMED';
  const isCompleted = appointment.status === 'COMPLETED';
  const isCancelled = appointment.status === 'CANCELLED';

  const handleStatusChange = (status: AppointmentStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (status === 'CANCELLED' || status === 'COMPLETED') {
      setConfirmAction(status);
    } else {
      statusMutation.mutate(status);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      statusMutation.mutate(confirmAction);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmAction(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        onClose();
      }}
      title={`Consultation #${appointment.id.slice(-8)}`}
      description={`Scheduled with ${patientName}`}
      size="md"
    >
      <div className="space-y-5 py-1">
        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Confirmation Overlay for Destructive / Terminal Actions */}
        {confirmAction ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-3 text-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">
                  {confirmAction === 'CANCELLED'
                    ? 'Confirm Appointment Cancellation'
                    : 'Confirm Consultation Completion'}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {confirmAction === 'CANCELLED'
                    ? 'Are you sure you want to cancel this consultation? This action cannot be undone.'
                    : 'Are you sure you want to mark this consultation as completed?'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={statusMutation.isPending}
              >
                Go Back
              </Button>
              <Button
                variant={confirmAction === 'CANCELLED' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirmAction}
                isLoading={statusMutation.isPending}
              >
                {confirmAction === 'CANCELLED' ? 'Yes, Cancel' : 'Yes, Mark Complete'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Status & Date Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {formatDate(appointment.appointmentDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatAppointmentTime(appointment.appointmentDate)} UTC</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <Badge variant={statusVariantMap[appointment.status]} size="md" dot>
                  {appointment.status}
                </Badge>
              </div>
            </div>

            {/* Patient Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Patient Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900">{patientName}</span>
                </div>
                {patientEmail && (
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-mono">{patientEmail}</span>
                  </div>
                )}
                {patientPhone && (
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{patientPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Symptoms Note */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                <span>Patient Note / Symptoms</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {symptoms || <span className="text-slate-400 italic">No symptoms or clinical reason provided by patient.</span>}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={statusMutation.isPending}
              >
                Close
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {isPending && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={statusMutation.isPending}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleStatusChange('CONFIRMED')}
                      isLoading={statusMutation.isPending}
                    >
                      Confirm Appointment
                    </Button>
                  </>
                )}

                {isConfirmed && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Video className="h-4 w-4" />}
                      onClick={() => alert(`Starting encrypted video consultation for #${appointment.id}`)}
                    >
                      Join Call
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={statusMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleStatusChange('COMPLETED')}
                      isLoading={statusMutation.isPending}
                    >
                      Mark as Completed
                    </Button>
                  </>
                )}

                {(isCompleted || isCancelled) && (
                  <span className="text-xs text-slate-400 italic">
                    This consultation has concluded ({appointment.status.toLowerCase()}).
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
