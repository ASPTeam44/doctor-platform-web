import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { loginSchema, LoginFormData } from '@/lib/validation/authSchemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const user = await login(data);
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Default role redirect
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
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleQuickFill = (email: string, roleName: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-navy-900">DocTalk</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
            create a new healthcare account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {errorMessage && (
            <Alert variant="error" className="mb-6" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="doctor@example.com"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-xs text-slate-500">
                Encrypted via bcrypt + JWT
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          {/* Development Quick-Fills */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('dr.sharma@example.com', 'Doctor')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 text-left transition-colors"
              >
                <span className="font-semibold block text-brand-700">Doctor</span>
                <span className="truncate text-slate-500 block">dr.sharma@example.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('rahul.patel@example.com', 'Patient')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 text-left transition-colors"
              >
                <span className="font-semibold block text-brand-700">Patient</span>
                <span className="truncate text-slate-500 block">rahul.patel@example.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
