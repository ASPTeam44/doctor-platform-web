import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FilePlus,
  FileText,
  Search,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Pill,
  Calendar,
  Clock,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Prescription, PrescriptionStatus } from '@/types/prescription';
import { prescriptionApi } from '@/lib/api/prescriptionApi';
import { formatDate } from '@/lib/utils/formatters';
import { PrescriptionModal } from '@/components/doctor/PrescriptionModal';
import { PrescriptionDetailsModal } from '@/components/doctor/PrescriptionDetailsModal';

const statusVariantMap: Record<PrescriptionStatus, BadgeVariant> = {
  DRAFT: 'warning',
  ISSUED: 'success',
  CANCELLED: 'danger',
};

export const DoctorPrescriptionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedPrescriptionForDetails, setSelectedPrescriptionForDetails] = useState<Prescription | null>(null);
  const [selectedPrescriptionForEdit, setSelectedPrescriptionForEdit] = useState<Prescription | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch doctor's prescriptions
  const { data, isLoading, isError, error, refetch } = useQuery<{ prescriptions: Prescription[] }>({
    queryKey: ['prescriptions', 'doctor'],
    queryFn: () => prescriptionApi.getDoctorPrescriptions(),
  });

  const prescriptions = data?.prescriptions || [];

  // Issue mutation
  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      return await prescriptionApi.issuePrescription(id);
    },
    onSuccess: () => {
      setActionFeedback({ type: 'success', message: 'Prescription successfully issued to patient.' });
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
    },
    onError: (err: any) => {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to issue prescription.',
      });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return await prescriptionApi.cancelPrescription(id);
    },
    onSuccess: () => {
      setActionFeedback({ type: 'success', message: 'Prescription marked as cancelled.' });
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
    },
    onError: (err: any) => {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to cancel prescription.',
      });
    },
  });

  // Calculate status counts
  const counts = useMemo(() => {
    return {
      ALL: prescriptions.length,
      DRAFT: prescriptions.filter((p) => p.status === 'DRAFT').length,
      ISSUED: prescriptions.filter((p) => p.status === 'ISSUED').length,
      CANCELLED: prescriptions.filter((p) => p.status === 'CANCELLED').length,
    };
  }, [prescriptions]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const patientName = (p.patient?.name || '').toLowerCase();
        const diagnosis = (p.diagnosis || '').toLowerCase();
        const rxId = p.id.toLowerCase();
        if (!patientName.includes(query) && !diagnosis.includes(query) && !rxId.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [prescriptions, statusFilter, searchTerm]);

  return (
    <PageContainer
      title="Clinical Prescriptions"
      description="Create, sign, and manage pharmaceutical prescriptions tied to your clinical appointments."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<FilePlus className="h-4 w-4" />}
          onClick={() => {
            setSelectedPrescriptionForEdit(null);
            setIsCreateModalOpen(true);
          }}
        >
          New Prescription
        </Button>
      }
    >
      {/* Feedback Banner */}
      {actionFeedback && (
        <div className="mb-4">
          <Alert
            variant={actionFeedback.type === 'success' ? 'success' : 'error'}
            onClose={() => setActionFeedback(null)}
          >
            {actionFeedback.message}
          </Alert>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {(['ALL', 'DRAFT', 'ISSUED', 'CANCELLED'] as const).map((status) => {
              const isActive = statusFilter === status;
              const count = counts[status];
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All Prescriptions' : status}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, diagnosis, or Rx ID..."
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => {
                  const patientName = rx.patient?.name || 'Patient';
                  const dateStr = formatDate(rx.updatedAt || rx.createdAt);
                  const itemsCount = rx.items?.length || 0;

                  return (
                    <TableRow key={rx.id}>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        #{rx.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{patientName}</div>
                        {rx.patient?.email && (
                          <div className="text-xs text-slate-400">{rx.patient.email}</div>
                        )}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={() => setSelectedPrescriptionForDetails(rx)}
                          >
                            Details
                          </Button>

                          {rx.status === 'DRAFT' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                                onClick={() => setSelectedPrescriptionForEdit(rx)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                onClick={() => issueMutation.mutate(rx.id)}
                                disabled={issueMutation.isPending}
                              >
                                Issue
                              </Button>
                            </>
                          )}

                          {(rx.status === 'DRAFT' || rx.status === 'ISSUED') && (
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircle className="h-3.5 w-3.5" />}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel Prescription #${rx.id.slice(-8).toUpperCase()}?`)) {
                                  cancelMutation.mutate(rx.id);
                                }
                              }}
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
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
              const patientName = rx.patient?.name || 'Patient';
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
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{patientName}</h4>
                      <p className="text-xs text-slate-500">{dateStr}</p>
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

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrescriptionForDetails(rx)}
                    >
                      Details
                    </Button>

                    {rx.status === 'DRAFT' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPrescriptionForEdit(rx)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => issueMutation.mutate(rx.id)}
                          disabled={issueMutation.isPending}
                        >
                          Issue
                        </Button>
                      </>
                    )}

                    {(rx.status === 'DRAFT' || rx.status === 'ISSUED') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Cancel this prescription?')) {
                            cancelMutation.mutate(rx.id);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No prescriptions found"
          description={
            statusFilter === 'ALL'
              ? 'You have not composed any digital prescriptions yet.'
              : `No prescriptions found with status "${statusFilter}".`
          }
          actionLabel="Compose Prescription"
          onAction={() => {
            setSelectedPrescriptionForEdit(null);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* Prescription Composer / Editor Modal */}
      {(isCreateModalOpen || !!selectedPrescriptionForEdit) && (
        <PrescriptionModal
          isOpen={isCreateModalOpen || !!selectedPrescriptionForEdit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedPrescriptionForEdit(null);
          }}
          existingPrescription={selectedPrescriptionForEdit}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
            setIsCreateModalOpen(false);
            setSelectedPrescriptionForEdit(null);
          }}
        />
      )}

      {/* Prescription Details Modal */}
      {selectedPrescriptionForDetails && (
        <PrescriptionDetailsModal
          isOpen={!!selectedPrescriptionForDetails}
          onClose={() => setSelectedPrescriptionForDetails(null)}
          prescription={selectedPrescriptionForDetails}
          onEditDraft={(rx) => {
            setSelectedPrescriptionForDetails(null);
            setSelectedPrescriptionForEdit(rx);
          }}
        />
      )}
    </PageContainer>
  );
};
