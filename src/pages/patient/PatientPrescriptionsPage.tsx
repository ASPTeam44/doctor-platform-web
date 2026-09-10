import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Eye,
  Printer,
  Pill,
  User,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Prescription, PrescriptionStatus } from '@/types/prescription';
import { prescriptionApi } from '@/lib/api/prescriptionApi';
import { formatDate } from '@/lib/utils/formatters';
import { PatientPrescriptionDetailsModal } from '@/components/patient/PatientPrescriptionDetailsModal';

const statusVariantMap: Record<PrescriptionStatus, BadgeVariant> = {
  DRAFT: 'warning',
  ISSUED: 'success',
  CANCELLED: 'danger',
};

export const PatientPrescriptionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Fetch patient prescriptions
  const { data, isLoading, isError, error, refetch } = useQuery<{ prescriptions: Prescription[] }>({
    queryKey: ['prescriptions', 'patient'],
    queryFn: () => prescriptionApi.getMyPrescriptions(),
  });

  const prescriptions = data?.prescriptions || [];

  // Filter by search term (doctor name, diagnosis, prescription ID)
  const filteredPrescriptions = useMemo(() => {
    if (!searchTerm.trim()) return prescriptions;
    const query = searchTerm.toLowerCase().trim();
    return prescriptions.filter((rx) => {
      const doctorName = (rx.doctor?.name || '').toLowerCase();
      const diagnosis = (rx.diagnosis || '').toLowerCase();
      const rxId = rx.id.toLowerCase();
      return doctorName.includes(query) || diagnosis.includes(query) || rxId.includes(query);
    });
  }, [prescriptions, searchTerm]);

  return (
    <PageContainer
      title="Digital Prescriptions"
      description="Access and view tamper-proof digital prescriptions issued by your DocTalk physicians."
    >
      {/* Security Assurance Banner */}
      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/50 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0" />
        <p className="text-xs text-brand-900 leading-relaxed">
          Prescriptions are digitally signed by certified medical practitioners. Valid at all pharmacies and diagnostic facilities.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor name, diagnosis, or Rx ID..."
                className="pl-9 text-sm"
              />
            </div>
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          Failed to load prescriptions. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      ) : filteredPrescriptions.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rx ID</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => {
                  const doctorName = rx.doctor?.name || 'Physician';
                  const specialty = rx.doctor?.doctorProfile?.specialization || 'Doctor';
                  const dateStr = formatDate(rx.updatedAt || rx.createdAt);
                  const itemsCount = rx.items?.length || 0;

                  return (
                    <TableRow key={rx.id}>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        #{rx.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">Dr. {doctorName}</div>
                        <div className="text-xs text-brand-700 font-medium">{specialty}</div>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">
                        {rx.diagnosis}
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">
                        {dateStr}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5 text-brand-600" />
                          <span className="font-medium text-xs">{itemsCount} medicines</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[rx.status]} size="sm" dot>
                          {rx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setSelectedPrescription(rx)}
                        >
                          View Rx
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredPrescriptions.map((rx) => {
              const doctorName = rx.doctor?.name || 'Physician';
              const specialty = rx.doctor?.doctorProfile?.specialization || 'Doctor';
              const dateStr = formatDate(rx.updatedAt || rx.createdAt);
              const itemsCount = rx.items?.length || 0;

              return (
                <Card key={rx.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          #{rx.id.slice(-8).toUpperCase()}
                        </span>
                        <Badge variant={statusVariantMap[rx.status]} size="sm" dot>
                          {rx.status}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Dr. {doctorName}</h4>
                      <p className="text-xs text-brand-700 font-medium">{specialty}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900 mb-0.5">Diagnosis:</p>
                    <p>{rx.diagnosis}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-brand-700 font-semibold">
                      <Pill className="h-3.5 w-3.5" />
                      <span>{itemsCount} prescribed medications</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedPrescription(rx)}
                    >
                      View Rx
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No digital prescriptions found"
          description={
            searchTerm
              ? `No prescriptions found matching "${searchTerm}".`
              : 'You do not have any digital prescriptions yet. Following your consultations, your physician will issue digital prescriptions here.'
          }
        />
      )}

      {/* Patient Prescription Details Modal */}
      {selectedPrescription && (
        <PatientPrescriptionDetailsModal
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          prescription={selectedPrescription}
        />
      )}
    </PageContainer>
  );
};
