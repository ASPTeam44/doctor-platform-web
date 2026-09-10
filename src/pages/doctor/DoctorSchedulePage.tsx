import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { doctorApi } from '@/lib/api/doctorApi';
import { DoctorSchedule, DayOfWeek } from '@/types/doctor';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSlotTime } from '@/lib/utils/formatters';
import { ScheduleModal } from '@/components/doctor/ScheduleModal';

const ALL_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DoctorSchedulePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<DoctorSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<DoctorSchedule | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Fetch Doctor's Own Schedule
  const { data, isLoading, isError, error, refetch } = useQuery<{
    schedules: DoctorSchedule[];
  }>({
    queryKey: ['schedule', 'doctor'],
    queryFn: () => doctorApi.getMySchedule(),
  });

  const schedules = data?.schedules || [];
  const configuredDays = schedules.map((s) => s.dayOfWeek);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      return await doctorApi.deleteSchedule(scheduleId);
    },
    onSuccess: () => {
      setFeedbackSuccess('Working day schedule successfully removed.');
      setFeedbackError(null);
      setScheduleToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['schedule', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
    onError: (err: any) => {
      setFeedbackError(err.message || 'Failed to delete schedule entry.');
      setScheduleToDelete(null);
    },
  });

  const handleOpenAdd = (day?: DayOfWeek) => {
    if (day) {
      // Pre-set empty schedule with specific day
      setScheduleToEdit(null);
    } else {
      setScheduleToEdit(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule: DoctorSchedule) => {
    setScheduleToEdit(schedule);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (scheduleToDelete) {
      deleteMutation.mutate(scheduleToDelete.id);
    }
  };

  return (
    <PageContainer
      title="Availability & Working Hours"
      description="Define and manage your recurring consultation hours and slot durations across the week."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => handleOpenAdd()}
          disabled={configuredDays.length >= 7}
        >
          Add Working Day
        </Button>
      }
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

      {/* Timezone Information Banner */}
      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/70 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-900">Standard Telehealth Schedule Clock</h4>
            <p className="text-xs text-sky-700">
              Working hours are calibrated in standard 24h wall-clock time. Generated patient slots directly match these configured working hours.
            </p>
          </div>
        </div>
        <Badge variant="info" size="sm">
          UTC Standard
        </Badge>
      </div>

      {/* Week Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{(error as any)?.message || 'Failed to load schedule.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_DAYS.map((day) => {
            const sched = schedules.find((s) => s.dayOfWeek === day);

            return (
              <Card
                key={day}
                className={`flex flex-col justify-between transition-all ${
                  sched
                    ? sched.active
                      ? 'border-brand-300 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 opacity-80'
                    : 'border-dashed border-slate-300 bg-slate-50/40'
                }`}
              >
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-navy-900">{day}</span>
                      {sched ? (
                        <Badge variant={sched.active ? 'success' : 'neutral'} size="sm" dot>
                          {sched.active ? 'Active' : 'Paused'}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Off Duty</span>
                      )}
                    </div>

                    {/* Schedule Content */}
                    {sched ? (
                      <div className="space-y-2 py-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                          <Clock className="h-4 w-4 text-brand-600" />
                          <span>
                            {formatSlotTime(sched.startTime)} – {formatSlotTime(sched.endTime)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                          <span>Slot Interval:</span>
                          <span className="font-semibold text-slate-700">
                            {sched.slotDuration} mins
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-3">
                        No appointments accepted on {day.toLowerCase()}s.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {sched ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit2 className="h-3 w-3" />}
                          onClick={() => handleOpenEdit(sched)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="h-3 w-3" />}
                          onClick={() => setScheduleToDelete(sched)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                        leftIcon={<Plus className="h-3 w-3" />}
                        onClick={() => handleOpenAdd(day)}
                      >
                        Set Hours
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Edit/Add Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setScheduleToEdit(null);
        }}
        existingSchedule={scheduleToEdit}
        configuredDays={configuredDays}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        title="Delete Working Hours"
        description="Are you sure you want to remove this schedule entry?"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Schedule
            </Button>
          </>
        }
      >
        {scheduleToDelete && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Remove {scheduleToDelete.dayOfWeek} Hours</p>
                <p className="mt-0.5 leading-relaxed">
                  Patients will no longer be able to book slots on this day. Existing scheduled appointments remain unchanged.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
