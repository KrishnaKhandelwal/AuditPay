'use client';

import React from 'react';
import { 
  Building2, 
  Wallet, 
  Warehouse, 
  Send, 
  Sparkles, 
  RefreshCw,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export type UserRole = 'ALL_IN_ONE' | 'FOUNDER' | 'FINANCE' | 'WAREHOUSE' | 'KAM';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  onLoadSample,
  onReset,
  hasData
}) => {
  const roles: { id: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      id: 'ALL_IN_ONE',
      title: 'Full Radar',
      subtitle: 'Complete Audit Suite',
      icon: ShieldAlert,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'FOUNDER',
      title: 'Founder / CEO',
      subtitle: 'Leakage & Net Margins',
      icon: Building2,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      id: 'FINANCE',
      title: 'Finance & Accounts',
      subtitle: 'Settlements & Duplicates',
      icon: Wallet,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'WAREHOUSE',
      title: 'Warehouse & 3PL',
      subtitle: 'Gate Inward & Shortages',
      icon: Warehouse,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      id: 'KAM',
      title: 'KAM / Operations',
      subtitle: 'Disputes & SLA Tickets',
      icon: Send,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="w-full bg-gray-950/80 border-b border-gray-800/80 backdrop-blur-md sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Role Selector Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold uppercase text-gray-500 mr-2 tracking-wider hidden lg:inline">
            Persona View:
          </span>

          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? `${r.color} shadow-lg shadow-black/40 scale-[1.02]`
                    : 'bg-gray-900/50 hover:bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className={isActive ? 'text-white' : ''}>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5 justify-end">
          {!hasData ? (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Load Realistic Sample</span>
            </button>
          ) : (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700/80 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
