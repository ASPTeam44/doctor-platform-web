import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_NAV_ITEMS } from './navConfig';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = ROLE_NAV_ITEMS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy-900 text-slate-200 border-r border-navy-800 z-30">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-navy-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md shadow-brand-500/20">
          <Activity className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white">DocTalk</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Healthcare Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-navy-800 p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-navy-800/80 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user.name}</p>
              <Badge variant="default" size="sm" className="mt-0.5 bg-navy-950 text-brand-300 border-navy-700">
                {user.role}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-700 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
