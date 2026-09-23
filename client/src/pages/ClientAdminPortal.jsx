import React, { useState, useEffect } from 'react';
import {
  Building2, Users, CheckCircle2, Clock, Calendar, Phone, Mail,
  Search, Download, RefreshCw, AlertCircle, FileText, ChevronRight,
  TrendingUp, Award, UserCheck, Stethoscope, GraduationCap, ShieldCheck,
  PlusCircle, Gift, Send, ArrowRight, Wallet, Settings, KeyRound, Check,
  ExternalLink, HelpCircle
} from 'lucide-react';
import PortalSidebar from '../components/PortalSidebar';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function ClientAdminPortal({ currentUser }) {
  // Navigation tabs matching Fluent Affiliate layout
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'incoming' | 'outgoing' | 'payouts' | 'settings'

  const [incomingOpps, setIncomingOpps] = useState([]);
  const [outgoingOpps, setOutgoingOpps] = useState([]);
  const [outgoingRewards, setOutgoingRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Status update modal for incoming patient/student
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [finalAgreedPrice, setFinalAgreedPrice] = useState('');

  // Form for Outbound Referral: "Refer an Institution to Our Company"
  const [referralForm, setReferralForm] = useState({
    target_entity_id: 'ottobon',
    client_name: '',
    person_contacted: '',
    designation_role: '',
    phone: '',
    email: '',
    service_product: '',
    requirement_breakdown: ''
  });
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSuccessMsg, setReferralSuccessMsg] = useState('');

  // Settings state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [facilityUpi, setFacilityUpi] = useState('accounts.citycare@okicici');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // 1. Fetch Incoming Leads
      const resInc = await fetch('/api/opportunities?scope=incoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataInc = await resInc.json();
      if (resInc.ok) {
        setIncomingOpps(dataInc.opportunities || []);
      }

      // 2. Fetch Outgoing Referrals given to company
      const resOut = await fetch('/api/opportunities?scope=outgoing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataOut = await resOut.json();
      if (resOut.ok) {
        setOutgoingOpps(dataOut.opportunities || []);
      }

      // 3. Fetch Rewards
      const resRew = await fetch('/api/rewards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataRew = await resRew.json();
      if (resRew.ok) {
        setOutgoingRewards(dataRew.rewards || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
    const interval = setInterval(fetchPortalData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update status of incoming lead
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOpp || !updateStatus) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      const payload = {
        current_status: updateStatus,
        remarks: updateNotes || selectedOpp.remarks,
        last_discussion: updateNotes ? `Facility Update: ${updateNotes}` : selectedOpp.last_discussion,
      };

      if (updateStatus === 'CONVERTED' && finalAgreedPrice) {
        payload.final_agreed_price = parseFloat(finalAgreedPrice);
      }

      const res = await fetch(`/api/opportunities/${selectedOpp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchPortalData();
        setSelectedOpp(null);
        setUpdateNotes('');
        setFinalAgreedPrice('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update intake status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit a referral to our company
  const handleSubmitReferralToCompany = async (e) => {
    e.preventDefault();
    if (!referralForm.client_name.trim() || !referralForm.service_product.trim()) {
      alert('Please enter Institution Name and Service / Software Needed.');
      return;
    }

    try {
      setIsSubmittingReferral(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...referralForm,
        intake_type: 'COMPANY_GROWTH',
        referring_user_id: currentUser?.id
      };

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setReferralSuccessMsg(`✓ Referral submitted successfully! (Job ID: ${data.job_id})`);
        setReferralForm({
          target_entity_id: 'ottobon',
          client_name: '',
          person_contacted: '',
          designation_role: '',
          phone: '',
          email: '',
          service_product: '',
          requirement_breakdown: ''
        });
        await fetchPortalData();
        setTimeout(() => setReferralSuccessMsg(''), 5000);
      } else {
        alert(data.error || 'Failed to submit referral');
      }
    } catch (err) {
      console.error('Error submitting referral:', err);
      alert('Network error submitting referral');
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  const handleSaveFacilitySettings = (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSavedMsg('Facility preferences updated successfully!');
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    }, 700);
  };

  const isHospital = currentUser?.industry === 'HEALTHCARE' || currentUser?.organization_name?.toLowerCase().includes('hospital') || currentUser?.organization_name?.toLowerCase().includes('clinic');

  // Filter incoming list
  const filteredIncoming = incomingOpps.filter(opp => {
    const matchesSearch =
      (opp.person_contacted && opp.person_contacted.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.service_product && opp.service_product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.job_id && opp.job_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.referrer_name && opp.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || opp.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRewardsEarned = outgoingRewards.reduce((sum, r) => sum + (r.reward_value || 0), 0);
  const pendingTriageCount = incomingOpps.filter(o => o.current_status === 'SUBMITTED').length;

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'incoming', label: isHospital ? 'Patient Intake' : 'Student Admissions', icon: 'incoming', badge: pendingTriageCount },
    { id: 'outgoing', label: 'Outbound Referrals', icon: 'outgoing' },
    { id: 'payouts', label: 'Payouts & Rewards', icon: 'payouts' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFBF7] flex flex-col lg:flex-row">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (MATCHING REFERENCE UI) */}
      <PortalSidebar
        tabs={adminTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        portalType="admin"
      />

      {/* 2. Main Content Area on the Right */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header Banner */}
        <div className="bg-[#4A154B] rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Facility Administration Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {currentUser?.organization_name || 'Institution Desk'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Triage incoming patient and student referrals in real-time, update clinical stages, and refer peer institutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPortalData}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className="px-4 py-2 rounded-xl bg-[#2EB67D] hover:bg-[#28A76F] text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-[#2EB67D]/20"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Refer Facility</span>
            </button>
          </div>
        </div>
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD (NO BAR GRAPHS, HIGH-CLARITY METRICS & TRIAGE FEED)     */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{incomingOpps.length}</div>
                <div className="text-xs text-slate-500 mt-1">Verified partner referrals</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Triage</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600 mt-2">{pendingTriageCount}</div>
                <div className="text-xs text-slate-500 mt-1">Requires facility contact</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Converted & Enrolled</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600 mt-2">
                  {incomingOpps.filter(o => o.current_status === 'CONVERTED').length}
                </div>
                <div className="text-xs text-slate-500 mt-1">Successful admissions</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A154B] uppercase tracking-wider">Outbound Rewards</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#4A154B] flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#4A154B] mt-2">
                  ₹{totalRewardsEarned.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 mt-1">{outgoingOpps.length} institutions referred</div>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="bg-gradient-to-r from-[#4A154B]/5 via-[#2EB67D]/5 to-transparent p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A154B] text-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Need more leads for your department or campus?</h3>
                  <p className="text-xs text-slate-600">Your facility profile is active and verified across 150+ referring doctors & counselors.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('incoming')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition"
                >
                  View Intake Desk
                </button>
                <button
                  onClick={() => setActiveTab('outgoing')}
                  className="px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition"
                >
                  Refer a Facility
                </button>
              </div>
            </div>

            {/* Recent Leads Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Incoming Admissions</h3>
                  <p className="text-xs text-slate-500">Live feed of verified referrals directed to your institution</p>
                </div>
                <button
                  onClick={() => setActiveTab('incoming')}
                  className="text-xs font-bold text-[#4A154B] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Intake Table</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {incomingOpps.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No incoming referrals yet. New patient and student referrals will populate here instantaneously.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {incomingOpps.slice(0, 5).map(opp => (
                    <div key={opp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0">
                          {opp.person_contacted ? opp.person_contacted.charAt(0).toUpperCase() : 'L'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{opp.person_contacted || opp.client_name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {opp.job_id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{opp.service_product}</span>
                            <span>•</span>
                            <span>By {opp.referrer_name || 'Partner Doctor'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          opp.current_status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                          opp.current_status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {opp.current_status}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedOpp(opp);
                            setUpdateStatus(opp.current_status);
                            setUpdateNotes(opp.remarks || '');
                            setFinalAgreedPrice(opp.final_agreed_price || opp.quoted_price || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition"
                        >
                          Triage Lead
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INCOMING LEADS (FULL TABLE, SEARCH, STAGE FILTER & MODAL)           */}
        {/* ========================================================================= */}
        {activeTab === 'incoming' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Header & Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isHospital ? "Search patient name, procedure, doctor..." : "Search student, course, mentor..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#4A154B] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'SUBMITTED', 'CONTACTED', 'IN DISCUSSION', 'PROPOSAL SENT', 'CONVERTED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      statusFilter === st
                        ? 'bg-[#4A154B] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Leads' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">
                Loading incoming leads...
              </div>
            ) : filteredIncoming.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No incoming referrals match criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When doctors or mentors refer candidates or patients to your facility, they appear here cleanly in real time.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Job ID</th>
                        <th className="py-3.5 px-4">{isHospital ? 'Patient / Candidate' : 'Student / Candidate'}</th>
                        <th className="py-3.5 px-4">{isHospital ? 'Procedure / Speciality' : 'Course Needed'}</th>
                        <th className="py-3.5 px-4">Referred By (Advocate)</th>
                        <th className="py-3.5 px-4">Current Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIncoming.map(opp => (
                        <tr key={opp.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-50 text-[#4A154B] border border-purple-200">
                              {opp.job_id}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{opp.date_added}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{opp.person_contacted || opp.client_name}</div>
                            {opp.designation_role && (
                              <div className="text-[11px] text-slate-500 font-medium">{opp.designation_role}</div>
                            )}
                            {opp.phone ? (
                              <a
                                href={`tel:${opp.phone}`}
                                className="inline-flex items-center gap-1 mt-1 text-xs font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition"
                              >
                                <Phone className="w-3 h-3 text-blue-600" /> {opp.phone}
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 mt-0.5 block">No phone provided</span>
                            )}
                            {opp.email && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opp.email}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{opp.service_product}</div>
                            {opp.clinical_intake_notes && (
                              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 max-w-xs">
                                {opp.clinical_intake_notes}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#4A154B]" />
                              <span>{opp.referrer_name || 'Independent Partner'}</span>
                            </div>
                            {opp.referrer_phone ? (
                              <a
                                href={`tel:${opp.referrer_phone}`}
                                className="text-[11px] text-slate-700 font-mono font-semibold flex items-center gap-1 mt-1 hover:text-blue-600"
                              >
                                <Phone className="w-2.5 h-2.5 text-slate-400" /> {opp.referrer_phone}
                              </a>
                            ) : null}
                            {opp.referrer_email && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opp.referrer_email}</div>
                            )}
                            {opp.referrer_org && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-[#4A154B] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {opp.referrer_org}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              opp.current_status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                              opp.current_status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {opp.current_status}
                            </span>
                            {opp.final_agreed_price ? (
                              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                                Fee: ₹{Number(opp.final_agreed_price).toLocaleString()}
                              </div>
                            ) : opp.quoted_price ? (
                              <div className="text-[11px] text-slate-500 mt-1">
                                Quoted: ₹{Number(opp.quoted_price).toLocaleString()}
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOpp(opp);
                                setUpdateStatus(opp.current_status);
                                setUpdateNotes(opp.remarks || '');
                                setFinalAgreedPrice(opp.final_agreed_price || opp.quoted_price || '');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition shadow-xs active:scale-95"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: OUTBOUND REFERRALS (REFER AN INSTITUTION & GET REWARDS)            */}
        {/* ========================================================================= */}
        {activeTab === 'outgoing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Value Proposition Box */}
            <div className="bg-[#4A154B] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2EB67D] text-white text-[11px] font-bold mb-2">
                  <Gift className="w-3.5 h-3.5" /> Institution Partner Program
                </div>
                <h2 className="text-xl font-black">Refer another Clinic, College, or School & Earn Rewards</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Connect peer institutions in your network to our platform for admissions systems, clinic CRM, or digital authority. Receive direct payout upon deal closure.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl text-center shrink-0 border border-white/10">
                <div className="text-[11px] text-slate-300 uppercase font-bold">Total Earned</div>
                <div className="text-2xl font-black text-emerald-300 mt-0.5">₹{totalRewardsEarned.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Embedded Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Submit an Institution Referral</h3>
              <p className="text-xs text-slate-500 mb-4">Fill out the contact details below and our enterprise relations team will reach out.</p>

              {referralSuccessMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <span>✨</span>
                  <span>{referralSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReferralToCompany} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Select Solution Needed *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReferralForm({ ...referralForm, target_entity_id: 'ottobon' })}
                      className={`p-3 rounded-xl border text-left transition ${
                        referralForm.target_entity_id === 'ottobon'
                          ? 'bg-purple-50 border-[#4A154B] text-[#4A154B] ring-2 ring-[#4A154B]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">🎓 Ottobon Academy</div>
                      <div className="text-[10px] text-slate-500">Admissions Portal & Institute Tech</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReferralForm({ ...referralForm, target_entity_id: 'medcy' })}
                      className={`p-3 rounded-xl border text-left transition ${
                        referralForm.target_entity_id === 'medcy'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">🏥 Medcy Health Tech</div>
                      <div className="text-[10px] text-slate-500">Clinic CRM & Patient Growth</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReferralForm({ ...referralForm, target_entity_id: 'sbloom' })}
                      className={`p-3 rounded-xl border text-left transition ${
                        referralForm.target_entity_id === 'sbloom'
                          ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">🌸 sBloom</div>
                      <div className="text-[10px] text-slate-500">Social Media & Authority</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Referred School / College / Clinic / Hospital Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. St. Joseph Senior Secondary School or Care Poly Clinic"
                      value={referralForm.client_name}
                      onChange={(e) => setReferralForm({ ...referralForm, client_name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Gupta or Principal Verma"
                      value={referralForm.person_contacted}
                      onChange={(e) => setReferralForm({ ...referralForm, person_contacted: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Director, Managing Trustee, CMO"
                      value={referralForm.designation_role}
                      onChange={(e) => setReferralForm({ ...referralForm, designation_role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={referralForm.phone}
                      onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@school.edu"
                      value={referralForm.email}
                      onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Service / Software Needed *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Student Management Suite, Patient CRM, or Social Media Branding"
                      value={referralForm.service_product}
                      onChange={(e) => setReferralForm({ ...referralForm, service_product: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Requirement Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Key needs, student/patient capacity, goals..."
                      value={referralForm.requirement_breakdown}
                      onChange={(e) => setReferralForm({ ...referralForm, requirement_breakdown: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReferral}
                    className="px-6 py-2.5 rounded-xl bg-[#2EB67D] hover:bg-[#28A76F] text-white font-bold text-xs transition shadow-md shadow-[#2EB67D]/20 flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReferral ? 'Submitting...' : 'Submit Referral to Company'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Outbound Tracking Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Referrals Given by Your Facility</h3>
              
              {outgoingOpps.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No outgoing referrals submitted yet. Fill out the form above to refer an institution and track your earnings here!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Referred Organization</th>
                        <th className="py-2.5 px-3">Target Brand</th>
                        <th className="py-2.5 px-3">Status with Us</th>
                        <th className="py-2.5 px-3 text-right">Your Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {outgoingOpps.map(opp => (
                        <tr key={opp.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">{opp.job_id}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{opp.client_name}</div>
                            <div className="text-[11px] text-slate-500">{opp.person_contacted}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#4A154B] border border-purple-200">
                              {opp.target_entity_name || opp.target_entity_id}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              opp.current_status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {opp.current_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-black">
                            {opp.current_status === 'CONVERTED' ? (
                              <span className="text-emerald-600">🎁 Reward Eligible</span>
                            ) : (
                              <span className="text-slate-400 font-medium">Pending Closure</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PAYOUTS & REWARDS (FEE LEDGER & SETTLEMENT DETAILS)                 */}
        {/* ========================================================================= */}
        {activeTab === 'payouts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Payout Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Referral Payouts</div>
                <div className="text-3xl font-black text-emerald-600 mt-1">₹{totalRewardsEarned.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-500 mt-1">Processed to facility bank account</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Disbursement</div>
                <div className="text-3xl font-black text-amber-600 mt-1">₹0</div>
                <div className="text-xs text-slate-500 mt-1">Next settlement cycle: Friday</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Settlement UPI</div>
                <div className="font-mono text-sm font-bold text-slate-800 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 truncate">
                  {facilityUpi}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Instant Bank Transfer Active</div>
              </div>
            </div>

            {/* Payout History Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Referral Commission Ledger</h3>
                  <p className="text-xs text-slate-500">Itemized statement of all referral rewards and institution fee incentives</p>
                </div>
              </div>

              {outgoingRewards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No payout entries recorded yet. Commission entries are automatically credited upon client onboarding.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Referred Entity</th>
                        <th className="py-3 px-4">Disbursement Date</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {outgoingRewards.map((rew, idx) => (
                        <tr key={rew.id || idx} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            TXN-{rew.id || 1000 + idx}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {rew.opportunity_name || 'Institution Referral'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {rew.provided_date || rew.created_at || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            UPI ({facilityUpi})
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                              {rew.status || 'PAID'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                            ₹{Number(rew.reward_value || 5000).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FACILITY SETTINGS (PROFILE, DISBURSEMENT & PASSWORD CHANGER)       */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            {/* Facility Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Facility Profile & Identity</h3>
              <p className="text-xs text-slate-500 mb-4">Official information visible to partner doctors, counselors, and students</p>

              <form onSubmit={handleSaveFacilitySettings} className="space-y-4 text-xs">
                {settingsSavedMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{settingsSavedMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facility / Institution Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.organization_name || 'City Care Multi-Speciality Hospital'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Industry / Category</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.industry || 'HEALTHCARE / HOSPITAL'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Contact Email</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || 'admin@citycarehospital.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Settlement UPI ID</label>
                    <input
                      type="text"
                      value={facilityUpi}
                      onChange={(e) => setFacilityUpi(e.target.value)}
                      placeholder="e.g. accounts@facilitybank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-[#4A154B] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-5 py-2.5 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs transition"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Security & Credentials</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your administrative password and access credentials</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Intake Status Update Modal (for Triage) */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="text-base font-black text-slate-900 mb-1">
              Triage Intake Status • {selectedOpp.job_id}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Patient/Student: <strong className="text-slate-900">{selectedOpp.person_contacted || selectedOpp.client_name}</strong>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status / Stage *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-[#4A154B] outline-none"
                >
                  <option value="SUBMITTED">SUBMITTED (Initial Referral)</option>
                  <option value="CONTACTED">CONTACTED (Candidate Contacted)</option>
                  <option value="IN DISCUSSION">IN DISCUSSION (Consultation / Interview Scheduled)</option>
                  <option value="PROPOSAL SENT">PROPOSAL SENT (Fee / Treatment Quoted)</option>
                  <option value="CONVERTED">CONVERTED (Admitted & Enrolled) ✓</option>
                  <option value="NOT CONVERTED">NOT CONVERTED (Declined / Ineligible) ✕</option>
                </select>
              </div>

              {updateStatus === 'CONVERTED' && (
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">
                    Final Billed Amount / Agreed Fee (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 75000"
                    value={finalAgreedPrice}
                    onChange={(e) => setFinalAgreedPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-emerald-600 mt-1">
                    ✓ Setting this to Converted automatically triggers eligible referral reward to the referring partner.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility Triage Notes / Remarks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Consultation completed; admission confirmed for Fall term."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold transition shadow-sm"
                >
                  {isUpdating ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}

    </div>
  );
}
