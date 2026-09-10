import React from 'react';
import { FileText, Download, ShoppingBag } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface MockPrescription {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  medicationsCount: number;
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED';
}

const mockPrescriptions: MockPrescription[] = [
  {
    id: 'rx-101',
    doctorName: 'Dr. Sharma',
    specialty: 'Cardiology',
    date: '2026-09-08',
    medicationsCount: 3,
    status: 'ACTIVE',
  },
  {
    id: 'rx-098',
    doctorName: 'Dr. Patel',
    specialty: 'General Medicine',
    date: '2026-08-20',
    medicationsCount: 2,
    status: 'FULFILLED',
  },
];

export const PatientPrescriptionsPage: React.FC = () => {
  return (
    <PageContainer
      title="Digital Prescriptions"
      description="Access, download, and order pharmacy medicines directly from your doctor's digital prescriptions."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prescription ID</TableHead>
            <TableHead>Prescribing Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Date Issued</TableHead>
            <TableHead>Medicines</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPrescriptions.map((rx) => (
            <TableRow key={rx.id}>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">
                {rx.id.toUpperCase()}
              </TableCell>
              <TableCell className="font-medium text-slate-900">{rx.doctorName}</TableCell>
              <TableCell className="text-slate-600">{rx.specialty}</TableCell>
              <TableCell className="text-slate-600">{rx.date}</TableCell>
              <TableCell className="text-slate-700">{rx.medicationsCount} items</TableCell>
              <TableCell>
                <Badge
                  variant={rx.status === 'ACTIVE' ? 'success' : rx.status === 'FULFILLED' ? 'info' : 'neutral'}
                  dot
                >
                  {rx.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={() => alert(`Downloading signed PDF prescription #${rx.id}`)}
                  >
                    PDF
                  </Button>
                  {rx.status === 'ACTIVE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Converting prescription #${rx.id} into pharmacy medicine order`)}
                    >
                      Order Meds
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
