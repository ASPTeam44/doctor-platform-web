import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { MedicalReport } from '@/types/report';
import { reportApi } from '@/lib/api/reportApi';
import { formatDate } from '@/lib/utils/formatters';

export interface PatientReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PatientReportsModal: React.FC<PatientReportsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<{ reports: MedicalReport[] }>({
    queryKey: ['reports', 'patient', patientId],
    queryFn: () => reportApi.getPatientReportsForDoctor(patientId),
    enabled: isOpen && !!patientId,
    retry: false, // Don't retry on 403 access denial
  });

  const reports = data?.reports || [];
  const isAccessDenied =
    (error as any)?.response?.status === 403 ||
    (error as any)?.message?.toLowerCase().includes('permission') ||
    (error as any)?.message?.toLowerCase().includes('forbidden');

  const handleDownload = async (report: MedicalReport) => {
    try {
      setDownloadingId(report.id);
      setDownloadError(null);
      const res = await reportApi.getDownloadUrl(report.id);
      if (res.downloadUrl) {
        // Open presigned URL in secure ephemeral new tab (never stored)
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Download URL could not be generated.');
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to generate secure download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setDownloadError(null);
        onClose();
      }}
      title={`Medical Records for ${patientName}`}
      description="Authorized diagnostic laboratory reports, ECGs, and imaging documents."
      size="lg"
    >
      <div className="space-y-4 py-1">
        {downloadError && (
          <Alert variant="error" onClose={() => setDownloadError(null)}>
            {downloadError}
          </Alert>
        )}

        {/* HIPAA / Privacy Notice */}
        <div className="p-3 rounded-xl border border-brand-200 bg-brand-50/60 flex items-center gap-2.5 text-xs text-brand-900">
          <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
          <span>
            Encrypted diagnostic records are accessed via temporary S3 presigned URLs. Access is logged for clinical security and audit compliance.
          </span>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : isAccessDenied ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Authorized Reports Shared</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {patientName} has not granted report access for this consultation. Patients can selectively share diagnostic records directly from their Medical Records vault.
            </p>
          </div>
        ) : isError ? (
          <Alert variant="error">
            {(error as any)?.message || 'Unable to load patient medical reports.'}
          </Alert>
        ) : reports.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rep.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-brand-700">{rep.reportType}</span>
                      <span>•</span>
                      <span>{rep.fileName}</span>
                      <span>•</span>
                      <span className="font-mono">{formatFileSize(rep.fileSize)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>Report Date: {formatDate(rep.reportDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    isLoading={downloadingId === rep.id}
                    onClick={() => handleDownload(rep)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileCheck2}
            title="No medical reports found"
            description={`${patientName} has not uploaded any medical records yet.`}
          />
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
