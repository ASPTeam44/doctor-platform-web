import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 shadow-lg shadow-brand-500/10">
          <HelpCircle className="h-9 w-9" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">404 Error</span>
          <h1 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            The page or clinical workspace you requested could not be located. It might have moved or the URL may be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />} className="w-full">
              DocTalk Home
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
