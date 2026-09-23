import React from 'react';
import {
  LayoutGrid, Users, Building2, Wallet, Link2, FileText, Settings,
  GitFork, Award, CreditCard, Radio, BarChart3, TrendingUp, Gift,
  ShieldCheck, ArrowRight, LogOut, ChevronRight
} from 'lucide-react';

export default function PortalSidebar({
  tabs,
  activeTab,
  onTabChange,
  currentUser,
  portalType = 'user', // 'user' | 'admin'
  onOpenSubmitModal
}) {
  const getIcon = (iconKey) => {
    switch (iconKey) {
      case 'dashboard':
        return <LayoutGrid className="w-4 h-4" />;
      case 'incoming':
      case 'intake':
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
    <aside className="w-full lg:w-64 bg-white border-r border-[#E0E0E0] shrink-0 flex flex-col justify-between min-h-full">
      {/* Top Section */}
      <div className="p-4 sm:p-5">
        
        {/* Navigation Section Title */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#616061] px-3 mb-2 font-heading">
          {portalType === 'super_admin' ? 'HQ Master Console' : portalType === 'admin' ? 'Facility Console' : 'Advocate Menu'}
        </div>

        {/* Navigation Items (Vertical Sidebar) */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#4A154B]/10 text-[#4A154B] font-bold shadow-xs border border-[#4A154B]/20'
                    : 'text-[#616061] hover:text-[#1D1C1D] hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#4A154B]' : 'text-slate-400'}>
                    {getIcon(tab.icon)}
                  </span>
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#4A154B] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Submit Action (for Referrers) */}
        {portalType === 'user' && onOpenSubmitModal && (
          <div className="mt-6 pt-5 border-t border-[#E0E0E0]">
            <button
              onClick={onOpenSubmitModal}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs font-bold font-heading shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>+ Submit Referral</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom User Snapshot */}
      <div className="p-4 border-t border-[#E0E0E0] bg-[#FAF9F5] rounded-b-2xl lg:rounded-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#1D1C1D] truncate">
              {currentUser?.name || 'Partner Account'}
            </div>
            <div className="text-[10px] text-[#616061] truncate font-mono">
              {currentUser?.email || ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
