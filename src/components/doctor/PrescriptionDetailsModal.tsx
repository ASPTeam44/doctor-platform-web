import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  User,
  Calendar,
  Clock,
  Pill,
  CheckCircle2,
  XCircle,
  Edit2,
  AlertTriangle,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Prescription, PrescriptionStatus } from '@/types/prescription';
import { prescriptionApi } from '@/lib/api/prescriptionApi';
import { formatDate } from '@/lib/utils/formatters';

export interface PrescriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  onEditDraft?: (prescription: Prescription) => void;
}

const statusVariantMap: Record<PrescriptionStatus, BadgeVariant> = {
  DRAFT: 'warning',
  ISSUED: 'success',
  CANCELLED: 'danger',
};

export const PrescriptionDetailsModal: React.FC<PrescriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  prescription,
  onEditDraft,
}) => {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'ISSUE' | 'CANCEL' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!prescription) throw new Error('No prescription selected.');
      return await prescriptionApi.issuePrescription(prescription.id);
    },
    onSuccess: () => {
      setSuccessMessage('Prescription finalized and digitally issued to patient.');
      setErrorMessage(null);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', prescription?.id] });
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to issue prescription.');
      setConfirmAction(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!prescription) throw new Error('No prescription selected.');
      return await prescriptionApi.cancelPrescription(prescription.id);
    },
    onSuccess: () => {
      setSuccessMessage('Prescription cancelled successfully.');
      setErrorMessage(null);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', prescription?.id] });
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to cancel prescription.');
      setConfirmAction(null);
    },
  });

  if (!prescription) return null;

  const isDraft = prescription.status === 'DRAFT';
  const isIssued = prescription.status === 'ISSUED';
  const isCancelled = prescription.status === 'CANCELLED';

  const handlePrint = () => {
    window.print();
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
      title={`E-Prescription #${prescription.id.slice(-8).toUpperCase()}`}
      description={`Patient: ${prescription.patient?.name || 'Patient'}`}
      size="lg"
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

        {/* Confirmation Dialogs */}
        {confirmAction && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-3 text-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">
                  {confirmAction === 'ISSUE'
                    ? 'Confirm Issuing E-Prescription'
                    : 'Confirm Prescription Cancellation'}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {confirmAction === 'ISSUE'
                    ? 'Finalizing will digitally sign and release this prescription to the patient. Once issued, clinical medicines cannot be edited.'
                    : 'Cancelling this prescription will prevent the patient from fulfilling it at pharmacies. This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={issueMutation.isPending || cancelMutation.isPending}
              >
                Go Back
              </Button>
              {confirmAction === 'ISSUE' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => issueMutation.mutate()}
                  isLoading={issueMutation.isPending}
                >
                  Yes, Issue Prescription
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelMutation.mutate()}
                  isLoading={cancelMutation.isPending}
                >
                  Yes, Cancel Prescription
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Prescription Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <Badge variant={statusVariantMap[prescription.status]} size="md" dot>
                {prescription.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Created on {formatDate(prescription.createdAt)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 sm:text-right">
            <p className="font-bold text-slate-900">
              Patient: {prescription.patient?.name || 'Patient'}
            </p>
            {prescription.patient?.email && (
              <p className="text-[11px] text-slate-500 font-mono">{prescription.patient.email}</p>
            )}
          </div>
        </div>

        {/* Diagnosis & Notes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium block">Clinical Diagnosis:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{prescription.diagnosis}</p>
          </div>

          {prescription.clinicalNotes && (
            <div className="border-t border-slate-100 pt-2.5">
              <span className="text-slate-500 font-medium block">Clinical Notes:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{prescription.clinicalNotes}</p>
            </div>
          )}

          {prescription.instructions && (
            <div className="border-t border-slate-100 pt-2.5">
              <span className="text-slate-500 font-medium block">Advice & Patient Guidance:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{prescription.instructions}</p>
            </div>
          )}
        </div>

        {/* Itemized Medicine Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Prescribed Medications ({prescription.items.length})
          </h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-900">
                      {it.medicineName} {it.strength && <span className="text-xs font-normal text-slate-500">({it.strength})</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">{it.dosage}</TableCell>
                    <TableCell className="text-xs text-slate-700">{it.frequency}</TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {it.duration} {it.durationUnit?.toLowerCase() || 'days'}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-slate-800">
                      {it.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {it.instructions || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isIssued && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
            )}

            {isDraft && (
              <>
                {onEditDraft && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={() => {
                      onClose();
                      onEditDraft(prescription);
                    }}
                  >
                    Edit Draft
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<XCircle className="h-4 w-4" />}
                  onClick={() => setConfirmAction('CANCEL')}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => setConfirmAction('ISSUE')}
                >
                  Issue to Patient
                </Button>
              </>
            )}

            {isIssued && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-4 w-4" />}
                onClick={() => setConfirmAction('CANCEL')}
              >
                Cancel Prescription
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
