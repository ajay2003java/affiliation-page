import React, { useState } from 'react';
import { Building2, Users, ArrowRight, Check, Shield, ChevronRight, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function IntentModal({ currentUser, onIntentSelected, onDismiss }) {
  const [selectedOption, setSelectedOption] = useState(null); // 'BUSINESS' | 'REFERRER'
  const [businessData, setBusinessData] = useState({
    business_name: currentUser?.organization_name || '',
    category: 'Healthcare & Clinics',
    city: '',
    reward_amount: 5000,
    phone: currentUser?.phone || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOption) {
      setErrorMsg('Please select one of the two options above');
      return;
    }

    if (selectedOption === 'BUSINESS' && !businessData.business_name.trim()) {
      setErrorMsg('Please enter your business or facility name');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const token = localStorage.getItem('token');

      const res = await fetch('/api/auth/select-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          intent: selectedOption,
          business_name: businessData.business_name,
          category: businessData.category,
          city: businessData.city,
          phone: businessData.phone,
          reward_amount: businessData.reward_amount
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onIntentSelected(data.user, data.redirectUrl);
      } else {
        setErrorMsg(data.error || 'Failed to set up account intent');
      }
    } catch (err) {
      console.error('Error selecting intent:', err);
      setErrorMsg('Network error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] text-[#1D1C1D] w-full max-w-2xl rounded-3xl border border-[#E0E0E0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#4A154B] px-6 py-6 sm:px-8 text-white relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold font-heading uppercase tracking-wider">
              ✨ Welcome, {currentUser?.name?.split(' ')[0] || 'Partner'}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-3">
            How would you like to use the platform?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-lg">
            Choose your primary goal to set up your dedicated workspace. You can switch or use both roles at any time.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2 Big Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* OPTION 1: Business / Entity Admin */}
            <div
              onClick={() => {
                setSelectedOption('BUSINESS');
                setErrorMsg('');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedOption === 'BUSINESS'
                  ? 'bg-white border-[#4A154B] shadow-lg ring-2 ring-[#4A154B]/15'
                  : 'bg-white border-[#E0E0E0] hover:border-[#4A154B]/50 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    selectedOption === 'BUSINESS' ? 'bg-[#4A154B] text-white' : 'bg-[#4A154B]/10 text-[#4A154B]'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedOption === 'BUSINESS' ? 'border-[#4A154B] bg-[#4A154B] text-white' : 'border-slate-300'
                  }`}>
                    {selectedOption === 'BUSINESS' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold font-heading text-[#1D1C1D]">
                    Receive Referrals & Increase Footfalls
                  </h3>
                  <p className="text-xs text-[#616061] mt-1 leading-relaxed">
                    For hospitals, clinics, coaching academies, schools, and business service owners.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-1.5 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> Direct Lead Intake Portal
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> Custom Referral Link for Advocates
                </div>
              </div>
            </div>

            {/* OPTION 2: Normal Referrer */}
            <div
              onClick={() => {
                setSelectedOption('REFERRER');
                setErrorMsg('');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedOption === 'REFERRER'
                  ? 'bg-white border-[#1264A3] shadow-lg ring-2 ring-[#1264A3]/15'
                  : 'bg-white border-[#E0E0E0] hover:border-[#1264A3]/50 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    selectedOption === 'REFERRER' ? 'bg-[#1264A3] text-white' : 'bg-[#1264A3]/10 text-[#1264A3]'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedOption === 'REFERRER' ? 'border-[#1264A3] bg-[#1264A3] text-white' : 'border-slate-300'
                  }`}>
                    {selectedOption === 'REFERRER' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold font-heading text-[#1D1C1D]">
                    Refer Candidates & Earn Rewards
                  </h3>
                  <p className="text-xs text-[#616061] mt-1 leading-relaxed">
                    For doctors, counselors, teachers, and individuals referring patients and students.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-1.5 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-[#1264A3]">
                  <Check className="w-3.5 h-3.5" /> Instant UPI Referral Rewards
                </div>
                <div className="flex items-center gap-1.5 text-[#1264A3]">
                  <Check className="w-3.5 h-3.5" /> Real-time Stage & Payout Tracker
                </div>
              </div>
            </div>

          </div>

          {/* Option 1 Expandable Quick Setup */}
          {selectedOption === 'BUSINESS' && (
            <div className="p-5 bg-white rounded-2xl border border-[#E0E0E0] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-xs font-bold font-heading text-[#4A154B] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Quick Business / Facility Setup (30 Seconds)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#1D1C1D] mb-1">
                    Business / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData.business_name}
                    onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                    placeholder="e.g. City Dental Care / Apex Defence"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-[#1D1C1D] focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20 focus:border-[#4A154B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D1C1D] mb-1">
                    Industry / Category
                  </label>
                  <select
                    value={businessData.category}
                    onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-[#1D1C1D] focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20 focus:border-[#4A154B]"
                  >
                    <option value="Healthcare & Clinics">🏥 Healthcare, Clinics & Surgeries</option>
                    <option value="Education & Academies">🎓 Education & Coaching Academies</option>
                    <option value="Business Services">💼 Business Growth & Marketing</option>
                    <option value="Real Estate & Other">🏢 Real Estate / Local Services</option>
                    <option value="Other">✨ Other Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D1C1D] mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    placeholder="e.g. Hyderabad / Bangalore"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-[#1D1C1D] focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20 focus:border-[#4A154B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D1C1D] mb-1">
                    Referral Reward Offered to Advocates (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={businessData.reward_amount}
                    onChange={(e) => setBusinessData({ ...businessData, reward_amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold font-mono text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20 focus:border-[#4A154B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Decide Later
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className={`px-7 py-3 rounded-xl font-bold font-heading text-xs shadow-md transition flex items-center gap-2 active:scale-95 ${
                selectedOption === 'BUSINESS'
                  ? 'bg-[#4A154B] hover:bg-[#3B113C] text-white'
                  : selectedOption === 'REFERRER'
                  ? 'bg-[#1264A3] hover:bg-[#0e5285] text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Configuring Workspace...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedOption === 'BUSINESS'
                      ? 'Launch My Business Intake Desk'
                      : selectedOption === 'REFERRER'
                      ? 'Enter Referrer & Rewards Portal'
                      : 'Select an Option Above'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
