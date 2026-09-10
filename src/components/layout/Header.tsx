import React from 'react';
import { Menu, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand indicator */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-bold text-navy-900">DocTalk</span>
        </div>

        {/* Desktop title / welcome message */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <HeartPulse className="h-4 w-4 text-brand-600" />
            <span className="font-semibold text-slate-800">DocTalk Healthcare System</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">Secure HIPAA-aligned Telehealth Network</span>
          </div>
        </div>
      </div>

      {/* Right-side status and quick profile */}
      <div className="flex items-center gap-3">
        <Badge variant="success" size="sm" dot className="hidden sm:inline-flex">
          System Live
        </Badge>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
