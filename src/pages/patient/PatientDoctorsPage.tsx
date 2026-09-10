import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Stethoscope, Award, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { doctorApi, DoctorsListResponse } from '@/lib/api/doctorApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatCurrency } from '@/lib/utils/formatters';
import { DoctorUser } from '@/types/doctor';

export const PatientDoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('ALL');

  const { data, isLoading } = useQuery<DoctorsListResponse>({
    queryKey: ['doctors'],
    queryFn: () => doctorApi.getAllDoctors(),
  });

  const doctors: DoctorUser[] = data?.doctors || [];

  const rawSpecializations = doctors
    .map((d: DoctorUser) => d.doctorProfile?.specialization)
    .filter((s): s is string => Boolean(s));

  const specializations: string[] = ['ALL', ...Array.from(new Set(rawSpecializations))];

  const filteredDoctors = doctors.filter((doc: DoctorUser) => {
    const nameMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch =
      doc.doctorProfile?.specialization.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = nameMatch || specMatch;

    const matchesSpec =
      selectedSpecialization === 'ALL' ||
      doc.doctorProfile?.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  return (
    <PageContainer
      title="Find a Specialist Doctor"
      description="Browse verified healthcare physicians, view consultation fees, and schedule appointments."
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="w-full sm:max-w-md">
          <Input
            id="doctor-search"
            placeholder="Search doctor name or specialty..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Specialization Pills */}
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec: string) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialization(spec)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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

      {/* Doctor Grid */}
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor: DoctorUser) => (
            <Card key={doctor.id} className="hover:border-brand-300 transition-all shadow-xs hover:shadow-md">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-base">
                        {doctor.name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'DR'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-navy-900 flex items-center gap-1.5">
                          Dr. {doctor.name}
                          {doctor.doctorProfile?.verified && (
                            <span title="Verified Physician">
                              <CheckCircle2 className="h-4 w-4 text-brand-600" />
                            </span>
                          )}
                        </h3>
                        <Badge variant="default" size="sm" className="mt-1">
                          {doctor.doctorProfile?.specialization || 'General Practice'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.doctorProfile?.bio ||
                      'Board-certified clinical specialist dedicated to evidence-based telehealth care.'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      <span>{doctor.doctorProfile?.experience || 5}+ yrs experience</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatCurrency(doctor.doctorProfile?.consultationFee || 500)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    onClick={() => {
                      alert(`Doctor consultation booking for Dr. ${doctor.name} initialized.`);
                    }}
                  >
                    Book Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="We couldn't find any specialist matching your current filters. Try changing your search query or specialty."
          actionLabel="Clear Search"
          onAction={() => {
            setSearchTerm('');
            setSelectedSpecialization('ALL');
          }}
        />
      )}
    </PageContainer>
  );
};
