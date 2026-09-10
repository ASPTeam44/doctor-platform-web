import React from 'react';
import { ShieldAlert, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  targetResource: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-991',
    action: 'AUTH_LOGIN_SUCCESS',
    performedBy: 'dr.sharma@example.com',
    targetResource: 'SESSION_TOKEN',
    ipAddress: '192.168.1.45',
    timestamp: '2026-09-10 15:45:12',
    status: 'SUCCESS',
  },
  {
    id: 'aud-990',
    action: 'DOCTOR_VERIFICATION_APPROVED',
    performedBy: 'admin@example.com',
    targetResource: 'DoctorProfile:doc-3',
    ipAddress: '127.0.0.1',
    timestamp: '2026-09-10 14:20:00',
    status: 'SUCCESS',
  },
  {
    id: 'aud-989',
    action: 'PRESCRIPTION_DIGITALLY_SIGNED',
    performedBy: 'dr.sharma@example.com',
    targetResource: 'Prescription:rx-101',
    ipAddress: '192.168.1.45',
    timestamp: '2026-09-10 13:10:05',
    status: 'SUCCESS',
  },
  {
    id: 'aud-988',
    action: 'VIDEO_ROOM_TOKEN_ISSUED',
    performedBy: 'rahul.patel@example.com',
    targetResource: 'VideoSession:vid-room-88',
    ipAddress: '192.168.1.80',
    timestamp: '2026-09-10 11:30:22',
    status: 'SUCCESS',
  },
  {
    id: 'aud-987',
    action: 'PAYMENT_SIGNATURE_VERIFIED',
    performedBy: 'SYSTEM_WEBHOOK',
    targetResource: 'Payment:pay_order_882',
    ipAddress: '52.66.12.89',
    timestamp: '2026-09-10 11:29:40',
    status: 'SUCCESS',
  },
];

export const AdminAuditsPage: React.FC = () => {
  return (
    <PageContainer
      title="Security & Compliance Audit Logs"
      description="Immutable audit trail capturing all authentication, prescription signatures, teleconsultation tokens, and payment events."
      action={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={() => alert('Exporting encrypted compliance audit log CSV')}
        >
          Export CSV
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event ID</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Initiator</TableHead>
            <TableHead>Target Resource</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAuditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs font-semibold text-slate-800">
                {log.id}
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold text-brand-700">
                {log.action}
              </TableCell>
              <TableCell className="text-xs text-slate-700">{log.performedBy}</TableCell>
              <TableCell className="font-mono text-xs text-slate-500">{log.targetResource}</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">{log.ipAddress}</TableCell>
              <TableCell className="text-xs text-slate-500">{log.timestamp}</TableCell>
              <TableCell>
                <Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'} size="sm" dot>
                  {log.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
