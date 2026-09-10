import React from 'react';
import { Activity } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading DocTalk...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
          <Activity className="h-7 w-7 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <Spinner size="md" variant="primary" />
          <span className="text-sm font-medium text-slate-700">{message}</span>
        </div>
      </div>
    </div>
  );
};
