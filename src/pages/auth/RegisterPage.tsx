import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, User, Mail, Lock, Phone, Stethoscope, Building2, UserPlus } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { registerSchema, RegisterFormData } from '@/lib/validation/authSchemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils/cn';

type RegisterRole = 'PATIENT' | 'DOCTOR' | 'PHARMACY';

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('PATIENT');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PATIENT',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      consultationFee: 500,
      experienceYears: 5,
    },
  });

  const handleRoleChange = (role: RegisterRole) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      switch (user.role) {
        case 'PATIENT':
          navigate('/patient/dashboard', { replace: true });
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard', { replace: true });
          break;
        case 'PHARMACY':
          navigate('/pharmacy/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please review your details and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-navy-900">DocTalk</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create your DocTalk account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {errorMessage && (
            <Alert variant="error" className="mb-6" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('PATIENT')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                  selectedRole === 'PATIENT'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-xs font-semibold">Patient</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DOCTOR')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                  selectedRole === 'DOCTOR'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Stethoscope className="h-5 w-5" />
                <span className="text-xs font-semibold">Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('PHARMACY')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                  selectedRole === 'PHARMACY'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-xs font-semibold">Pharmacy</span>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="name"
                label={selectedRole === 'PHARMACY' ? 'Contact Person Name' : 'Full Name'}
                placeholder={selectedRole === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'John Doe'}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="name@domain.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                helperText="Must be 8+ chars with uppercase, lowercase, number"
                {...register('password')}
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Input
              id="phone"
              label="Contact Phone Number"
              placeholder="+91 9876543210"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* DOCTOR specific profile fields */}
            {selectedRole === 'DOCTOR' && (
              <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-4 mt-2">
                <div className="flex items-center gap-2 text-brand-800 text-xs font-semibold uppercase tracking-wider">
                  <Stethoscope className="h-4 w-4 text-brand-600" />
                  Doctor Professional Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="specialization"
                    label="Specialization"
                    placeholder="Cardiology, Dermatology, etc."
                    error={errors.specialization?.message}
                    {...register('specialization')}
                  />
                  <Input
                    id="licenseNumber"
                    label="Medical License Number"
                    placeholder="MCI-2024-8899"
                    error={errors.licenseNumber?.message}
                    {...register('licenseNumber')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="consultationFee"
                    type="number"
                    label="Consultation Fee (INR)"
                    placeholder="500"
                    error={errors.consultationFee?.message}
                    {...register('consultationFee', { valueAsNumber: true })}
                  />
                  <Input
                    id="experienceYears"
                    type="number"
                    label="Years of Experience"
                    placeholder="5"
                    error={errors.experienceYears?.message}
                    {...register('experienceYears', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Brief background on education, clinical expertise, and hospital affiliations..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    {...register('bio')}
                  />
                </div>
              </div>
            )}

            {/* PHARMACY specific profile fields */}
            {selectedRole === 'PHARMACY' && (
              <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-4 mt-2">
                <div className="flex items-center gap-2 text-brand-800 text-xs font-semibold uppercase tracking-wider">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  Pharmacy Business Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="pharmacyName"
                    label="Pharmacy Name"
                    placeholder="Apollo MedCare Pharmacy"
                    error={errors.pharmacyName?.message}
                    {...register('pharmacyName')}
                  />
                  <Input
                    id="pharmacyLicenseNumber"
                    label="Drug License Number"
                    placeholder="DL-2024-9988"
                    error={errors.licenseNumber?.message}
                    {...register('licenseNumber')}
                  />
                </div>

                <Input
                  id="address"
                  label="Street Address"
                  placeholder="123 Health Boulevard, Ground Floor"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    id="city"
                    label="City"
                    placeholder="Bengaluru"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    id="state"
                    label="State"
                    placeholder="Karnataka"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                  <Input
                    id="postalCode"
                    label="Postal Code"
                    placeholder="560001"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                isLoading={isSubmitting}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
