import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle2, AlertCircle, Pill, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  Prescription,
  CreatePrescriptionItemInput,
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
} from '@/types/prescription';
import { Appointment } from '@/types/appointment';
import { prescriptionApi } from '@/lib/api/prescriptionApi';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { formatDate } from '@/lib/utils/formatters';

export interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPrescription?: Prescription | null;
  preselectedAppointmentId?: string;
  preselectedPatientName?: string;
  onSuccess?: (prescription: Prescription) => void;
}

const DEFAULT_ITEM: CreatePrescriptionItemInput = {
  medicineName: '',
  strength: '',
  dosage: '1 tablet',
  frequency: 'Twice daily',
  duration: 7,
  durationUnit: 'DAYS',
  route: 'ORAL',
  instructions: 'Take after meals',
  quantity: 14,
};

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  existingPrescription,
  preselectedAppointmentId,
  preselectedPatientName,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!existingPrescription;

  const [appointmentId, setAppointmentId] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [items, setItems] = useState<CreatePrescriptionItemInput[]>([{ ...DEFAULT_ITEM }]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load doctor's appointments to allow selecting eligible appointments
  const { data: appointmentsData } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments', 'doctor'],
    queryFn: () => appointmentApi.getDoctorAppointments(),
    enabled: isOpen && !isEditing && !preselectedAppointmentId,
  });

  const eligibleAppointments = (appointmentsData?.appointments || []).filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED'
  );

  useEffect(() => {
    if (isOpen) {
      if (existingPrescription) {
        setAppointmentId(existingPrescription.appointmentId);
        setDiagnosis(existingPrescription.diagnosis);
        setClinicalNotes(existingPrescription.clinicalNotes || '');
        setInstructions(existingPrescription.instructions || '');
        setItems(
          existingPrescription.items.map((it) => ({
            medicineName: it.medicineName,
            strength: it.strength || '',
            dosage: it.dosage,
            frequency: it.frequency,
            duration: it.duration,
            durationUnit: it.durationUnit || 'DAYS',
            route: it.route || 'ORAL',
            instructions: it.instructions || '',
            quantity: it.quantity,
          }))
        );
      } else {
        setAppointmentId(preselectedAppointmentId || '');
        setDiagnosis('');
        setClinicalNotes('');
        setInstructions('');
        setItems([{ ...DEFAULT_ITEM }]);
      }
      setErrorMessage(null);
    }
  }, [isOpen, existingPrescription, preselectedAppointmentId]);

  // Handle items array changes
  const handleItemChange = (index: number, field: keyof CreatePrescriptionItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { ...DEFAULT_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Mutation for creating / updating prescription
  const saveMutation = useMutation({
    mutationFn: async (targetStatus?: 'DRAFT' | 'ISSUED') => {
      if (!appointmentId.trim()) {
        throw new Error('Please select an appointment for this prescription.');
      }
      if (!diagnosis.trim()) {
        throw new Error('Clinical diagnosis is required.');
      }
      if (items.length === 0) {
        throw new Error('At least one prescription medicine item is required.');
      }

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.medicineName.trim()) {
          throw new Error(`Item #${i + 1}: Medicine name is required.`);
        }
        if (!it.dosage.trim()) {
          throw new Error(`Item #${i + 1}: Dosage is required.`);
        }
        if (!it.frequency.trim()) {
          throw new Error(`Item #${i + 1}: Frequency is required.`);
        }
        if (it.duration <= 0) {
          throw new Error(`Item #${i + 1}: Duration must be greater than 0.`);
        }
        if (it.quantity <= 0) {
          throw new Error(`Item #${i + 1}: Quantity must be greater than 0.`);
        }
      }

      if (isEditing && existingPrescription) {
        const payload: UpdatePrescriptionPayload = {
          diagnosis: diagnosis.trim(),
          clinicalNotes: clinicalNotes.trim() || undefined,
          instructions: instructions.trim() || undefined,
          items,
        };
        const res = await prescriptionApi.updatePrescription(existingPrescription.id, payload);
        return res.prescription;
      } else {
        const payload: CreatePrescriptionPayload = {
          appointmentId: appointmentId.trim(),
          diagnosis: diagnosis.trim(),
          clinicalNotes: clinicalNotes.trim() || undefined,
          instructions: instructions.trim() || undefined,
          status: targetStatus || 'DRAFT',
          items,
        };
        const res = await prescriptionApi.createPrescription(payload);
        return res.prescription;
      }
    },
    onSuccess: (prescription) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', prescription.id] });
      if (onSuccess) onSuccess(prescription);
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to save digital prescription.');
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Draft Prescription' : 'Create Digital E-Prescription'}
      description={
        preselectedPatientName
          ? `Prescribing for patient: ${preselectedPatientName}`
          : 'Prescribe pharmaceutical medications linked to an authorized consultation.'
      }
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate('DRAFT');
        }}
        className="space-y-5 py-1"
      >
        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* 1. Appointment Selection */}
        <div className="space-y-1.5">
          <label
            htmlFor="rx-appointment"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            1. Linked Consultation Appointment
          </label>
          {preselectedAppointmentId || isEditing ? (
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 flex items-center justify-between">
              <span>Appointment #{appointmentId.slice(-8)}</span>
              <span className="text-[11px] font-sans font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                Eligible Consultation
              </span>
            </div>
          ) : (
            <select
              id="rx-appointment"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Select an eligible appointment --</option>
              {eligibleAppointments.map((appt) => (
                <option key={appt.id} value={appt.id}>
                  {appt.patient?.name || 'Patient'} • {formatDate(appt.appointmentDate)} (
                  {appt.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 2. Clinical Diagnosis */}
        <div className="space-y-1.5">
          <label
            htmlFor="rx-diagnosis"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            2. Clinical Diagnosis <span className="text-rose-500">*</span>
          </label>
          <input
            id="rx-diagnosis"
            type="text"
            placeholder="e.g. Acute Pharyngitis, Essential Hypertension"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* 3. Prescription Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              3. Medications & Dosage ({items.length})
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={handleAddItem}
            >
              Add Medicine
            </Button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Pill className="h-3.5 w-3.5 text-brand-600" />
                    <span>Medicine #{idx + 1}</span>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove medicine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Amoxicillin)"
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Strength (e.g. 500mg)"
                      value={item.strength || ''}
                      onChange={(e) => handleItemChange(idx, 'strength', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tab"
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2x Daily"
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                      Duration
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        value={item.duration}
                        onChange={(e) => handleItemChange(idx, 'duration', parseInt(e.target.value, 10) || 1)}
                        required
                        className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
                      />
                      <select
                        value={item.durationUnit || 'DAYS'}
                        onChange={(e) => handleItemChange(idx, 'durationUnit', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-1 text-[11px] text-slate-900"
                      >
                        <option value="DAYS">Days</option>
                        <option value="WEEKS">Weeks</option>
                        <option value="MONTHS">Months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                      Total Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Specific Instructions (e.g. Take after food, avoid dairy)"
                    value={item.instructions || ''}
                    onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Clinical Notes & Advice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="rx-clinicalNotes"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Clinical Notes <span className="text-slate-400 normal-case">(Optional)</span>
            </label>
            <textarea
              id="rx-clinicalNotes"
              rows={2}
              placeholder="Clinical observation, symptoms..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="rx-instructions"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              General Advice <span className="text-slate-400 normal-case">(Optional)</span>
            </label>
            <textarea
              id="rx-instructions"
              rows={2}
              placeholder="Lifestyle guidance, follow-up..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>

          {isEditing ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Save Draft Changes
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={saveMutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => saveMutation.mutate('ISSUED')}
                isLoading={saveMutation.isPending}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Finalize & Issue
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
