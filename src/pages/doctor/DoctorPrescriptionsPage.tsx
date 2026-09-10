import React from 'react';
import { FilePlus, FileText, Download } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface MockDoctorPrescription {
  id: string;
  patientName: string;
  diagnosis: string;
  date: string;
  itemsCount: number;
}

const mockList: MockDoctorPrescription[] = [
  {
    id: 'rx-201',
    patientName: 'Rahul Patel',
    diagnosis: 'Hypertension Stage 1',
    date: '2026-09-08',
    itemsCount: 3,
  },
  {
    id: 'rx-195',
    patientName: 'Ananya Roy',
    diagnosis: 'Acute Bronchitis',
    date: '2026-09-04',
    itemsCount: 2,
  },
];

export const DoctorPrescriptionsPage: React.FC = () => {
  return (
    <PageContainer
      title="Issued Prescriptions"
      description="Create, digitally sign, and review pharmaceutical prescriptions for your patients."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<FilePlus className="h-4 w-4" />}
          onClick={() => alert('New digital prescription modal opened')}
        >
          Create Prescription
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prescription ID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead>Medications</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockList.map((rx) => (
            <TableRow key={rx.id}>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">
                {rx.id.toUpperCase()}
              </TableCell>
              <TableCell className="font-semibold text-slate-900">{rx.patientName}</TableCell>
              <TableCell className="text-slate-600">{rx.diagnosis}</TableCell>
              <TableCell className="text-slate-600">{rx.date}</TableCell>
              <TableCell className="text-slate-700">{rx.itemsCount} medicines</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => alert(`Downloading PDF copy of ${rx.id}`)}
                >
                  Download PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
