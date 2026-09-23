import React, { useState, useEffect } from 'react';
import {
  Download, Plus, Search, RefreshCw, Edit3, Check, X, Building2,
  Gift, Users, TrendingUp, DollarSign, CheckCircle2, Phone, Mail,
  Calendar, Award, FileText, ChevronRight, ShieldCheck,
  ArrowRight, KeyRound, AlertCircle, Clock, Stethoscope, GraduationCap
} from 'lucide-react';
import PortalSidebar from '../components/PortalSidebar';

export default function AdminTracker({ onOpenAddModal, onEditOpportunity, currentUser }) {
  // Super Admin Navigation Tabs:
  // 'referrals' = Dedicated Incoming Partner Referrals (What others referred to us!)
  // 'pipeline'  = Master Lead Management
  // 'facilities'= Onboarded Institutions & Facilities
  // 'payouts'   = Partner Commission & Rewards Ledger
  const [activeTab, setActiveTab] = useState('referrals');

  const [opportunities, setOpportunities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'own', 'referral'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track which specific cell is being edited: { id, field }
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState('');

  // Conversion prompt modal
  const [convertModalOpp, setConvertModalOpp] = useState(null);
  const [agreedPriceInput, setAgreedPriceInput] = useState('');

  // Client Details selection & search
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [selectedClientDossier, setSelectedClientDossier] = useState(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    category: 'Education',
    city: '',
    contact_person: '',
    phone: '',
    email: '',
    admin_password: '',
    reward_amount: 5000
  });

  // Payout update modal
  const [payoutModalRew, setPayoutModalRew] = useState(null);
  const [utrInput, setUtrInput] = useState('');
  const [isUpdatingPayout, setIsUpdatingPayout] = useState(false);

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData(true); // silent background fetch
    }, 12000);

    return () => clearInterval(interval);
  }, [selectedEntity, statusFilter, searchQuery]);

  const fetchAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';

      // 1. Fetch all opportunities
      let url = `/api/opportunities?entity_id=${selectedEntity}&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const resOpp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataOpp = await resOpp.json();
      if (dataOpp.opportunities) {
        setOpportunities(dataOpp.opportunities);
      }

      // 2. Fetch all organizations
      const resOrg = await fetch('/api/organizations', { headers: { 'Authorization': `Bearer ${token}` } });
      const dataOrg = await resOrg.json();
      if (dataOrg.organizations) {
        setOrganizations(dataOrg.organizations);
      }

      // 3. Fetch all rewards
      const resRew = await fetch('/api/rewards', { headers: { 'Authorization': `Bearer ${token}` } });
      const dataRew = await resRew.json();
      if (dataRew.rewards) {
        setRewards(dataRew.rewards);
      }
    } catch (err) {
      console.error('Error loading super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (id, field, initialVal) => {
    setEditingCell({ id, field });
    setCellValue(initialVal !== null && initialVal !== undefined ? initialVal : '');
  };

  const handleSaveCell = async (id, field) => {
    try {
      let payloadValue = cellValue;
      if (['quoted_price', 'final_agreed_price'].includes(field)) {
        payloadValue = cellValue === '' ? null : parseFloat(cellValue);
      }

      await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ [field]: payloadValue })
      });

      setOpportunities(prev =>
        prev.map(opp => (opp.id === id ? { ...opp, [field]: payloadValue } : opp))
      );
      setEditingCell(null);
    } catch (err) {
      console.error('Error saving cell:', err);
    }
  };

  const handleStatusChange = async (opp, newStatus) => {
    if (newStatus === 'CONVERTED') {
      setConvertModalOpp(opp);
      setAgreedPriceInput(opp.quoted_price || '');
      return;
    }

    try {
      await fetch(`/api/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ current_status: newStatus })
      });

      setOpportunities(prev =>
        prev.map(o => (o.id === opp.id ? { ...o, current_status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleConfirmConversion = async () => {
    if (!convertModalOpp) return;
    try {
      const agreedPrice = parseFloat(agreedPriceInput) || convertModalOpp.quoted_price || 0;
      const convDate = new Date().toISOString().split('T')[0];

      await fetch(`/api/opportunities/${convertModalOpp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          current_status: 'CONVERTED',
          final_agreed_price: agreedPrice,
          conversion_date: convDate
        })
      });

      setConvertModalOpp(null);
      fetchAllData();
    } catch (err) {
      console.error('Error confirming conversion:', err);
    }
  };

  const handleMarkRewardPaid = async (e) => {
    e.preventDefault();
    if (!payoutModalRew) return;
    try {
      setIsUpdatingPayout(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rewards/${payoutModalRew.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payout_reference: utrInput || 'UPI-DISPATCH' })
      });

      if (res.ok) {
        setPayoutModalRew(null);
        setUtrInput('');
        fetchAllData();
      } else {
        alert('Failed to mark payout as paid');
      }
    } catch (err) {
      console.error('Error updating payout:', err);
    } finally {
      setIsUpdatingPayout(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/opportunities/export/csv', '_blank');
  };

  const handleOnboardClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(newClientForm)
      });
      if (res.ok) {
        setIsAddClientModalOpen(false);
        setNewClientForm({
          name: '',
          category: 'Education',
          city: '',
          contact_person: '',
          phone: '',
          email: '',
          admin_password: '',
          reward_amount: 5000
        });
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to onboard client');
      }
    } catch (err) {
      console.error('Error onboarding client:', err);
    }
  };

  // Filtered lists
  const partnerReferrals = opportunities.filter(o => !!o.referring_user_id);
  const ownDirectLeads = opportunities.filter(o => !o.referring_user_id);

  const displayedOpportunities = opportunities.filter(opp => {
    if (sourceFilter === 'own') return !opp.referring_user_id;
    if (sourceFilter === 'referral') return !!opp.referring_user_id;
    return true;
  });

  // Client Details computed stats
  const totalClientBusinesses = organizations.length;
  const totalLeadsDispatchedToClients = organizations.reduce((sum, o) => sum + (o.leads_summary?.total || 0), 0);
  const totalConvertedByClients = organizations.reduce((sum, o) => sum + (o.leads_summary?.converted || 0), 0);
  const totalClientRevenueEarned = organizations.reduce((sum, o) => sum + (o.leads_summary?.total_revenue_earned || 0), 0);
  const totalClientRewardsPaid = organizations.reduce((sum, o) => sum + (o.leads_summary?.rewards_paid || 0), 0);

  const filteredOrganizations = organizations.filter(org => {
    if (!clientSearchQuery) return true;
    const q = clientSearchQuery.toLowerCase();
    return (
      org.name?.toLowerCase().includes(q) ||
      org.category?.toLowerCase().includes(q) ||
      org.city?.toLowerCase().includes(q) ||
      org.contact_person?.toLowerCase().includes(q) ||
      org.email?.toLowerCase().includes(q) ||
      org.admin?.email?.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalLeads = opportunities.length;
  const ownLeadsCount = ownDirectLeads.length;
  const referralLeadsCount = partnerReferrals.length;
  const pendingReferralTriage = partnerReferrals.filter(o => o.current_status === 'SUBMITTED').length;
  const convertedCount = opportunities.filter(o => o.current_status === 'CONVERTED').length;
  const totalWonRevenue = opportunities
    .filter(o => o.current_status === 'CONVERTED')
    .reduce((sum, o) => sum + (o.final_agreed_price || o.quoted_price || 0), 0);

  // Helper to render editable cell
  const renderCell = (opp, field, displayValue, type = 'text', options = []) => {
    const isEditing = editingCell?.id === opp.id && editingCell?.field === field;

    if (isEditing) {
      if (type === 'select') {
        return (
          <select
            value={cellValue}
            onChange={(e) => setCellValue(e.target.value)}
            onBlur={() => handleSaveCell(opp.id, field)}
            autoFocus
            className="w-full px-1 py-0.5 border border-[#4A154B] rounded text-xs bg-white shadow-xs outline-none font-medium"
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }

      return (
        <input
          type={type}
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={() => handleSaveCell(opp.id, field)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveCell(opp.id, field);
            if (e.key === 'Escape') setEditingCell(null);
          }}
          autoFocus
          className="w-full px-1.5 py-0.5 border border-[#4A154B] rounded text-xs bg-white shadow-xs outline-none font-medium text-slate-900"
        />
      );
    }

    return (
      <div
        onClick={() => handleStartEdit(opp.id, field, opp[field])}
        title="Click to edit"
        className="cursor-pointer hover:bg-purple-50 hover:ring-1 hover:ring-[#4A154B]/30 rounded px-1.5 py-0.5 transition -mx-1"
      >
        {displayValue || <span className="text-slate-300 italic text-[11px]">—</span>}
      </div>
    );
  };

  const superAdminTabs = [
    { id: 'referrals', label: 'Incoming Referrals', icon: 'referrals', badge: pendingReferralTriage },
    { id: 'pipeline', label: 'Lead Management', icon: 'dashboard' },
    { id: 'facilities', label: 'Client Details', icon: 'programs', badge: organizations.length },
    { id: 'payouts', label: 'Payouts & Rewards', icon: 'payouts' }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFBF7] flex flex-col lg:flex-row text-[#1D1C1D]">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <PortalSidebar
        tabs={superAdminTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser || { name: 'Super Admin', email: 'admin@company.com' }}
        portalType="super_admin"
        onOpenSubmitModal={onOpenAddModal}
      />

      {/* 2. MAIN CONTENT AREA ON THE RIGHT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-[1750px] w-full space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-[#4A154B] rounded-3xl p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HQ Central Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeTab === 'referrals' && 'Incoming Partner Referrals Inbox'}
              {activeTab === 'pipeline' && 'Lead Management'}
              {activeTab === 'facilities' && 'Client Details & Admin Intelligence'}
              {activeTab === 'payouts' && 'Partner Rewards & Commission Ledger'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {activeTab === 'referrals' && 'View and triage all leads, patients, and candidates referred to your company by external doctors, mentors, and partner entities.'}
              {activeTab === 'pipeline' && 'Comprehensive lead management grid for live status updates, fee negotiation, and client lifecycle tracking.'}
              {activeTab === 'facilities' && 'Monitor onboarded client businesses, assigned admin profiles, active referral programs launched, lead conversion performance, and revenue generated.'}
              {activeTab === 'payouts' && 'Disburse partner rewards via UPI, verify UTR receipt numbers, and review lifetime commissions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchAllData()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {activeTab === 'pipeline' && (
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#2EB67D] hover:bg-[#28A76F] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-[#2EB67D]/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Lead</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards (Only shown on Lead Management & Referrals tabs) */}
        {(activeTab === 'pipeline' || activeTab === 'referrals') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pipeline</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalLeads} Leads</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{ownLeadsCount} Direct • {referralLeadsCount} Partner Referrals</div>
            </div>

            <div
              onClick={() => setActiveTab('referrals')}
              className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
                activeTab === 'referrals'
                  ? 'bg-purple-50/80 border-[#4A154B] ring-2 ring-[#4A154B]/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-bold text-[#4A154B] uppercase tracking-wider flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Partner Referrals
              </div>
              <div className="text-2xl font-black text-[#4A154B] mt-1">{referralLeadsCount} Referred</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                {pendingReferralTriage} Awaiting Triage
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Converted Clients
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{convertedCount} Converted</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Won Pipeline</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Closed Revenue</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalWonRevenue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across all 3 brand verticals</div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: INCOMING PARTNER REFERRALS (DEDICATED "REFERRED TO ME" INBOX)      */}
        {/* ========================================================================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Triage Alert Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#4A154B] flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Leads Referred by Independent Partners & Doctors</h3>
                  <p className="text-xs text-slate-500">Every external lead submitted by advocates with full referrer identity and contact info.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-[#4A154B] border border-purple-200">
                  {partnerReferrals.length} Submissions
                </span>
              </div>
            </div>

            {/* Referrals Inbox Table */}
            {partnerReferrals.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-[#4A154B] flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No external partner referrals recorded yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When doctors, mentors, or registered advocates submit patients or student leads to your company, they will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Job ID & Date</th>
                        <th className="py-3.5 px-4">Referred Candidate / Client</th>
                        <th className="py-3.5 px-4">Referred By (Partner)</th>
                        <th className="py-3.5 px-4">Target Brand & Service</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Agreed Fee</th>
                        <th className="py-3.5 px-4 text-right">Quick Triage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partnerReferrals.map(opp => (
                        <tr key={opp.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-50 text-[#4A154B] border border-purple-200">
                              {opp.job_id}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{opp.date_added}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{opp.client_name || opp.person_contacted}</div>
                            {opp.person_contacted && opp.person_contacted !== opp.client_name && (
                              <div className="text-[11px] text-slate-500">Contact: {opp.person_contacted}</div>
                            )}
                            {opp.phone && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" /> {opp.phone}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#4A154B]">{opp.referrer_name || 'Partner Doctor'}</div>
                            {opp.referrer_org && (
                              <div className="text-[11px] text-slate-600">{opp.referrer_org}</div>
                            )}
                            {opp.referrer_phone && (
                              <div className="text-[10px] text-slate-400 mt-0.5">{opp.referrer_phone}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-1">
                              {opp.target_entity_name || opp.target_entity_id}
                            </span>
                            <div className="font-semibold text-slate-800">{opp.service_product}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              opp.current_status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                              opp.current_status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {opp.current_status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {opp.final_agreed_price ? `₹${Number(opp.final_agreed_price).toLocaleString()}` : opp.quoted_price ? `₹${Number(opp.quoted_price).toLocaleString()}` : '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {opp.current_status !== 'CONVERTED' ? (
                                <button
                                  onClick={() => handleStatusChange(opp, 'CONVERTED')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                                >
                                  Convert ✓
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700">Converted ✓</span>
                              )}
                              <button
                                onClick={() => onEditOpportunity(opp)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                              >
                                Edit
                              </button>
                            </div>
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
        {/* TAB 2: LEAD MANAGEMENT                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              
              {/* Brand Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Brand:</span>
                
                <button
                  onClick={() => setSelectedEntity('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedEntity === 'all'
                      ? 'bg-[#4A154B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Brands
                </button>

                <button
                  onClick={() => setSelectedEntity('ottobon')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                    selectedEntity === 'ottobon'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Ottobon Academy</span>
                </button>

                <button
                  onClick={() => setSelectedEntity('medcy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                    selectedEntity === 'medcy'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Medcy Health Tech</span>
                </button>

                <button
                  onClick={() => setSelectedEntity('sbloom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                    selectedEntity === 'sbloom'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>sBloom</span>
                </button>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    sourceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({opportunities.length})
                </button>
                <button
                  onClick={() => setSourceFilter('own')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    sourceFilter === 'own' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏢 Direct ({ownLeadsCount})
                </button>
                <button
                  onClick={() => setSourceFilter('referral')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    sourceFilter === 'referral' ? 'bg-[#4A154B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎁 Referrals ({referralLeadsCount})
                </button>
              </div>

            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Job ID, Client, Person, Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A154B] bg-white"
              />
            </div>

            {/* Lead Management Grid Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-[72vh]">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 bg-[#FAF9F5] z-10 text-slate-700 border-b border-slate-300 select-none">
                    <tr>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[100px]">Job id</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[120px]">Lead Source</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[110px]">Date Added</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[180px]">Client</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[140px]">Person Contacted</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[140px]">Designation / Role</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[160px]">Service / Product</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[200px]">Requirement Breakdown</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[150px] bg-slate-200/70">Current Status</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[240px]">Last Discussion</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[110px]">Quoted Price</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[120px]">Pricing Type</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[110px]">Quote Status</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[130px] bg-emerald-50 text-emerald-900">Final Agreed Price</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[180px]">Next Action</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[120px]">Follow-up Date</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[130px]">Product Owner</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[120px]">Conversion Date</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[140px]">Lost Reason</th>
                      <th className="py-3 px-3 font-bold border-r border-slate-200 min-w-[180px]">Remarks</th>
                      <th className="py-3 px-3 font-bold text-center min-w-[60px]">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {displayedOpportunities.map((opp, idx) => (
                      <tr key={opp.id} className={`hover:bg-purple-50/40 transition group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                          {renderCell(opp, 'job_id', opp.job_id)}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          {opp.referring_user_id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-[#4A154B] border border-purple-200">
                              <Gift className="w-3 h-3 text-[#4A154B]" /> Referral
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              <Building2 className="w-3 h-3 text-blue-600" /> Own Lead
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'date_added', opp.date_added, 'date')}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">{renderCell(opp, 'client_name', opp.client_name)}</td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-200">{renderCell(opp, 'person_contacted', opp.person_contacted)}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'designation_role', opp.designation_role)}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">{renderCell(opp, 'service_product', opp.service_product)}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'requirement_breakdown', opp.requirement_breakdown)}</td>
                        <td className="py-2 px-3 border-r border-slate-200 bg-slate-50/80">
                          <select
                            value={opp.current_status || 'SUBMITTED'}
                            onChange={(e) => handleStatusChange(opp, e.target.value)}
                            className="w-full text-xs font-bold py-1 px-2 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="IN DISCUSSION">IN DISCUSSION</option>
                            <option value="PROPOSAL SENT">PROPOSAL SENT</option>
                            <option value="CONVERTED">CONVERTED ✓</option>
                            <option value="NOT CONVERTED">NOT CONVERTED ✕</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'last_discussion', opp.last_discussion)}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">{renderCell(opp, 'quoted_price', opp.quoted_price ? `₹${opp.quoted_price}` : null, 'number')}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'pricing_type', opp.pricing_type, 'select', ['One-Time', 'monthly', 'Quarterly', 'Annual'])}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'quote_status', opp.quote_status, 'select', ['Draft', 'Sent', 'agreed', 'Declined'])}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-200">{renderCell(opp, 'final_agreed_price', opp.final_agreed_price ? `₹${opp.final_agreed_price}` : null, 'number')}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'next_action', opp.next_action)}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'follow_up_date', opp.follow_up_date, 'date')}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'product_owner', opp.product_owner)}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'conversion_date', opp.conversion_date, 'date')}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'lost_reason', opp.lost_reason)}</td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{renderCell(opp, 'remarks', opp.remarks)}</td>
                        <td className="py-2 px-3 text-center">
                          <button onClick={() => onEditOpportunity(opp)} className="p-1 rounded hover:bg-slate-200 text-slate-600">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLIENT DETAILS (ADMIN DIRECTORY & INDIVIDUAL ADMIN INTELLIGENCE)  */}
        {/* ========================================================================= */}
        {activeTab === 'facilities' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* VIEW A: INDIVIDUAL ADMIN DRILLDOWN (WHEN AN ADMIN IS CLICKED) */}
            {selectedAdminId ? (() => {
              const activeOrg = organizations.find(o => o.id === selectedAdminId);
              if (!activeOrg) return null;
              const summary = activeOrg.leads_summary || { total: 0, converted: 0, in_discussion: 0, conversion_rate: 0, total_revenue_earned: 0 };
              const programs = activeOrg.programs_launched || [];
              const leads = activeOrg.leads || [];

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Top Navigation & Admin Identity Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedAdminId(null)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <span>← Back to All Admins</span>
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A154B]/10 text-[#4A154B]">
                            {activeOrg.category || 'Client Business'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ● {activeOrg.status || 'ACTIVE'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{activeOrg.id}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-heading mt-0.5">{activeOrg.name}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#FAF9F5] p-3 rounded-2xl border border-slate-200 text-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {activeOrg.admin?.name ? activeOrg.admin.name[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{activeOrg.admin?.name || activeOrg.contact_person || 'Facility Admin'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{activeOrg.admin?.email || activeOrg.email} • {activeOrg.phone || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Performance Metrics SPECIFIC to this Selected Admin */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leads Received</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2 font-heading">{summary.total}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Total inbound routed to this admin</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Actually Converted</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 mt-2 font-heading">{summary.converted}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">Enrolled / Admitted</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Conversion Rate</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#4A154B] flex items-center justify-center font-bold">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#4A154B] mt-2 font-heading">{summary.conversion_rate}%</div>
                      <div className="text-[11px] text-purple-600 mt-1">Lead success percentage</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Revenue via Referrals</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-800 mt-2 font-heading font-mono">
                        ₹{Number(summary.total_revenue_earned || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Gross client tuition & deal value</div>
                    </div>
                  </div>

                  {/* Referral Programs Launched by THIS Admin */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#4A154B]" />
                          <span>Referral Programs Launched ({programs.length})</span>
                        </h3>
                        <p className="text-xs text-slate-500">Active campaigns and commission rewards launched for this institution</p>
                      </div>
                      <div className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                        Default Reward: ₹{Number(activeOrg.reward_amount || 5000).toLocaleString('en-IN')} / referral
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {programs.map(prog => (
                        <div key={prog.id} className="p-4 rounded-2xl border border-slate-200 bg-[#FAF9F5] flex flex-col justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm">{prog.title}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                            </div>
                            <div className="text-slate-600 text-xs mt-1">
                              Target Audience: <strong className="text-slate-800">{prog.target_audience}</strong>
                            </div>
                            <div className="text-slate-400 text-[11px] mt-1">{prog.terms}</div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Commission per verified lead:</span>
                            <span className="font-mono font-black text-emerald-600 text-sm">
                              ₹{Number(prog.reward_per_lead).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Inbound Leads Routed to THIS Admin */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Inbound Leads & Referrals ({leads.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500">All student admissions, patients, or corporate leads dispatched to this admin's desk</p>
                    </div>

                    {leads.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#FAF9F5] border border-slate-200 text-center text-slate-400 text-xs">
                        No leads currently recorded for this admin.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3">Job ID</th>
                              <th className="p-3">Student / Candidate</th>
                              <th className="p-3">Course / Program</th>
                              <th className="p-3">Referred By (Advocate)</th>
                              <th className="p-3">Current Status</th>
                              <th className="p-3">Agreed Fee</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {leads.map(lead => (
                              <tr key={lead.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-purple-50 text-[#4A154B] border border-purple-200">
                                    {lead.job_id}
                                  </span>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{lead.date_added}</div>
                                </td>
                                
                                <td className="p-3">
                                  <div className="font-bold text-slate-900 text-sm">{lead.person_contacted || lead.client_name}</div>
                                  {lead.designation_role && (
                                    <div className="text-[11px] text-slate-500 font-medium">{lead.designation_role}</div>
                                  )}
                                  {lead.phone ? (
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="inline-flex items-center gap-1 mt-1 text-xs font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition"
                                    >
                                      <Phone className="w-3 h-3 text-blue-600" /> {lead.phone}
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 mt-0.5 block">No phone provided</span>
                                  )}
                                  {lead.email && (
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.email}</div>
                                  )}
                                </td>

                                <td className="p-3">
                                  <div className="font-bold text-slate-800">{lead.service_product}</div>
                                  {lead.clinical_intake_notes && (
                                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 max-w-xs">
                                      {lead.clinical_intake_notes}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-[#4A154B]" />
                                    <span>{lead.referrer_name || 'Direct Lead'}</span>
                                  </div>
                                  {lead.referrer_phone && (
                                    <a
                                      href={`tel:${lead.referrer_phone}`}
                                      className="text-[11px] text-slate-700 font-mono font-semibold flex items-center gap-1 mt-1 hover:text-blue-600"
                                    >
                                      <Phone className="w-2.5 h-2.5 text-slate-400" /> {lead.referrer_phone}
                                    </a>
                                  )}
                                  {lead.referrer_email && (
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.referrer_email}</div>
                                  )}
                                  {lead.referrer_org && (
                                    <span className="inline-block mt-1 text-[10px] font-bold text-[#4A154B] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                      {lead.referrer_org}
                                    </span>
                                  )}
                                </td>

                                <td className="p-3 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    lead.current_status === 'CONVERTED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {lead.current_status}
                                  </span>
                                </td>

                                <td className="p-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                                  ₹{Number(lead.final_agreed_price || lead.quoted_price || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              );
            })() : (
              /* VIEW B: CLEAN ADMINS & CLIENTS DIRECTORY (DEFAULT LIST) */
              <div className="space-y-4">
                
                {/* Search Bar & Onboard Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search admins by name, email, institution, city..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A154B] bg-white"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Onboard New Client Admin</span>
                  </button>
                </div>

                {/* Admins Table / Directory List */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-[#FAF9F5] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 font-heading">Onboarded Client Admins Directory</h3>
                      <p className="text-xs text-slate-500">Select any admin to view their leads, launched referral programs, and earnings</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4A154B]/10 text-[#4A154B]">
                      {filteredOrganizations.length} Registered Admins
                    </span>
                  </div>

                  {filteredOrganizations.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      No admin records found matching "{clientSearchQuery}".
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-4">Admin Name & Role</th>
                            <th className="p-4">Institution / Client</th>
                            <th className="p-4">Category & Location</th>
                            <th className="p-4">Login Email & Contact</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrganizations.map(org => {
                            const admin = org.admin || {};
                            return (
                              <tr 
                                key={org.id} 
                                onClick={() => setSelectedAdminId(org.id)}
                                className="hover:bg-purple-50/40 cursor-pointer transition"
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {admin.name ? admin.name[0].toUpperCase() : org.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 text-sm">
                                        {admin.name || org.contact_person || 'Facility Admin'}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4 font-bold text-slate-800 text-sm">{org.name}</td>

                                <td className="p-4">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A154B]/10 text-[#4A154B]">
                                    {org.category || 'Education'}
                                  </span>
                                  <div className="text-[11px] text-slate-500 mt-0.5">{org.city || 'India'}</div>
                                </td>

                                <td className="p-4">
                                  <div className="font-mono font-bold text-slate-800">{admin.email || org.email}</div>
                                  <div className="text-[11px] text-slate-500 font-mono">{org.phone || admin.phone || '—'}</div>
                                </td>

                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    ● {org.status || 'ACTIVE'}
                                  </span>
                                </td>

                                <td className="p-4 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAdminId(org.id);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
                                  >
                                    <span>View Admin Details</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REWARDS & COMMISSION PAYOUTS LEDGER                                */}
        {/* ========================================================================= */}
        {activeTab === 'payouts' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Partner Commission & Payout Management</h3>
                  <p className="text-xs text-slate-500">Track and dispatch referral rewards to advocates upon verified conversion</p>
                </div>
              </div>

              {rewards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No reward records currently generated. Rewards trigger automatically when an opportunity is marked CONVERTED.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Reward ID</th>
                        <th className="py-3 px-4">Referrer Name</th>
                        <th className="py-3 px-4">Referred Client / Opp</th>
                        <th className="py-3 px-4">Reward Value</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Disbursement Ref</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rewards.map(rew => (
                        <tr key={rew.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{rew.id}</td>
                          <td className="py-3.5 px-4 font-bold text-[#4A154B]">{rew.user_name || 'Advocate'}</td>
                          <td className="py-3.5 px-4">{rew.opportunity_name || 'Client Referral'}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-sm">
                            ₹{Number(rew.reward_value || 5000).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              rew.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {rew.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{rew.payout_reference || '—'}</td>
                          <td className="py-3.5 px-4 text-right">
                            {rew.status !== 'PAID' ? (
                              <button
                                onClick={() => setPayoutModalRew(rew)}
                                className="px-3 py-1.5 rounded-lg bg-[#2EB67D] hover:bg-[#28A76F] text-white font-bold text-xs shadow-xs"
                              >
                                Mark Paid & Enter UTR
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-600">✓ Dispatched</span>
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

      </main>

      {/* Conversion Confirmation Modal */}
      {convertModalOpp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="text-base font-black text-slate-900 mb-1">
              Confirm Conversion • {convertModalOpp.job_id}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Client: <strong className="text-slate-900">{convertModalOpp.client_name}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Final Billed / Agreed Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={agreedPriceInput}
                  onChange={(e) => setAgreedPriceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/50 font-bold text-emerald-900 focus:ring-2 focus:ring-[#4A154B] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertModalOpp(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConversion}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Confirm & Unlock Commission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Dispatch Modal */}
      {payoutModalRew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h2 className="text-base font-black text-slate-900 mb-1">
              Mark Reward as Paid • {payoutModalRew.id}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Advocate: <strong className="text-slate-900">{payoutModalRew.user_name}</strong> • Amount: <strong className="text-emerald-700">₹{payoutModalRew.reward_value}</strong>
            </p>

            <form onSubmit={handleMarkRewardPaid} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank / UPI Transaction Reference (UTR / Txn ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-8934019284 / UPI-992384"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#4A154B] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayoutModalRew(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPayout}
                  className="px-5 py-2 rounded-xl bg-[#2EB67D] hover:bg-[#28A76F] text-white font-bold transition shadow-sm"
                >
                  {isUpdatingPayout ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Comprehensive Dossier Modal */}
      {selectedClientDossier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden text-xs">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#4A154B] text-white flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-emerald-300">
                    {selectedClientDossier.category || 'Client Business'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">{selectedClientDossier.id}</span>
                </div>
                <h2 className="text-2xl font-black text-white font-heading">{selectedClientDossier.name}</h2>
                <div className="text-xs text-slate-300 mt-0.5">{selectedClientDossier.city || 'India'}</div>
              </div>

              <button
                onClick={() => setSelectedClientDossier(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Section 1: Admin Profile Strip */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Assigned Client Administrator Profile</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-slate-500 text-[11px]">Admin Personnel</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedClientDossier.admin?.name || selectedClientDossier.contact_person || 'Facility Admin'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Login Email</div>
                    <div className="font-mono font-bold text-[#4A154B] text-xs mt-0.5">
                      {selectedClientDossier.admin?.email || selectedClientDossier.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Contact Phone</div>
                    <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                      {selectedClientDossier.phone || selectedClientDossier.admin?.phone || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: 4 Stats Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Leads Received</div>
                  <div className="text-xl font-black text-slate-900 mt-1 font-heading">
                    {selectedClientDossier.leads_summary?.total || 0}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Converted</div>
                  <div className="text-xl font-black text-emerald-600 mt-1 font-heading">
                    {selectedClientDossier.leads_summary?.converted || 0}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-[10px] font-bold text-purple-700 uppercase">Conversion Rate</div>
                  <div className="text-xl font-black text-[#4A154B] mt-1 font-heading">
                    {selectedClientDossier.leads_summary?.conversion_rate || 0}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Referral Revenue Earned</div>
                  <div className="text-lg font-black text-emerald-800 mt-1 font-heading font-mono">
                    ₹{Number(selectedClientDossier.leads_summary?.total_revenue_earned || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Section 3: Referral Programs Launched */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#4A154B]" />
                  <span>Referral Campaigns Launched by this Client ({selectedClientDossier.programs_launched?.length || 0})</span>
                </h4>

                <div className="space-y-2.5">
                  {(selectedClientDossier.programs_launched || []).map(prog => (
                    <div key={prog.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{prog.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Target Audience: <strong className="text-slate-700">{prog.target_audience}</strong>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{prog.terms}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-3 py-1 rounded-full font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 text-sm">
                          ₹{Number(prog.reward_per_lead).toLocaleString('en-IN')} / lead
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Complete Leads Dispatched Table */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>All Inbound Referrals & Leads Routed to {selectedClientDossier.name} ({selectedClientDossier.leads?.length || 0})</span>
                </h4>

                {(!selectedClientDossier.leads || selectedClientDossier.leads.length === 0) ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-400">
                    No leads or admissions recorded for this client yet.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto max-h-60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                          <tr>
                            <th className="p-3">Job ID</th>
                            <th className="p-3">Contact Person / Lead</th>
                            <th className="p-3">Program / Service</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Agreed Fee</th>
                            <th className="p-3">Referrer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedClientDossier.leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{lead.job_id}</td>
                              <td className="p-3">
                                <div className="font-bold text-slate-800">{lead.person_contacted || lead.client_name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{lead.phone || lead.email || '—'}</div>
                              </td>
                              <td className="p-3 font-medium text-slate-700">{lead.service_product}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  lead.current_status === 'CONVERTED' 
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {lead.current_status}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-700">
                                ₹{Number(lead.final_agreed_price || lead.quoted_price || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-[#4A154B]">{lead.referrer_name || 'Direct Client'}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{lead.referrer_email || ''}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F5] border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedClientDossier(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Onboard New Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 font-heading">Onboard New Client Business</h2>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardClient} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Multi-Specialty Hospital"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newClientForm.category}
                    onChange={(e) => setNewClientForm({ ...newClientForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                  >
                    <option value="Education">Education / College</option>
                    <option value="Healthcare">Healthcare / Hospital</option>
                    <option value="Defence Academy">Defence Academy</option>
                    <option value="Technology">Technology / Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={newClientForm.city}
                    onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={newClientForm.contact_person}
                    onChange={(e) => setNewClientForm({ ...newClientForm, contact_person: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@apexhospital.com"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    placeholder="admin123"
                    value={newClientForm.admin_password}
                    onChange={(e) => setNewClientForm({ ...newClientForm, admin_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Referral Reward (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newClientForm.reward_amount}
                    onChange={(e) => setNewClientForm({ ...newClientForm, reward_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4A154B] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold transition shadow-sm"
                >
                  Onboard Client & Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
