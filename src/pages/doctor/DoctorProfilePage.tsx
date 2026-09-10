import React from 'react';
import { UserCheck, ShieldCheck, Award, DollarSign, Mail, Phone, Clock } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageContainer
      title="Doctor Profile & Credentials"
      description="Manage your professional medical credentials, consultation rates, and bio."
      action={
        <Button
          variant="primary"
          size="md"
          onClick={() => alert('Profile update mode active')}
        >
          Edit Profile
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-2xl font-bold border-2 border-brand-300">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'DR'}
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Dr. {user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="success" dot>
                Verified Physician
              </Badge>
              <Badge variant="default">MD, Cardiology</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Professional Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Medical License</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">MCI-2024-8899-IND</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Experience</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">8 Years Clinical Practice</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Standard Consultation Fee</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(750)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Consultation Duration</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">30 Minutes / Session</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Professional Biography</span>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                Board-certified clinical specialist with over 8 years of hospital and outpatient cardiology experience. Passionate about preventive cardiology, patient education, and teleconsultation care pathways.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
