import React from 'react';
import {
  LayoutGrid, Users, Building2, Wallet, Link2, FileText, Settings,
  GitFork, Award, CreditCard, Radio, BarChart3, TrendingUp
} from 'lucide-react';

export default function PortalNavTabs({ tabs, activeTab, onTabChange }) {
  const getIcon = (iconKey) => {
    switch (iconKey) {
      case 'dashboard':
        return <LayoutGrid className="w-4 h-4" />;
      case 'incoming':
        return <Users className="w-4 h-4" />;
      case 'outgoing':
        return <Gift className="w-4 h-4" />;
      case 'referrals':
        return <GitFork className="w-4 h-4" />;
      case 'programs':
        return <Building2 className="w-4 h-4" />;
      case 'payouts':
        return <Wallet className="w-4 h-4" />;
      case 'links':
        return <Link2 className="w-4 h-4" />;
      case 'reports':
        return <FileText className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border-b border-[#E0E0E0] sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#4A154B]/10 text-[#4A154B] border border-[#4A154B]/30 shadow-xs font-bold'
                    : 'text-[#616061] hover:text-[#1D1C1D] hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#4A154B]' : 'text-slate-400'}>
                  {getIcon(tab.icon)}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#4A154B] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
