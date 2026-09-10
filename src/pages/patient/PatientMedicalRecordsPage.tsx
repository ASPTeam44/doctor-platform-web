import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderHeart,
  FileText,
  Download,
  Share2,
  ShieldCheck,
  Calendar,
  Lock,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { MedicalReport } from '@/types/report';
import { reportApi } from '@/lib/api/reportApi';
import { formatDate } from '@/lib/utils/formatters';
import { GrantReportAccessModal } from '@/components/patient/GrantReportAccessModal';

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PatientMedicalRecordsPage: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedReportForGrant, setSelectedReportForGrant] = useState<MedicalReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch patient medical reports
  const { data, isLoading, isError, error, refetch } = useQuery<{ reports: MedicalReport[] }>({
    queryKey: ['reports', 'patient'],
    queryFn: () => reportApi.getMyReports(),
  });

  const reports = data?.reports || [];

  const handleDownload = async (report: MedicalReport) => {
    try {
      setDownloadingId(report.id);
      setErrorMessage(null);
      const res = await reportApi.getDownloadUrl(report.id);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Download URL was not generated.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Unable to generate secure download link.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PageContainer
      title="Medical Records Vault"
      description="Securely store, access, and share clinical diagnostic reports with your treating DocTalk doctors."
    >
      {/* Security Assurance Banner */}
      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/50 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0" />
        <p className="text-xs text-brand-900 leading-relaxed">
          All diagnostic files are stored in AWS S3 with AES-256 server-side encryption. Secure presigned URLs are ephemeral and expire in 15 minutes. Only you and authorized physicians can access these records.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4">
          <Alert variant="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          Failed to load medical reports. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      ) : reports.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">{rec.title}</div>
                          <div className="text-xs text-slate-400 font-mono">{rec.fileName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {rec.reportType || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {formatDate(rec.createdAt)}
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      {formatFileSize(rec.fileSize)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Share2 className="h-3.5 w-3.5 text-brand-600" />}
                          onClick={() => setSelectedReportForGrant(rec)}
                        >
                          Share with Doctor
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                          onClick={() => handleDownload(rec)}
                          disabled={downloadingId === rec.id}
                        >
                          {downloadingId === rec.id ? 'Generating...' : 'Download'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {reports.map((rec) => (
              <Card key={rec.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">{rec.fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(rec.createdAt)} • {formatFileSize(rec.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {rec.reportType || 'General'}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Share2 className="h-3.5 w-3.5 text-brand-600" />}
                    onClick={() => setSelectedReportForGrant(rec)}
                  >
                    Share
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={() => handleDownload(rec)}
                    disabled={downloadingId === rec.id}
                  >
                    {downloadingId === rec.id ? '...' : 'Download'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={FolderHeart}
          title="No medical reports in vault"
          description="You have not uploaded or linked any diagnostic lab reports yet."
        />
      )}

      {/* Grant Access Modal */}
      {selectedReportForGrant && (
        <GrantReportAccessModal
          isOpen={!!selectedReportForGrant}
          onClose={() => setSelectedReportForGrant(null)}
          report={selectedReportForGrant}
        />
      )}
    </PageContainer>
  );
};
