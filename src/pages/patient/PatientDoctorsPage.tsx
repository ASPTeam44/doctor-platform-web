import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Stethoscope,
  Award,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { doctorApi, DoctorsListResponse } from '@/lib/api/doctorApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatCurrency } from '@/lib/utils/formatters';
import { Doctor } from '@/types/doctor';
import { BookingModal } from '@/components/patient/BookingModal';

const POPULAR_SPECIALIZATIONS = [
  'ALL',
  'Cardiology',
  'Dermatology',
  'General Medicine',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
];

export const PatientDoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSpecializationChange = (spec: string) => {
    setSelectedSpecialization(spec);
    setCurrentPage(1);
  };

  // Server-side query for verified doctors
  const { data, isLoading, isError, error, refetch } = useQuery<DoctorsListResponse>({
    queryKey: ['doctors', debouncedSearch, selectedSpecialization, currentPage],
    queryFn: () =>
      doctorApi.getAllDoctors({
        name: debouncedSearch || undefined,
        specialization: selectedSpecialization !== 'ALL' ? selectedSpecialization : undefined,
        page: currentPage,
        limit: 9,
      }),
  });

  const doctors = data?.doctors || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.total || 0;

  return (
    <PageContainer
      title="Find a Specialist Doctor"
      description="Browse verified medical physicians, review consultation rates, and schedule an encrypted telehealth consultation."
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Input
              id="doctor-search"
              placeholder="Search doctor by name..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
            {!isLoading && (
              <span>
                Showing <strong className="text-slate-800">{doctors.length}</strong> of{' '}
                <strong className="text-slate-800">{totalCount}</strong> verified doctors
              </span>
            )}
          </div>
        </div>

        {/* Specialization Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {POPULAR_SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => handleSpecializationChange(spec)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedSpecialization === spec
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="error" className="mb-6">
          <div className="flex items-center justify-between">
            <span>{(error as any)?.message || 'Failed to load doctors list. Please verify connection.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        /* Doctors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const name = doctor.user?.name || 'Physician';
            const doctorUserId = doctor.userId || doctor.user?.id || doctor.id;
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card
                key={doctor.id}
                className="flex flex-col justify-between hover:border-brand-300 transition-all shadow-xs hover:shadow-md"
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-base">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-navy-900 truncate flex items-center gap-1.5">
                          Dr. {name}
                          <span title="Verified by Medical Board">
                            <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                          </span>
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge variant="default" size="sm">
                            {doctor.specialization}
                          </Badge>
                          {doctor.qualification && (
                            <span className="text-[11px] text-slate-500 font-medium truncate">
                              • {doctor.qualification}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hospital & Location */}
                    {doctor.hospitalName && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.hospitalName}</span>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doctor.bio ||
                        'Board-certified clinical specialist dedicated to patient-first telehealth consultations.'}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Award className="h-3.5 w-3.5 text-slate-400" />
                        <span>{doctor.experience}+ yrs experience</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 justify-end">
                        <span className="text-xs text-slate-400 font-normal">Fee:</span>
                        <span>{formatCurrency(doctor.consultationFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link to={`/patient/doctors/${doctorUserId}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-xs"
                        rightIcon={<ExternalLink className="h-3 w-3" />}
                      >
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center text-xs"
                      leftIcon={<Calendar className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedDoctorForBooking(doctor)}
                    >
                      Book Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={Stethoscope}
          title="No verified doctors found"
          description="We couldn't find any verified specialists matching your search query or specialization. Try resetting your filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedSpecialization('ALL');
            setCurrentPage(1);
          }}
        />
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 font-medium">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedDoctorForBooking}
        onClose={() => setSelectedDoctorForBooking(null)}
        doctor={selectedDoctorForBooking}
      />
    </PageContainer>
  );
};
