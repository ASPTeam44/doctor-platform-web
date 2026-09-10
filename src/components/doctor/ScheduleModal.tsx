import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DoctorSchedule, DayOfWeek } from '@/types/doctor';
import { doctorApi } from '@/lib/api/doctorApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSchedule: DoctorSchedule | null;
  configuredDays: DayOfWeek[];
}

const ALL_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  existingSchedule,
  configuredDays,
}) => {
  const queryClient = useQueryClient();

  const isEditing = !!existingSchedule;

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [active, setActive] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingSchedule) {
        setDayOfWeek(existingSchedule.dayOfWeek);
        setStartTime(existingSchedule.startTime);
        setEndTime(existingSchedule.endTime);
        setSlotDuration(existingSchedule.slotDuration);
        setActive(existingSchedule.active);
      } else {
        // Pick first unconfigured day if available
        const unconfigured = ALL_DAYS.find((d) => !configuredDays.includes(d));
        setDayOfWeek(unconfigured || 'MONDAY');
        setStartTime('09:00');
        setEndTime('17:00');
        setSlotDuration(30);
        setActive(true);
      }
      setErrorMessage(null);
    }
  }, [isOpen, existingSchedule, configuredDays]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate time logic
      const startMin = timeToMinutes(startTime);
      const endMin = timeToMinutes(endTime);

      if (startMin >= endMin) {
        throw new Error('Start time must be earlier than end time.');
      }

      if (endMin - startMin < slotDuration) {
        throw new Error(
          `Working hours must accommodate at least one ${slotDuration}-minute slot.`
        );
      }

      if (isEditing && existingSchedule) {
        return await doctorApi.updateSchedule(existingSchedule.id, {
          dayOfWeek,
          startTime,
          endTime,
          slotDuration,
          active,
        });
      } else {
        return await doctorApi.createSchedule({
          dayOfWeek,
          startTime,
          endTime,
          slotDuration,
          active,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to save doctor availability schedule.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    saveMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${existingSchedule?.dayOfWeek} Schedule` : 'Add Working Hours'}
      description="Configure your recurring consultation availability slots for patient bookings."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Day of Week */}
        <div className="space-y-1.5">
          <label htmlFor="schedule-day" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Day of Week
          </label>
          <select
            id="schedule-day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
            disabled={isEditing}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {ALL_DAYS.map((day) => {
              const alreadySet = !isEditing && configuredDays.includes(day);
              return (
                <option key={day} value={day} disabled={alreadySet}>
                  {day} {alreadySet ? '(Already configured)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="schedule-start-time" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Start Time (24h)
            </label>
            <input
              id="schedule-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="schedule-end-time" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              End Time (24h)
            </label>
            <input
              id="schedule-end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Slot Duration */}
        <div className="space-y-1.5">
          <label htmlFor="schedule-slot-duration" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Consultation Slot Duration
          </label>
          <select
            id="schedule-slot-duration"
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {DURATION_OPTIONS.map((dur) => (
              <option key={dur} value={dur}>
                {dur} Minutes per consultation
              </option>
            ))}
          </select>
        </div>

        {/* Active Status Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="schedule-active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="schedule-active" className="text-xs font-medium text-slate-700 cursor-pointer">
            Accept patient bookings on this day (Active)
          </label>
        </div>

        {/* Footer Buttons */}
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
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={saveMutation.isPending}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            {isEditing ? 'Update Schedule' : 'Save Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
