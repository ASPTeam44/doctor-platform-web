import React, { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, FileText, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

interface DoctorCandidate {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  experienceYears: number;
  isVerified: boolean;
}

const initialDoctors: DoctorCandidate[] = [
  {
    id: 'doc-1',
    name: 'Dr. Meera Nambiar',
    email: 'meera.nambiar@hospital.org',
    specialization: 'Neurology',
    licenseNumber: 'MCI-2024-1188',
    experienceYears: 12,
    isVerified: false,
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Iyer',
    email: 'rajesh.iyer@health.in',
    specialization: 'Dermatology',
    licenseNumber: 'MCI-2024-9902',
    experienceYears: 7,
    isVerified: false,
  },
  {
    id: 'doc-3',
    name: 'Dr. Sharma',
    email: 'dr.sharma@example.com',
    specialization: 'Cardiology',
    licenseNumber: 'MCI-2024-8899',
    experienceYears: 10,
    isVerified: true,
  },
];

export const AdminDoctorsPage: React.FC = () => {
  const [doctorsList, setDoctorsList] = useState<DoctorCandidate[]>(initialDoctors);
  const [search, setSearch] = useState('');

  const handleVerify = (id: string, approve: boolean) => {
    setDoctorsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isVerified: approve } : d))
    );
    alert(
      approve
        ? 'Doctor credentials approved. Doctor can now accept appointments.'
        : 'Doctor registration rejected.'
    );
  };

  const filtered = doctorsList.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Doctor Verification & Credentials"
      description="Review clinical licenses and authenticate medical practitioners joining DocTalk."
    >
      <div className="mb-6 max-w-md">
        <Input
          id="search-docs"
          placeholder="Filter doctors by name or specialty..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>License No.</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="font-semibold text-slate-900">{doc.name}</div>
                <div className="text-xs text-slate-500">{doc.email}</div>
              </TableCell>
              <TableCell className="text-slate-700">{doc.specialization}</TableCell>
              <TableCell className="font-mono text-xs font-semibold text-slate-800">
                {doc.licenseNumber}
              </TableCell>
              <TableCell className="text-slate-600">{doc.experienceYears} yrs</TableCell>
              <TableCell>
                <Badge variant={doc.isVerified ? 'success' : 'warning'} dot>
                  {doc.isVerified ? 'VERIFIED' : 'PENDING'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {!doc.isVerified ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        onClick={() => handleVerify(doc.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="h-3.5 w-3.5" />}
                        onClick={() => handleVerify(doc.id, false)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(doc.id, false)}
                    >
                      Revoke
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
