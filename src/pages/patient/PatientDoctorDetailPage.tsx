import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Award,
  DollarSign,
  Building2,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  Video,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { doctorApi } from '@/lib/api/doctorApi';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Doctor, TimeSlot, AvailableSlotsResponse } from '@/types/doctor';
import { formatCurrency, formatSlotTime, formatDate } from '@/lib/utils/formatters';

export const PatientDoctorDetailPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Fetch doctor profile
  const {
    data: doctor,
    isLoading: isLoadingDoctor,
    isError: isDoctorError,
    error: doctorError,
  } = useQuery<Doctor | null>({
    queryKey: ['doctor', doctorId],
    queryFn: () => (doctorId ? doctorApi.getDoctorById(doctorId) : Promise.resolve(null)),
    enabled: !!doctorId,
  });

  const validDoctorUserId = doctor?.userId || doctor?.user?.id || doctorId || '';

  // Query Available Slots for selected doctor on selected date
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery<AvailableSlotsResponse>({
    queryKey: ['available-slots', validDoctorUserId, selectedDate],
    queryFn: () => doctorApi.getAvailableSlots(validDoctorUserId, selectedDate),
    enabled: !!validDoctorUserId && !!selectedDate,
  });

  const slots = slotsData?.slots || [];
  const hasAvailableSlots = slots.some((s) => s.available);

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!validDoctorUserId) throw new Error('Doctor identification missing.');
      if (!selectedSlot) throw new Error('Please choose a consultation slot.');

      const appointmentDate = `${selectedDate}T${selectedSlot.start}:00.000Z`;

      return await appointmentApi.bookAppointment({
        doctorId: validDoctorUserId,
        appointmentDate,
        symptoms: symptoms.trim() || undefined,
      });
    },
    onSuccess: () => {
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
      queryClient.invalidateQueries({
        queryKey: ['available-slots', validDoctorUserId, selectedDate],
      });
    },
    onError: (err: any) => {
      setBookingError(err.message || 'Failed to book appointment. Slot may be unavailable.');
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    bookMutation.mutate();
  };

  if (isLoadingDoctor) {
    return (
      <PageContainer title="Doctor Profile">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </Card>
            <Card className="p-6 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </Card>
          </div>
          <div>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isDoctorError || !doctor) {
    return (
      <PageContainer title="Doctor Not Found">
        <EmptyState
          icon={AlertCircle}
          title="Doctor Profile Unavailable"
          description={
            (doctorError as any)?.message ||
            'The requested physician profile could not be located or is not currently verified.'
          }
          actionLabel="Back to Doctors Directory"
          onAction={() => navigate('/patient/doctors')}
        />
      </PageContainer>
    );
  }

  const doctorName = doctor.user?.name || 'Physician';
  const initials = doctorName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <PageContainer
      title={`Dr. ${doctorName}`}
      description={`${doctor.specialization} • ${doctor.qualification || 'Board Certified Medical Specialist'}`}
      action={
        <Link to="/patient/doctors">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Directory
          </Button>
        </Link>
      }
    >
      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Doctor Profile & Credentials (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-2xl border-2 border-brand-300 shadow-sm">
                  {initials}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                      Dr. {doctorName}
                    </h2>
                    {doctor.verified && (
                      <Badge variant="success" size="sm" dot>
                        Verified Practitioner
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-brand-700">
                    {doctor.specialization} {doctor.qualification && `• ${doctor.qualification}`}
                  </p>
                  {doctor.hospitalName && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.hospitalName}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Info Badges */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-5 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-slate-500 font-medium block">Experience</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {doctor.experience}+ Years
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-slate-500 font-medium block">Consultation Fee</span>
                  <span className="text-sm font-bold text-brand-700 mt-0.5 block">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-slate-500 font-medium block">Timezone</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                    {doctor.timezone || 'UTC'}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-slate-500 font-medium block">Languages</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block truncate">
                    {doctor.languages || 'English'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biography */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Professional Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">
                {doctor.bio ||
                  `Dr. ${doctorName} is an experienced medical specialist focusing on comprehensive patient care, proactive diagnosis, and evidence-based treatment regimens through DocTalk's secure telemedicine network.`}
              </p>
            </CardContent>
          </Card>

          {/* Telehealth Features */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Consultation Channel & Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Encrypted Video Visits</h4>
                    <p className="text-slate-500 mt-0.5">High-definition WebRTC video consultation with peer-to-peer media stream.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Real-time Clinical Chat</h4>
                    <p className="text-slate-500 mt-0.5">Secure channel for sharing symptoms, medical photos, and laboratory reports.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Booking Widget (1/3) */}
        <div className="space-y-6">
          <Card className="border-brand-200 shadow-md">
            <CardHeader className="bg-brand-50/50 border-b border-brand-100">
              <CardTitle className="text-brand-900 flex items-center justify-between">
                <span>Book Appointment</span>
                <span className="text-base font-bold text-brand-700">{formatCurrency(doctor.consultationFee)}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {bookingSuccess ? (
                /* Success View */
                <div className="space-y-4 text-center py-4">
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Consultation Booked!</h4>
                  <p className="text-xs text-slate-600">
                    Your appointment with Dr. {doctorName} for {formatDate(selectedDate)} at{' '}
                    {selectedSlot ? formatSlotTime(selectedSlot.start) : ''} is registered.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/patient/appointments')}
                      className="w-full justify-center"
                    >
                      Go to My Appointments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBookingSuccess(false);
                        setSelectedSlot(null);
                        setSymptoms('');
                      }}
                      className="w-full justify-center"
                    >
                      Book Another Slot
                    </Button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  {bookingError && (
                    <Alert variant="error" onClose={() => setBookingError(null)}>
                      {bookingError}
                    </Alert>
                  )}

                  {/* 1. Date Picker */}
                  <div className="space-y-1.5">
                    <label htmlFor="detail-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      1. Choose Consultation Date
                    </label>
                    <input
                      id="detail-date"
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                        setBookingError(null);
                      }}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {/* 2. Slot Selection */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        2. Available Slot ({slotsData?.dayOfWeek || 'Day'})
                      </label>
                      {selectedSlot && (
                        <span className="text-[11px] font-bold text-brand-700 font-mono">
                          {formatSlotTime(selectedSlot.start)}
                        </span>
                      )}
                    </div>

                    {isLoadingSlots ? (
                      <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-slate-200">
                        <Spinner size="sm" variant="primary" />
                        <span className="ml-2 text-xs text-slate-500">Checking availability...</span>
                      </div>
                    ) : slotsError ? (
                      <Alert variant="error">Unable to fetch available slots.</Alert>
                    ) : slots.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                        <p className="text-xs font-semibold text-slate-700">No slots available</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Doctor has no schedule configured on {slotsData?.dayOfWeek || 'this date'}.
                        </p>
                      </div>
                    ) : !hasAvailableSlots ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                        <p className="text-xs font-semibold text-amber-800">Fully booked</p>
                        <p className="text-[10px] text-amber-700">All slots on this date are taken.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
                        {slots.map((slot) => {
                          const isSelected = selectedSlot?.start === slot.start;
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                                !slot.available
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                                  : isSelected
                                  ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20 font-bold'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-mono text-xs">{formatSlotTime(slot.start)}</span>
                              <span className="text-[9px]">{slot.available ? (isSelected ? 'Selected' : 'Open') : 'Booked'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Symptoms Note */}
                  <div className="space-y-1.5">
                    <label htmlFor="detail-symptoms" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      3. Symptoms / Reason <span className="text-slate-400 normal-case">(Optional)</span>
                    </label>
                    <textarea
                      id="detail-symptoms"
                      rows={2}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Brief note on symptoms or history..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    disabled={!selectedSlot || !selectedSlot.available || bookMutation.isPending}
                    isLoading={bookMutation.isPending}
                    leftIcon={<Calendar className="h-4 w-4" />}
                  >
                    Confirm Booking
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
