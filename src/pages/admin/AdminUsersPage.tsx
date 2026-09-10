import React, { useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { UserRole } from '@/types/auth';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
}

const mockUsersList: UserRecord[] = [
  { id: 'usr-1', name: 'Dr. Sharma', email: 'dr.sharma@example.com', role: 'DOCTOR', isActive: true, joinedAt: '2026-08-01' },
  { id: 'usr-2', name: 'Rahul Patel', email: 'rahul.patel@example.com', role: 'PATIENT', isActive: true, joinedAt: '2026-08-10' },
  { id: 'usr-3', name: 'Apollo Pharmacy', email: 'apollo@example.com', role: 'PHARMACY', isActive: true, joinedAt: '2026-08-15' },
  { id: 'usr-4', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', isActive: true, joinedAt: '2026-07-01' },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>(mockUsersList);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <PageContainer
      title="User Directory & Governance"
      description="Inspect user accounts across all platform roles, monitor activity, and enforce account suspension if required."
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
        <div className="w-full sm:max-w-xs">
          <Input
            id="user-search"
            placeholder="Search by name or email..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                roleFilter === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-semibold text-slate-900">{u.name}</TableCell>
              <TableCell className="text-slate-600 font-mono text-xs">{u.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    u.role === 'ADMIN'
                      ? 'danger'
                      : u.role === 'DOCTOR'
                      ? 'default'
                      : u.role === 'PHARMACY'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={u.isActive ? 'success' : 'danger'} dot>
                  {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-600 text-xs">{u.joinedAt}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant={u.isActive ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => toggleUserStatus(u.id)}
                >
                  {u.isActive ? 'Suspend' : 'Reactivate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
