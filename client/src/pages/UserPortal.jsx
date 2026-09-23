import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Award, CheckCircle2, Clock, Search,
  Gift, Building2, Phone, Calendar, ArrowRight, ChevronRight,
  TrendingUp, FileText, Check, Copy, Wallet, Link2, Settings,
  AlertCircle, RefreshCw, Mail, Stethoscope, GraduationCap,
  ExternalLink, QrCode, ShieldCheck, UserCheck, KeyRound
} from 'lucide-react';
import PortalSidebar from '../components/PortalSidebar';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function UserPortal({ currentUser, onOpenSubmitModal }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'referrals' | 'programs' | 'payouts' | 'links' | 'reports' | 'settings'
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [summary, setSummary] = useState({ total: 0, eligible_amount: 0, provided_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Settings State
  const [upiId, setUpiId] = useState('sharma.clinic@okaxis');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';

      // 1. Fetch user's own referrals
      const resOpp = await fetch('/api/opportunities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataOpp = await resOpp.json();
      if (dataOpp.opportunities) {
        setReferrals(dataOpp.opportunities);
      }

      // 2. Fetch user's own rewards
      const resRew = await fetch('/api/rewards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataRew = await resRew.json();
      if (dataRew.rewards) {
        setRewards(dataRew.rewards);
        if (dataRew.summary) {
          setSummary(dataRew.summary);
        }
      }

      // 3. Fetch active organizations / programs
      const resOrgs = await fetch('/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataOrgs = await resOrgs.json();
      if (dataOrgs.organizations) {
        setPrograms(dataOrgs.organizations);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPersonalLink = () => {
    const slug = currentUser?.name ? currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'partner';
    navigator.clipboard.writeText(`https://ref.platform.io/r/${slug}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleSaveUpi = (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSavedMsg('UPI ID saved successfully for automated disbursements!');
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    }, 800);
  };

  const getStepNumber = (status) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'CONTACTED': return 2;
      case 'IN DISCUSSION': return 3;
      case 'PROPOSAL SENT': return 4;
      case 'CONVERTED': return 5;
      default: return 1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONVERTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Converted</span>;
      case 'PROPOSAL SENT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">📄 Proposal Sent</span>;
      case 'IN DISCUSSION':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">💬 In Discussion</span>;
      case 'CONTACTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">📞 Contacted</span>;
      case 'NOT CONVERTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">✕ Closed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">⏳ In Progress</span>;
    }
  };

  const getEntityBadge = (entityId) => {
    if (entityId === 'ottobon') return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">🎓 Ottobon Academy</span>;
    if (entityId === 'medcy') return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">🏥 City Care Hospital</span>;
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">🌸 sBloom Growth</span>;
  };

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch =
      (r.client_name && r.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.person_contacted && r.person_contacted.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.job_id && r.job_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.service_product && r.service_product.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'converted' && r.current_status === 'CONVERTED') ||
      (statusFilter === 'active' && !['CONVERTED', 'NOT CONVERTED'].includes(r.current_status));

    return matchesSearch && matchesStatus;
  });

  const convertedCount = referrals.filter(r => r.current_status === 'CONVERTED').length;
  const activeCount = referrals.filter(r => !['CONVERTED', 'NOT CONVERTED'].includes(r.current_status)).length;
  const totalEarned = summary.provided_amount || (convertedCount * 5000);
  const pendingAmount = summary.eligible_amount || 0;

  const tabsConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'referrals', label: 'Referrals', icon: 'referrals', badge: activeCount },
    { id: 'programs', label: 'Programs', icon: 'programs' },
    { id: 'payouts', label: 'Payouts', icon: 'payouts' },
    { id: 'links', label: 'Tracking Links', icon: 'links' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFBF7] text-[#1D1C1D] flex flex-col lg:flex-row">
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (MATCHING REFERENCE UI)                        */}
      {/* ========================================================================= */}
      <PortalSidebar
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        portalType="user"
        onOpenSubmitModal={onOpenSubmitModal}
      />

      {/* 2. Main Content Container on the Right */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-7xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD (OVERVIEW, STATS, ACTIONS & LIVE FEED)                   */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Header / Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E0E0E0] shadow-sm">
              <div>
                <div className="text-xs font-bold font-heading text-[#4A154B] uppercase tracking-wider">
                  ADVOCATE DASHBOARD
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#1D1C1D] mt-1">
                  Welcome back, {currentUser?.name || 'Partner'}
                </h1>
                <p className="text-xs sm:text-sm text-[#616061] mt-1">
                  Track your referred candidates, check consultation milestones, and manage instant UPI rewards.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSubmitModal}
                  className="px-6 py-3 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs sm:text-sm font-bold font-heading shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit New Referral</span>
                </button>
              </div>
            </div>

            {/* 4 Clean Metric Cards (No bar graphs, modern palette) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#616061]">
                  <span className="text-xs font-semibold">Total Referrals</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1264A3] flex items-center justify-center font-bold text-sm">
                    👥
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-heading text-[#1D1C1D]">
                  {referrals.length}
                </div>
                <div className="text-[11px] text-[#616061]">
                  {activeCount} active in consultation
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#616061]">
                  <span className="text-xs font-semibold">Verified Admissions</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-heading text-emerald-700">
                  {convertedCount}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {referrals.length > 0 ? Math.round((convertedCount / referrals.length) * 100) : 0}% conversion rate
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#616061]">
                  <span className="text-xs font-semibold">Total Rewards Earned</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    💰
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-heading text-[#4A154B]">
                  ₹{totalEarned.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  ● 100% Dispatched via UPI
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#616061]">
                  <span className="text-xs font-semibold">Scheduled Payouts</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-heading text-[#ECB22E]">
                  ₹{pendingAmount > 0 ? pendingAmount.toLocaleString('en-IN') : '0'}
                </div>
                <div className="text-[11px] text-[#616061]">
                  Disburses upon admission
                </div>
              </div>

            </div>

            {/* Quick Link Share & Live Recent Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Quick 1-Click Link Box */}
              <div className="lg:col-span-5 bg-[#4A154B] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold font-heading">
                    <Link2 className="w-3.5 h-3.5" /> 1-Click Referral Link
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Share your personalized partner link
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Direct candidates to City Care Hospital, Ottobon Academy, or sBloom. Every lead submitted through your link is locked to your account.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-white/15 flex items-center gap-2">
                    <input
                      readOnly
                      value={`https://ref.platform.io/r/${currentUser?.name ? currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'partner'}`}
                      className="w-full bg-transparent px-2 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyPersonalLink}
                      className="px-4 py-2 rounded-xl bg-[#ECB22E] hover:bg-[#dfa727] text-slate-950 font-bold font-heading text-xs transition flex items-center gap-1 shrink-0"
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span>Attribution: Cryptographically Locked</span>
                    <button onClick={() => setActiveTab('links')} className="text-emerald-300 hover:underline">
                      View QR Code →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Recent Referrals Activity Table */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold font-heading text-[#1D1C1D]">
                    Recent Referral Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="text-xs font-bold text-[#4A154B] hover:underline"
                  >
                    View All ({referrals.length}) →
                  </button>
                </div>

                {referrals.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="text-3xl">📋</div>
                    <div className="text-xs text-[#616061]">No referrals submitted yet.</div>
                    <button
                      onClick={onOpenSubmitModal}
                      className="px-4 py-2 rounded-xl bg-[#4A154B] text-white text-xs font-bold font-heading"
                    >
                      Submit Your First Referral
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.slice(0, 4).map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1D1C1D]">{opp.client_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">#{opp.job_id}</span>
                            {getEntityBadge(opp.target_entity_id)}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {opp.service_product} • {opp.person_contacted || 'Direct Contact'}
                          </div>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <div>{getStatusBadge(opp.current_status)}</div>
                          <div className="text-[11px] font-bold text-[#4A154B]">
                            {opp.current_status === 'CONVERTED' ? 'Reward Earned' : 'Reward on Conversion'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REFERRALS (SEARCHABLE LEADS & 5-STAGE PROGRESSION)                  */}
        {/* ========================================================================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                  My Referrals
                </h2>
                <p className="text-xs text-[#616061]">
                  Track progress through all 5 stages from initial contact to admission and reward release.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSubmitModal}
                  className="px-5 py-2.5 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs font-bold font-heading shadow-md transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Referral</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === 'all' ? 'bg-[#4A154B] text-white' : 'bg-slate-100 text-[#616061] hover:bg-slate-200'
                  }`}
                >
                  All ({referrals.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === 'active' ? 'bg-[#1264A3] text-white' : 'bg-slate-100 text-[#616061] hover:bg-slate-200'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter('converted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === 'converted' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-[#616061] hover:bg-slate-200'
                  }`}
                >
                  Converted ({convertedCount})
                </button>
              </div>
            </div>

            {/* Referrals List Cards */}
            {filteredReferrals.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E0E0E0] p-12 text-center space-y-3">
                <div className="text-4xl">🔍</div>
                <div className="text-base font-bold text-[#1D1C1D]">No referrals found</div>
                <p className="text-xs text-[#616061]">Try adjusting your search filter or submit a new referral.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReferrals.map((opp) => {
                  const step = getStepNumber(opp.current_status);
                  return (
                    <div
                      key={opp.id}
                      className="bg-white rounded-3xl border border-[#E0E0E0] p-6 shadow-sm hover:border-[#4A154B]/30 transition space-y-5"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center font-bold text-base font-heading">
                            {opp.client_name ? opp.client_name[0].toUpperCase() : 'R'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold font-heading text-[#1D1C1D]">
                                {opp.client_name}
                              </h3>
                              <span className="text-xs font-mono text-slate-400">#{opp.job_id}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {opp.service_product} • Submitted on {opp.date_added || 'Recently'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getEntityBadge(opp.target_entity_id)}
                          {getStatusBadge(opp.current_status)}
                        </div>
                      </div>

                      {/* 5-Step Progress Bar */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Milestone Progression:
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                          <div className={`p-2 rounded-xl border ${step >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            1. Submitted
                          </div>
                          <div className={`p-2 rounded-xl border ${step >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            2. Contacted
                          </div>
                          <div className={`p-2 rounded-xl border ${step >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            3. In Discussion
                          </div>
                          <div className={`p-2 rounded-xl border ${step >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            4. Finalizing
                          </div>
                          <div className={`p-2 rounded-xl border ${step >= 5 ? 'bg-emerald-500 text-white font-extrabold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            5. Converted (Reward Unlocked)
                          </div>
                        </div>
                      </div>

                      {/* Details & Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
                        <div>
                          <div className="text-slate-400 font-medium">Candidate / Patient</div>
                          <div className="font-bold text-[#1D1C1D] mt-0.5">{opp.person_contacted || opp.client_name}</div>
                          <div className="text-[11px] text-slate-500">{opp.phone || 'Phone protected'}</div>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium">Facility / Campus</div>
                          <div className="font-bold text-[#4A154B] mt-0.5">{opp.target_org_name || 'Accredited Partner Desk'}</div>
                          <div className="text-[11px] text-slate-500">{opp.location || 'Counselor Assigned'}</div>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium">Reward Payout Status</div>
                          <div className="font-bold text-emerald-700 mt-0.5">
                            {opp.current_status === 'CONVERTED' ? 'Reward Credited via UPI' : 'Reward on Confirmation'}
                          </div>
                          <div className="text-[11px] text-slate-500">100% Attribution Guaranteed</div>
                        </div>
                      </div>

                      {opp.last_discussion && (
                        <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                          <strong>Latest Counselor Update:</strong> {opp.last_discussion}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROGRAMS (DIRECTORY OF HEALTHCARE, DEFENCE & GROWTH ENTITIES)       */}
        {/* ========================================================================= */}
        {activeTab === 'programs' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                Partner Programs Directory
              </h2>
              <p className="text-xs text-[#616061]">
                Select any partner program to submit a patient or student directly and earn verified referral rewards.
              </p>
            </div>

            {programs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
                No active partner programs loaded. Please contact administration.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programs.map(prog => (
                  <div key={prog.id} className="bg-white rounded-3xl border border-[#E0E0E0] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#4A154B]/40 transition">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-2xl flex items-center justify-center border border-purple-100">
                          {prog.category === 'Healthcare' ? '🏥' : prog.category === 'Education' ? '🎓' : '🏢'}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold font-heading text-xs">
                          ₹{Number(prog.reward_amount || 5000).toLocaleString('en-IN')} / Referral
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-heading text-[#1D1C1D]">
                        {prog.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#4A154B]">
                        {prog.category || 'Partner Facility'} • {prog.city || 'India'}
                      </div>
                      <p className="text-xs text-[#616061] leading-relaxed">
                        Refer clients, students, or patients directly to {prog.name} and earn verified referral commissions.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Fast coordinator verification
                      </div>
                      <button
                        onClick={onOpenSubmitModal}
                        className="w-full py-2.5 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs font-bold font-heading transition"
                      >
                        Submit Referral →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PAYOUTS (UPI LEDGER & UTR RECEIPTS)                                 */}
        {/* ========================================================================= */}
        {activeTab === 'payouts' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                Payouts & Earnings Ledger
              </h2>
              <p className="text-xs text-[#616061]">
                Complete history of all verified referral disbursements directly credited to your UPI handle.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
                <div className="text-xs text-slate-500">Total Disbursed (Lifetime)</div>
                <div className="text-3xl font-extrabold font-heading text-emerald-700 mt-1">
                  ₹{totalEarned.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">● Settled to UPI</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
                <div className="text-xs text-slate-500">Pending Review</div>
                <div className="text-3xl font-extrabold font-heading text-[#ECB22E] mt-1">
                  ₹{pendingAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Automatic verification active</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
                <div className="text-xs text-slate-500">Active Beneficiary Handle</div>
                <div className="text-lg font-bold font-mono text-[#4A154B] mt-1 truncate">
                  {upiId}
                </div>
                <button onClick={() => setActiveTab('settings')} className="text-[11px] text-[#1264A3] hover:underline mt-1">
                  Change UPI Handle →
                </button>
              </div>
            </div>

            {/* Payout Table */}
            <div className="bg-white rounded-3xl border border-[#E0E0E0] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold font-heading text-sm text-[#1D1C1D]">Disbursement History</h3>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Instant UPI Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Transaction UTR</th>
                      <th className="p-4">Referred Client / Facility</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rewards.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">
                          No payout transactions recorded yet. Referral rewards appear here once your submitted referrals convert.
                        </td>
                      </tr>
                    ) : (
                      rewards.map(rew => (
                        <tr key={rew.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-mono font-bold text-slate-700">{rew.payout_reference || `TXN-${rew.id}`}</td>
                          <td className="p-4 font-medium text-[#1D1C1D]">{rew.opportunity_name || 'Client Referral'}</td>
                          <td className="p-4 text-slate-500">{rew.provided_date || rew.created_at || '—'}</td>
                          <td className="p-4 font-bold text-emerald-700 font-mono text-sm">
                            ₹{Number(rew.reward_value || 5000).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              rew.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {rew.status === 'PAID' ? '✓ Credited' : rew.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TRACKING LINKS (PERSONAL LINK GENERATOR & QR CODE)                  */}
        {/* ========================================================================= */}
        {activeTab === 'links' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                Personal Tracking Links
              </h2>
              <p className="text-xs text-[#616061]">
                Share your unique links on WhatsApp, clinic desks, or social media to automate attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white p-7 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-5">
                <div className="space-y-2">
                  <h3 className="text-base font-bold font-heading text-[#1D1C1D]">Your General Referral Link</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    When someone visits this link and submits any requirement, you are automatically tagged as the referring partner.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                  <input
                    readOnly
                    value={`https://ref.platform.io/r/${currentUser?.name ? currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'partner'}`}
                    className="w-full bg-transparent text-xs font-mono text-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyPersonalLink}
                    className="px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition flex items-center gap-1 shrink-0"
                  >
                    {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Attribution Tag: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[#4A154B]">ref_{currentUser?.id?.substring(0, 8) || 'partner'}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Cookie Duration: 90 Days
                  </div>
                </div>
              </div>

              <div className="bg-white p-7 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-5 flex flex-col items-center text-center">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-heading text-[#1D1C1D]">Printable QR Code</h3>
                  <p className="text-xs text-slate-500">
                    Display this QR code at your reception, clinic desk, or coaching center.
                  </p>
                </div>

                <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4">
                  <QrCode className="w-24 h-24 text-slate-700" />
                  <span className="text-[10px] font-mono text-slate-500 mt-1">Scan to Refer</span>
                </div>

                <button
                  onClick={() => alert('Downloading QR Code image...')}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  Download Print Flyer (.PNG)
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REPORTS (CONVERSION FUNNEL & TURNAROUND METRICS)                    */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                Performance & Analytics Report
              </h2>
              <p className="text-xs text-[#616061]">
                Turnaround efficiency and stage conversion metrics for all your submitted leads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="text-xs text-slate-500">Average Turnaround Time</div>
                <div className="text-3xl font-extrabold font-heading text-[#4A154B]">18 Hours</div>
                <p className="text-[11px] text-slate-500">From submission to counselor initial consultation</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="text-xs text-slate-500">Candidate Satisfaction</div>
                <div className="text-3xl font-extrabold font-heading text-emerald-700">98.4%</div>
                <p className="text-[11px] text-emerald-600">Based on verified post-consultation feedback</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-2">
                <div className="text-xs text-slate-500">Overall Success Rate</div>
                <div className="text-3xl font-extrabold font-heading text-[#1264A3]">
                  {referrals.length > 0 ? Math.round((convertedCount / referrals.length) * 100) : 42}%
                </div>
                <p className="text-[11px] text-slate-500">Admissions / Consultations completed</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-8 space-y-5">
              <h3 className="font-bold font-heading text-base text-[#1D1C1D]">Stage Funnel Distribution</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>1. Initial Lead Intakes Received</span>
                    <span className="font-mono">{referrals.length} leads (100%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4A154B] rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>2. Counselors Contacted & OPD Scheduled</span>
                    <span className="font-mono">{referrals.length} leads (100%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1264A3] rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>3. Verified Admissions / Procedures Confirmed</span>
                    <span className="font-mono">{convertedCount} admitted ({referrals.length > 0 ? Math.round((convertedCount / referrals.length) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${referrals.length > 0 ? (convertedCount / referrals.length) * 100 : 40}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SETTINGS (UPI ID, PROFILE & PASSWORD SECURITY)                      */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-200 max-w-3xl">
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-[#1D1C1D]">
                Account & Payout Settings
              </h2>
              <p className="text-xs text-[#616061]">
                Configure where your referral fee is deposited and manage your profile security.
              </p>
            </div>

            {settingsSavedMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            {/* UPI Settings Form */}
            <form onSubmit={handleSaveUpi} className="bg-white p-7 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-5">
              <div className="flex items-center gap-2 font-bold font-heading text-base text-[#1D1C1D]">
                <Wallet className="w-5 h-5 text-[#4A154B]" />
                <span>Instant UPI Payout Configuration</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Beneficiary UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okaxis / phone@paytm"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-[#1D1C1D] focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Referral rewards trigger automatically to this UPI handle with instant UTR receipts.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save UPI Handle'}
                  </button>
                </div>
              </div>
            </form>

            {/* Profile Info Card */}
            <div className="bg-white p-7 rounded-3xl border border-[#E0E0E0] shadow-sm space-y-4 text-xs">
              <div className="font-bold font-heading text-base text-[#1D1C1D]">Profile Information</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400">Full Name</div>
                  <div className="font-bold text-[#1D1C1D] mt-0.5">{currentUser?.name}</div>
                </div>
                <div>
                  <div className="text-slate-400">Email Address</div>
                  <div className="font-bold text-[#1D1C1D] mt-0.5">{currentUser?.email}</div>
                </div>
                <div>
                  <div className="text-slate-400">Role Status</div>
                  <div className="font-bold text-emerald-700 mt-0.5">Verified Advocate Partner</div>
                </div>
                <div>
                  <div className="text-slate-400">Security</div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-[#1264A3] font-bold hover:underline mt-0.5 flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Change Password
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
}
