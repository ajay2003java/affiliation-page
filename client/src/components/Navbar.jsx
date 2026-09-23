import React, { useState } from 'react';
import { Shield, User, LogOut, ChevronDown, PlusCircle, LayoutDashboard, KeyRound, ArrowRight, Building2, Users } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar({
  currentUser,
  onLogout,
  onOpenLoginModal,
  currentView,
  setCurrentView,
  onOpenSubmitModal,
  onOpenIntentModal
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const scrollToSection = (id) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setCurrentView('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-sm">
              R
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#1D1C1D]">
              Referral Platform
            </span>
          </div>

          {/* Center: SaaS Navigation Links */}
          {currentView === 'landing' && (
            <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#616061]">
              <button
                onClick={() => scrollToSection('what-we-do')}
                className="hover:text-[#1D1C1D] transition font-medium"
              >
                What We Do
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#1D1C1D] transition font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="hover:text-[#1D1C1D] transition font-medium"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection('programs-grid')}
                className="hover:text-[#1D1C1D] transition font-medium"
              >
                Programs
              </button>
            </nav>
          )}

          {/* Right: Actions / Auth State */}
          <div className="flex items-center gap-3">
            
            {/* If Logged In as Super Admin */}
            {currentUser && currentUser.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-[#4A154B] text-white'
                    : 'text-[#4A154B] bg-[#4A154B]/10 hover:bg-[#4A154B]/15'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Tracker
              </button>
            )}

            {/* If Logged In as Client Facility Admin */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentView('client-admin')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentView === 'client-admin'
                    ? 'bg-[#4A154B] text-white'
                    : 'text-[#4A154B] bg-[#4A154B]/10 hover:bg-[#4A154B]/15'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Intake Desk
              </button>
            )}

            {/* If Logged In as User */}
            {currentUser && currentUser.role === 'USER' && (
              <button
                onClick={() => setCurrentView('user')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentView === 'user'
                    ? 'bg-[#4A154B] text-white'
                    : 'text-[#4A154B] bg-[#4A154B]/10 hover:bg-[#4A154B]/15'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Referrals
              </button>
            )}

            {/* Account dropdown or Login/Get Started */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:bg-slate-50 transition text-sm font-medium text-[#1D1C1D]"
                >
                  <div className="w-6 h-6 rounded-md bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center text-xs font-bold">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#616061]" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] py-1.5 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#E0E0E0]">
                      <div className="text-xs font-semibold text-[#1D1C1D]">{currentUser.name}</div>
                      <div className="text-[11px] text-[#616061] truncate">{currentUser.email}</div>
                    </div>

                    {currentUser.role === 'USER' && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenIntentModal) onOpenIntentModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#4A154B] hover:bg-[#4A154B]/10 flex items-center gap-2 border-b border-slate-100"
                      >
                        <Building2 className="w-3.5 h-3.5" /> Set Up Business Referral Page
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#1D1C1D] hover:bg-slate-50 flex items-center gap-2"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#616061]" /> Change Password
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenLoginModal}
                  className="text-sm font-bold text-[#1D1C1D] hover:text-[#4A154B] transition px-2 py-1.5"
                >
                  Sign in
                </button>

                <button
                  onClick={onOpenSubmitModal}
                  className="px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                >
                  START REFERRING
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>

    {/* Change Password Modal */}
    <ChangePasswordModal
      isOpen={isChangePasswordOpen}
      onClose={() => setIsChangePasswordOpen(false)}
      currentUser={currentUser}
    />
    </>
  );
}
