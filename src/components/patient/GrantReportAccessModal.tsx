import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, UserCheck, CheckCircle2, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { MedicalReport } from '@/types/report';
import { Appointment } from '@/types/appointment';
import { reportApi } from '@/lib/api/reportApi';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { formatDate } from '@/lib/utils/formatters';

export interface GrantReportAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MedicalReport | null;
}

export const GrantReportAccessModal: React.FC<GrantReportAccessModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const queryClient = useQueryClient();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch patient's appointments to easily choose their treating doctor
  const { data: appointmentsData } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'patient'],
    queryFn: () => appointmentApi.getPatientAppointments(),
    enabled: isOpen,
  });

  const appointments = appointmentsData?.appointments || [];
  // Unique doctors from appointments
  const doctorMap = new Map<string, { id: string; name: string; specialty: string }>();
  appointments.forEach((a) => {
    if (a.doctorId && a.doctor?.name) {
      doctorMap.set(a.doctorId, {
        id: a.doctorId,
        name: a.doctor.name,
        specialty: a.doctor.doctorProfile?.specialization || 'Doctor',
      });
    }
  });
  const eligibleDoctors = Array.from(doctorMap.values());

  const grantMutation = useMutation({
    mutationFn: async () => {
      if (!report) throw new Error('No report selected.');
      if (!selectedDoctorId) throw new Error('Please select a doctor to grant access.');

      return await reportApi.grantReportAccess(report.id, {
        doctorId: selectedDoctorId,
        appointmentId: selectedAppointmentId || undefined,
      });
    },
    onSuccess: () => {
      setSuccessMessage('Doctor access successfully granted.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['reports', 'my-reports'] });
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to grant doctor access.');
    },
  });

  if (!report) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    grantMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Report with Physician"
      description={`Grant secure temporary access to "${report.title}"`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
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

        <div className="p-3 rounded-xl border border-brand-200 bg-brand-50/60 flex items-start gap-2.5 text-xs text-brand-900 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <span>
            Only verified DocTalk physicians with whom you have scheduled visits will be able to review your encrypted clinical report. You can revoke access at any time.
          </span>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="select-doctor" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Select Treating Doctor
          </label>
          {eligibleDoctors.length > 0 ? (
            <select
              id="select-doctor"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Choose a doctor from your visits --</option>
              {eligibleDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.name} ({doc.specialty})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              You haven't scheduled appointments with any doctors yet. Please book a doctor consultation first to share your reports.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!selectedDoctorId || grantMutation.isPending}
            isLoading={grantMutation.isPending}
            leftIcon={<UserCheck className="h-4 w-4" />}
          >
            Grant Access
          </Button>
        </div>
      </form>
    </Modal>
  );
};
