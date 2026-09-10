import React from 'react';
import { FolderHeart, Upload, FileText, Download, ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface MockRecord {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

const mockRecords: MockRecord[] = [
  {
    id: 'rec-1',
    name: 'Comprehensive_Metabolic_Panel.pdf',
    type: 'Lab Report',
    uploadedAt: '2026-09-02',
    size: '1.4 MB',
  },
  {
    id: 'rec-2',
    name: 'Cardiac_ECG_Summary.pdf',
    type: 'Diagnostic Scan',
    uploadedAt: '2026-08-15',
    size: '820 KB',
  },
];

export const PatientMedicalRecordsPage: React.FC = () => {
  return (
    <PageContainer
      title="Medical Records Vault"
      description="Securely upload, store, and share clinical diagnostic reports with your treating doctors."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<Upload className="h-4 w-4" />}
          onClick={() => alert('Secure file upload dialog opened')}
        >
          Upload Record
        </Button>
      }
    >
      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/50 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0" />
        <p className="text-xs text-brand-900 leading-relaxed">
          All files are stored in AWS S3 with AES-256 server-side encryption. Only you and authorized physicians with active appointments can view these files.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>File Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRecords.map((rec) => (
            <TableRow key={rec.id}>
              <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600" />
                {rec.name}
              </TableCell>
              <TableCell className="text-slate-600">{rec.type}</TableCell>
              <TableCell className="text-slate-600">{rec.uploadedAt}</TableCell>
              <TableCell className="text-slate-500 font-mono text-xs">{rec.size}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => alert(`Initiating secure pre-signed download for ${rec.name}`)}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
