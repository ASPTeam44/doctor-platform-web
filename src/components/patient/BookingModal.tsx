import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle2, AlertCircle, Stethoscope, DollarSign, FileText } from 'lucide-react';
import { Doctor, TimeSlot, AvailableSlotsResponse } from '@/types/doctor';
import { Appointment } from '@/types/appointment';
import { doctorApi } from '@/lib/api/doctorApi';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatSlotTime, formatDate } from '@/lib/utils/formatters';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSuccess?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Reset state when doctor or open state changes
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(todayStr);
      setSelectedSlot(null);
      setSymptoms('');
      setErrorMessage(null);
      setBookedAppointment(null);
    }
  }, [isOpen, doctor]);

  // Reset slot when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setErrorMessage(null);
  };

  const doctorId = doctor?.userId || doctor?.user?.id || '';

  // Query Available Slots for selected doctor on selected date
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery<AvailableSlotsResponse>({
    queryKey: ['available-slots', doctorId, selectedDate],
    queryFn: () => doctorApi.getAvailableSlots(doctorId, selectedDate),
    enabled: isOpen && !!doctorId && !!selectedDate,
  });

  const slots = slotsData?.slots || [];
  const hasAvailableSlots = slots.some((s) => s.available);

  // Mutation to book appointment
  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!doctor || !doctorId) throw new Error('No doctor selected.');
      if (!selectedDate) throw new Error('Please select a date.');
      if (!selectedSlot) throw new Error('Please select an available consultation slot.');

      // Build UTC ISO 8601 string: YYYY-MM-DDTHH:mm:00.000Z
      const appointmentDate = `${selectedDate}T${selectedSlot.start}:00.000Z`;

      return await appointmentApi.bookAppointment({
        doctorId,
        appointmentDate,
        symptoms: symptoms.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      setBookedAppointment(data.appointment);
      // Invalidate relevant TanStack queries
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots', doctorId, selectedDate] });
      if (onSuccess) onSuccess(data.appointment);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.message || 'Unable to book appointment. The slot may have just been taken.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    bookMutation.mutate();
  };

  if (!doctor) return null;

  const doctorName = doctor.user?.name || 'Physician';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookedAppointment ? 'Consultation Confirmed' : `Book Consultation with Dr. ${doctorName}`}
      description={
        bookedAppointment
          ? 'Your appointment has been registered and is awaiting confirmation.'
          : `${doctor.specialization} • ${formatCurrency(doctor.consultationFee)} Consultation Fee`
      }
      size="lg"
    >
      {bookedAppointment ? (
        /* Booking Confirmation Receipt Screen */
        <div className="space-y-6 py-2">
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-emerald-900">Appointment Booked Successfully!</h4>
            <p className="mt-1 text-xs text-emerald-700 max-w-sm">
              We have dispatched your consultation request to Dr. {doctorName}.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Doctor</span>
              <span className="font-bold text-slate-900">Dr. {doctorName} ({doctor.specialization})</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Scheduled Date</span>
              <span className="font-semibold text-slate-800">{formatDate(bookedAppointment.appointmentDate)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Scheduled Time</span>
              <span className="font-semibold text-slate-800 font-mono">
                {selectedSlot ? `${formatSlotTime(selectedSlot.start)} - ${formatSlotTime(selectedSlot.end)} UTC` : 'UTC Slot'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Consultation Fee</span>
              <span className="font-bold text-brand-700">{formatCurrency(doctor.consultationFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Initial Status</span>
              <Badge variant="warning" size="sm" dot>
                {bookedAppointment.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                navigate('/patient/appointments');
              }}
              className="w-full sm:w-auto"
            >
              View in My Appointments
            </Button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Doctor Quick Snapshot */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-sm">
                {doctorName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-navy-900">Dr. {doctorName}</p>
                <p className="text-xs text-slate-500">{doctor.qualification || 'MD'} • {doctor.hospitalName || 'DocTalk Telehealth'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Standard Fee</span>
              <span className="text-sm font-bold text-brand-700">{formatCurrency(doctor.consultationFee)}</span>
            </div>
          </div>

          {/* Step 1: Select Consultation Date */}
          <div className="space-y-2">
            <label htmlFor="appointment-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              1. Select Consultation Date
            </label>
            <div className="relative max-w-xs">
              <input
                id="appointment-date"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Step 2: Select Available Slot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Select Available Time Slot ({slotsData?.dayOfWeek || 'Day'} • {slotsData?.timezone || 'UTC'})
              </label>
              {selectedSlot && (
                <span className="text-xs font-semibold text-brand-700">
                  Selected: {formatSlotTime(selectedSlot.start)} - {formatSlotTime(selectedSlot.end)}
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="flex items-center justify-center p-8 rounded-xl border border-dashed border-slate-200">
                <Spinner size="md" variant="primary" />
                <span className="ml-3 text-xs text-slate-500">Checking doctor's real-time schedule...</span>
              </div>
            ) : slotsError ? (
              <Alert variant="error">
                Failed to load doctor slots for this date. Please select another date.
              </Alert>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
                <Clock className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No consultation slots configured for {slotsData?.dayOfWeek || 'this day'}.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dr. {doctorName} does not accept visits on this day. Please select a different day.
                </p>
              </div>
            ) : !hasAvailableSlots ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center">
                <p className="text-xs font-semibold text-amber-800">
                  All consultation slots on this date are fully booked or past.
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Please pick another upcoming date to find available appointments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        !slot.available
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20 shadow-xs font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono text-xs">
                        {formatSlotTime(slot.start)} - {formatSlotTime(slot.end)}
                      </span>
                      <span className="text-[10px] mt-0.5">
                        {slot.available ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Optional Clinical Symptoms */}
          <div className="space-y-2">
            <label htmlFor="symptoms" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              3. Clinical Symptoms or Reason for Visit <span className="text-slate-400 normal-case">(Optional)</span>
            </label>
            <textarea
              id="symptoms"
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Briefly describe what you'd like to consult the doctor about (e.g. persistent cough for 4 days, follow-up on medication, etc.)..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={bookMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedSlot || !selectedSlot.available || bookMutation.isPending}
              isLoading={bookMutation.isPending}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Confirm Appointment ({formatCurrency(doctor.consultationFee)})
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
