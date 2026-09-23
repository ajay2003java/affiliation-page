import React, { useState } from 'react';
import {
  ArrowRight, Check, Copy, Send, CheckCheck, Hash, Shield, Users,
  Building2, GitFork, Award, BarChart3, PieChart, ChevronRight,
  ExternalLink, Lock, CheckCircle, FileText,
  Clock, Stethoscope, GraduationCap, Play, Smartphone, RefreshCw,
  Calculator, Wallet, TrendingUp, Zap, Target, DollarSign,
  CheckCircle2, Layers, Globe, Building, ArrowUpRight, Compass,
  Gift, Briefcase, HelpCircle, UserCheck, PhoneCall, ReceiptText,
  BadgeCheck, School
} from 'lucide-react';

export default function LandingPage({ onStartReferring, onTrackRewards, currentUser }) {
  // Hero Interactive App Channel State
  const [heroTab, setHeroTab] = useState('all'); // 'all' | 'hospital' | 'academy' | 'growth'
  const [demoInput, setDemoInput] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Deep Plum Section Interactive Accordion State (0..3)
  const [activePlumTab, setActivePlumTab] = useState(0);

  // Interactive Earnings Calculator State
  const [calcReferrals, setCalcReferrals] = useState(5);
  const [calcCategory, setCalcCategory] = useState('defence'); // 'defence' | 'college' | 'school' | 'healthcare' | 'growth'

  const categoryRates = {
    defence: {
      name: 'Basara & Sainik Defence Academy',
      subtext: 'NDA, CDS, SSB Training Batches',
      rate: 5000,
      icon: '🛡️',
      badge: 'Defence & Armed Forces'
    },
    college: {
      name: 'Bansal Intermediate College',
      subtext: 'Science, Commerce & Arts Degree Intake',
      rate: 4000,
      icon: '🎓',
      badge: 'Higher Education'
    },
    school: {
      name: 'Basara School Admissions',
      subtext: 'CBSE / State Board K-12 Admissions',
      rate: 3000,
      icon: '🏫',
      badge: 'K-12 Schooling'
    },
    healthcare: {
      name: 'City Care Multispeciality Hospital',
      subtext: 'Orthopedics, Surgeries & Speciality OPD',
      rate: 4500,
      icon: '🏥',
      badge: 'Healthcare & Treatments'
    },
    growth: {
      name: 'sBloom Growth Suite',
      subtext: 'Local SEO, Patient Growth & CRM Retainers',
      rate: 5000,
      icon: '🌸',
      badge: 'Business Growth'
    }
  };

  const selectedRateData = categoryRates[calcCategory] || categoryRates.defence;
  const estimatedMonthly = calcReferrals * selectedRateData.rate;
  const estimatedAnnual = estimatedMonthly * 12;

  // Demo Feed Messages in Hero Canvas
  const [heroFeed, setHeroFeed] = useState([
    {
      id: 1,
      sender: 'Dr. Arvind Sharma (Referrer)',
      avatar: '👨‍⚕️',
      time: '10:14 AM',
      category: 'hospital',
      title: 'City Care Multispeciality Hospital',
      text: 'Referred patient Ananya Sharma for Orthopedic Consultation & Knee Care.',
      stage: 'OPD Intake Scheduled',
      payout: 'Direct Payout',
      stageColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 2,
      sender: 'City Care OPD Desk',
      avatar: '🏥',
      time: '10:28 AM',
      category: 'hospital',
      title: 'Counselor Dr. Mehta',
      text: 'Patient consulted in OPD. Procedure finalized. Admission confirmed for tomorrow!',
      stage: 'Verified & Converted',
      payout: 'Reward Unlocked',
      stageColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 3,
      sender: 'Payout Engine',
      avatar: '⚡',
      time: '10:30 AM',
      category: 'hospital',
      title: 'Instant UPI Dispatch',
      text: '🎉 Payout Dispatched! Referral reward credited to Dr. Arvind via UPI. UTR: 8934019284.',
      stage: 'Payment Completed',
      payout: 'Transferred',
      stageColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://ref.platform.io/r/rahul-partner');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleSendHeroLead = (e) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    const newLead = {
      id: Date.now(),
      sender: 'You (Referrer)',
      avatar: '👤',
      time: 'Just now',
      category: heroTab === 'all' ? 'hospital' : heroTab,
      title: heroTab === 'academy' ? 'Ottobon Defence Academy' : heroTab === 'growth' ? 'sBloom Growth Suite' : 'City Care Hospital',
      text: demoInput,
      stage: 'Handoff in Progress',
      payout: 'Reward on conversion',
      stageColor: 'bg-blue-50 text-[#1264A3] border-blue-200'
    };

    setHeroFeed(prev => [...prev, newLead]);
    setDemoInput('');

    setTimeout(() => {
      const responseMsg = {
        id: Date.now() + 1,
        sender: heroTab === 'academy' ? 'Ottobon Admissions' : heroTab === 'growth' ? 'sBloom Client Desk' : 'City Care OPD Desk',
        avatar: heroTab === 'academy' ? '🎓' : heroTab === 'growth' ? '🌸' : '🏥',
        time: 'Just now',
        category: heroTab === 'all' ? 'hospital' : heroTab,
        title: 'Partner Counselor Response',
        text: 'Received! Our senior desk has initiated contact. Tracking ID created: #REF-' + Math.floor(1000 + Math.random() * 9000),
        stage: 'In Consultation',
        payout: 'Tracking Active',
        stageColor: 'bg-amber-50 text-amber-800 border-amber-200'
      };
      setHeroFeed(prev => [...prev, responseMsg]);
    }, 1200);
  };

  // Plum Accordion Items
  const plumFeatures = [
    {
      title: 'Instant counselor handoff in under 2 hours',
      desc: 'Referred leads reach dedicated hospital OPD coordinators and academy deans immediately with complete requirement context.',
      badge: 'SPEED & ACCURACY',
      metric: '< 2 Hours Handoff'
    },
    {
      title: 'Live stage-by-stage milestone tracker',
      desc: 'Follow candidate progression from first contact to campus visit, consultation, enrollment, and reward unlock in real time.',
      badge: 'ZERO GUESSWORK',
      metric: '100% Visibility'
    },
    {
      title: 'Automated UPI & bank payouts upon conversion',
      desc: 'No invoicing or chasing accounts teams. Payouts trigger automatically upon verified intake with downloadable receipts.',
      badge: 'INSTANT REWARDS',
      metric: 'Direct Payouts'
    },
    {
      title: 'Zero lost WhatsApp chats or commission disputes',
      desc: 'Every referral is tied to encrypted attribution IDs, eliminating duplicate claims, lost messages, and forgotten commissions.',
      badge: 'ENCRYPTED LEDGER',
      metric: '0 Lost Leads'
    }
  ];

  const filteredFeed = heroFeed.filter(item => {
    if (heroTab === 'all') return true;
    return item.category === heroTab;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1D1C1D] font-sans antialiased selection:bg-[#ECB22E] selection:text-[#1D1C1D]">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION — SLACK LIGHT GRADIENT & INTERACTIVE DESKTOP WINDOW       */}
      {/* ========================================================================= */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A154B]/10 border border-[#4A154B]/15 text-[#4A154B] text-xs font-bold font-heading tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#2EB67D]"></span>
            THE TRUSTED REFERRAL & OPPORTUNITY NETWORK
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-[82px] font-extrabold font-heading tracking-tight leading-[1.05]">
            <span className="text-[#4A154B]">Refer & Earn</span>
          </h1>

          {/* Direct & Humanized Subtitle */}
          <p className="text-lg sm:text-2xl text-[#616061] font-normal leading-relaxed max-w-2xl mx-auto">
            connect right customers to right business
          </p>

          {/* Dual CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartReferring}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold font-heading text-base shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>START REFERRING FREE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('programs-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-[#1D1C1D] font-bold font-heading text-base border-2 border-[#1D1C1D]/15 shadow-sm transition-all"
            >
              EXPLORE PROGRAMS
            </button>
          </div>

          {/* Feature Highlight Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#616061] font-semibold pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2EB67D]" /> Instant UPI Payouts
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2EB67D]" /> Real-Time Stage Tracker
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2EB67D]" /> 100% Attribution Guarantee
            </span>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. PARTNER TRUST STRIP                                                    */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-y border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="text-xs font-bold font-heading uppercase tracking-widest text-[#616061]">
            REFER CANDIDATES & PATIENTS DIRECTLY TO ACCREDITED INSTITUTIONS
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">🎓</span> Bansal Intermediate College
            </div>
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">🛡️</span> Basara Defence Academy
            </div>
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">🏫</span> Basara School
            </div>
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">⚔️</span> Sainik Academy
            </div>
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">🏥</span> City Care Hospital
            </div>
            <div className="flex items-center gap-2 text-base font-bold font-heading text-[#1D1C1D]">
              <span className="text-2xl">🌸</span> sBloom Growth Suite
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHAT THIS PLATFORM IS ACTUALLY FOR (CORE PURPOSE & PROBLEM/SOLUTION)   */}
      {/* ========================================================================= */}
      <section id="what-we-do" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A154B]/10 border border-[#4A154B]/20 text-[#4A154B] text-xs font-bold font-heading uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#4A154B]" />
            WHAT THIS PLATFORM IS ACTUALLY FOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1D1C1D] tracking-tight">
            Turn informal word-of-mouth into a reliable, rewarding revenue stream.
          </h2>
          <p className="text-base sm:text-lg text-[#616061] leading-relaxed">
            Every day, you recommend schools, defense academies, and healthcare clinics to friends, family, and peers. When done over WhatsApp or phone calls, referrals get lost, progress is invisible, and rewards never reach you. This platform fixes that completely.
          </p>
        </div>

        {/* Problem vs Solution Split Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: The Broken Informal Way */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                  ✕
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-600 font-heading">The Old Way</div>
                  <div className="text-lg font-bold text-slate-900 font-heading">Informal & Untracked Referrals</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                0% Visibility
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
                <p><strong>Lost in WhatsApp chats:</strong> You send a student's number to an academy or clinic, and it gets buried under hundreds of messages.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
                <p><strong>No conversion visibility:</strong> You never know if the candidate actually visited the campus, attended counseling, or paid admission fees.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
                <p><strong>Unpaid or disputed rewards:</strong> Constant awkward follow-ups asking for promised referral fees with zero receipts or proof.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
                <p><strong>Cold candidate experience:</strong> Leads receive cold sales calls with no context regarding why they were referred.</p>
              </div>
            </div>
          </div>

          {/* Card 2: The Verified Referral Platform Way */}
          <div className="bg-emerald-50/50 border border-emerald-300 rounded-3xl p-8 space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">Our Platform</div>
                  <div className="text-lg font-bold text-slate-900 font-heading">Verified, Tracked & Rewarded</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Attribution
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
                <p><strong>100% Cryptographic Attribution:</strong> Every referral gets a unique encrypted Tracking ID permanently bound to your account.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
                <p><strong>Live Milestone Progress:</strong> Track real-time status as counselors contact the lead, schedule campus visits, and confirm admissions.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
                <p><strong>Instant Direct UPI Payouts:</strong> Automated reward dispatch with bank UTR receipts directly to your UPI/bank the moment fees clear.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
                <p><strong>VIP Counselor Care in &lt;2h:</strong> Senior institution deans and hospital coordinators reach out warmly with complete candidate context.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Who Can Use This Platform */}
        <div className="bg-white rounded-3xl border border-[#E0E0E0] p-8 sm:p-10 shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#1D1C1D]">
              Who benefits from this platform?
            </h3>
            <p className="text-xs sm:text-sm text-[#616061]">
              Built for anyone with a trusted community, professional network, or local reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-2xl">👨‍🏫</div>
              <h4 className="font-bold text-[#1D1C1D] text-sm font-heading">Teachers & Tutors</h4>
              <p className="text-xs text-[#616061] leading-relaxed">
                Refer students seeking NDA, CDS, board exams, or college admissions to accredited institutions and earn ₹3,000–₹5,000 per admission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-2xl">👨‍⚕️</div>
              <h4 className="font-bold text-[#1D1C1D] text-sm font-heading">Doctors & Clinic Staff</h4>
              <p className="text-xs text-[#616061] leading-relaxed">
                Connect patients requiring specialized surgery, orthopedic care, or diagnostics to City Care Hospital with priority OPD intake.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-2xl">💼</div>
              <h4 className="font-bold text-[#1D1C1D] text-sm font-heading">Community Leaders</h4>
              <p className="text-xs text-[#616061] leading-relaxed">
                Help families in your town or neighborhood find the best schools and career coaching academies while earning transparent monthly income.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-2xl">🏢</div>
              <h4 className="font-bold text-[#1D1C1D] text-sm font-heading">Business Advisors</h4>
              <p className="text-xs text-[#616061] leading-relaxed">
                Introduce clinics, institutes, and local businesses to sBloom Growth Suite for SEO and patient acquisition and earn ₹5,000 per client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (STEP-BY-STEP VISUAL WORKFLOW)                            */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-[#FAF9F6] border-y border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1264A3]/10 border border-[#1264A3]/20 text-[#1264A3] text-xs font-bold font-heading uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#1264A3]" />
              SIMPLE 4-STEP PROCESS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1D1C1D] tracking-tight">
              How it works: From recommendation to instant payout.
            </h2>
            <p className="text-base sm:text-lg text-[#616061] leading-relaxed">
              No complex contracts, no delays. Start in under a minute with complete transparency at every stage.
            </p>
          </div>

          {/* 4-Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-7 shadow-md flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[#4A154B] text-white font-extrabold font-mono text-sm flex items-center justify-center shadow-sm">
                    01
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#4A154B] text-[11px] font-bold font-heading border border-purple-100">
                    Step 1
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-[#1D1C1D]">
                  Pick a Partner Program
                </h3>
                <p className="text-xs text-[#616061] leading-relaxed">
                  Browse accredited institutions including <strong>Bansal College</strong>, <strong>Basara Defence</strong>, <strong>Basara School</strong>, <strong>Sainik Academy</strong>, or <strong>City Care Hospital</strong>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#4A154B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2EB67D]" />
                <span>Verified reward rates</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-7 shadow-md flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[#1264A3] text-white font-extrabold font-mono text-sm flex items-center justify-center shadow-sm">
                    02
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1264A3] text-[11px] font-bold font-heading border border-blue-100">
                    Step 2
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-[#1D1C1D]">
                  Submit Lead or Share Link
                </h3>
                <p className="text-xs text-[#616061] leading-relaxed">
                  Enter the candidate's name, contact, and requirement via our 1-click form, or share your personalized referral link directly over WhatsApp.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#1264A3] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2EB67D]" />
                <span>100% Attribution Lock</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-7 shadow-md flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[#ECB22E] text-slate-950 font-extrabold font-mono text-sm flex items-center justify-center shadow-sm">
                    03
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold font-heading border border-amber-200">
                    Step 3
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-[#1D1C1D]">
                  Track Live Milestones
                </h3>
                <p className="text-xs text-[#616061] leading-relaxed">
                  Counselors engage the lead within 2 hours. Watch the live timeline update: <em>Contacted → Campus Visit → Confirmed Admission</em>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2EB67D]" />
                <span>Live timeline sync</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-7 shadow-md flex flex-col justify-between hover:border-[#2EB67D]/60 transition space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[#2EB67D] text-white font-extrabold font-mono text-sm flex items-center justify-center shadow-sm">
                    04
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold font-heading border border-emerald-200">
                    Step 4
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-[#1D1C1D]">
                  Get Paid via UPI / Bank
                </h3>
                <p className="text-xs text-[#616061] leading-relaxed">
                  The moment fees or treatment is confirmed, your payout is automatically credited to your UPI ID with a verified bank UTR receipt.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#2EB67D] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2EB67D]" />
                <span>Instant UTR Dispatch</span>
              </div>
            </div>

          </div>

          {/* Quick interactive trigger */}
          <div className="text-center pt-4">
            <button
              onClick={onStartReferring}
              className="px-8 py-4 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white font-bold font-heading text-sm shadow-md hover:shadow-lg transition active:scale-95 inline-flex items-center gap-2"
            >
              <span>TRY IT OUT: SUBMIT A REFERRAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW TO EARN MONEY & LIVE INTERACTIVE CALCULATOR                        */}
      {/* ========================================================================= */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2EB67D]/15 border border-[#2EB67D]/30 text-[#196b49] text-xs font-bold font-heading uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 text-[#2EB67D]" />
            EARNINGS & PAYOUT BLUEPRINT
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1D1C1D] tracking-tight">
            How you can earn money on this platform.
          </h2>
          <p className="text-base sm:text-lg text-[#616061] leading-relaxed">
            Transparent commissions, zero hidden deductions, and direct bank transfers. Use the interactive calculator below to see your monthly earning potential.
          </p>
        </div>

        {/* Interactive Calculator Component */}
        <div className="bg-white rounded-3xl border-2 border-[#4A154B]/20 p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="text-xs font-bold font-heading uppercase tracking-wider text-[#4A154B] flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Interactive Referral Earnings Estimator
              </div>
              <h3 className="text-2xl font-bold font-heading text-[#1D1C1D] mt-1">
                Estimate your monthly & annual payouts
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 text-[#2EB67D]" />
              <span>Real Institution Payout Rates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">

              {/* Category Selector Pills */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold font-heading uppercase tracking-wider text-[#616061] block">
                  1. Select Partner Program / Institution:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(categoryRates).map(([key, data]) => {
                    const isSelected = calcCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setCalcCategory(key)}
                        className={`p-3 rounded-2xl text-left border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#4A154B] text-white border-[#4A154B] shadow-md'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{data.icon}</span>
                          <div>
                            <div className="font-bold text-xs font-heading">{data.name}</div>
                            <div className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                              {data.badge}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-emerald-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          ₹{data.rate.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referrals Count Slider & Presets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-heading uppercase tracking-wider text-[#616061]">
                    2. Estimated Monthly Converted Referrals:
                  </label>
                  <span className="px-3 py-1 rounded-xl bg-[#4A154B]/10 text-[#4A154B] font-mono font-bold text-sm">
                    {calcReferrals} {calcReferrals === 1 ? 'Referral' : 'Referrals'} / month
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calcReferrals}
                  onChange={(e) => setCalcReferrals(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A154B]"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-[#616061]">Quick Presets:</span>
                  {[2, 5, 8, 12, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCalcReferrals(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-heading transition ${
                        calcReferrals === num
                          ? 'bg-[#4A154B] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-[#1D1C1D]'
                      }`}
                    >
                      {num} referrals
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Live Calculation Output Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#350d36] to-[#4A154B] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-xs font-bold font-heading uppercase tracking-wider text-emerald-300">
                  Estimated Earnings Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-bold">
                  ● Verified Formula
                </span>
              </div>

              {/* Main Number */}
              <div className="space-y-1">
                <div className="text-xs text-slate-300 font-medium">Estimated Monthly Income:</div>
                <div className="text-4xl sm:text-5xl font-extrabold font-heading text-emerald-300 tracking-tight">
                  ₹{estimatedMonthly.toLocaleString('en-IN')}
                  <span className="text-xs sm:text-sm font-normal text-slate-300 ml-1">/ month</span>
                </div>
              </div>

              {/* Annual Potential */}
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-300 font-medium">Projected Annual Potential:</div>
                  <div className="text-xl font-bold font-heading text-[#ECB22E] mt-0.5">
                    ₹{estimatedAnnual.toLocaleString('en-IN')} / year
                  </div>
                </div>
                <div className="text-2xl">🚀</div>
              </div>

              {/* Calculation Meta List */}
              <div className="space-y-2 text-xs text-slate-200 pt-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-300">Selected Institution:</span>
                  <span className="font-bold text-white text-right">{selectedRateData.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-300">Reward per Admission:</span>
                  <span className="font-bold text-emerald-300">₹{selectedRateData.rate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-300">Payout Speed:</span>
                  <span className="font-bold text-white">&lt; 24h via UPI / Bank</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onStartReferring}
                className="w-full py-3.5 rounded-xl bg-[#2EB67D] hover:bg-[#279f6d] text-slate-950 font-extrabold font-heading text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>START EARNING TODAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

        {/* 3 Core Pillars of How Money is Paid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E0E0E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
              ⚡
            </div>
            <h4 className="font-bold font-heading text-[#1D1C1D] text-base">Direct UPI Dispatch</h4>
            <p className="text-xs text-[#616061] leading-relaxed">
              No invoicing, no waiting for monthly settlement cycles. The moment a student or patient's admission is confirmed, the reward is pushed directly to your registered UPI ID.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E0E0E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1264A3] flex items-center justify-center font-bold text-xl">
              📜
            </div>
            <h4 className="font-bold font-heading text-[#1D1C1D] text-base">Official UTR Receipts</h4>
            <p className="text-xs text-[#616061] leading-relaxed">
              Every payout generates a permanent digital receipt with bank UTR transaction numbers and admission verification timestamps for complete accounting transparency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E0E0E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xl">
              🔒
            </div>
            <h4 className="font-bold font-heading text-[#1D1C1D] text-base">Zero Middleman Cuts</h4>
            <p className="text-xs text-[#616061] leading-relaxed">
              You receive 100% of the published reward rate. There are no brokerage cuts, platform commissions deducted from your payout, or hidden processing fees.
            </p>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE WORKSPACE CANVAS (SIMULATED CONSOLE - PRODUCT TOUR)        */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#350d36]/10 border border-[#350d36]/20 text-[#4A154B] text-xs font-bold font-heading uppercase tracking-wider">
            ⚡ LIVE INTERACTIVE SIMULATOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1D1C1D] tracking-tight">
            Experience the referral workspace in real time.
          </h2>
          <p className="text-base sm:text-lg text-[#616061]">
            Try sending a sample lead below to see how counselor handoffs, stage tracking, and instant UPI reward notifications work.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl overflow-hidden">

          {/* Top macOS Window Control Bar */}
          <div className="bg-[#350d36] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#522653]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EC5E5E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ECB22E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2EB67D]"></div>
              <span className="ml-3 font-bold font-heading text-xs text-white/95">Referral Desk • Multi-Partner Workspace</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2EB67D] animate-pulse"></span>
                Partner Intake Active
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-300">
                Ledger: ₹25L+ Paid
              </span>
            </div>
          </div>

          {/* Main App Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">

            {/* Left Channel Sidebar */}
            <div className="md:col-span-4 bg-[#3F0E40] text-slate-300 p-4 space-y-5 border-r border-[#522653]">

              {/* User Profile Info */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="font-bold font-heading text-white text-sm">Partner Referral Hub</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Rahul Sharma (Advocate)
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                  ⚡
                </div>
              </div>

              {/* Streams Filter */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[10px] font-bold font-heading uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Partner Intake Streams
                </div>

                <button
                  onClick={() => setHeroTab('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition font-semibold ${heroTab === 'all' ? 'bg-[#1164A3] text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 opacity-70" />
                    all-partner-leads
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white/20 text-white font-bold font-mono">
                    All
                  </span>
                </button>

                <button
                  onClick={() => setHeroTab('hospital')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition font-semibold ${heroTab === 'hospital' ? 'bg-[#1164A3] text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">🏥</span>
                    hospital-intakes
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                    Direct Payout
                  </span>
                </button>

                <button
                  onClick={() => setHeroTab('academy')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition font-semibold ${heroTab === 'academy' ? 'bg-[#1164A3] text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">🎓</span>
                    defence-admissions
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-bold">
                    Direct Payout
                  </span>
                </button>

                <button
                  onClick={() => setHeroTab('growth')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition font-semibold ${heroTab === 'growth' ? 'bg-[#1164A3] text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">🌸</span>
                    sbloom-growth-suite
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold">
                    Direct Payout
                  </span>
                </button>
              </div>

              {/* Active Counselor Status */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="text-[10px] font-bold font-heading uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Active Counselor Desks
                </div>

                <div className="px-3 py-1.5 text-slate-300 flex items-center gap-2 hover:bg-white/5 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Dr. Mehta (City Care OPD)</span>
                </div>
                <div className="px-3 py-1.5 text-slate-300 flex items-center gap-2 hover:bg-white/5 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Pooja M. (Admissions Dean)</span>
                </div>
              </div>

            </div>

            {/* Right Chat Stream & Interactive Form */}
            <div className="md:col-span-8 bg-white p-5 flex flex-col justify-between">

              {/* Channel Header */}
              <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#1D1C1D]" />
                  <div>
                    <div className="font-bold font-heading text-sm text-[#1D1C1D]">
                      {heroTab === 'hospital' && 'city-care-hospital-intakes'}
                      {heroTab === 'academy' && 'ottobon-defence-admissions'}
                      {heroTab === 'growth' && 'sbloom-growth-suite-deals'}
                      {heroTab === 'all' && 'all-active-referrals'}
                    </div>
                    <div className="text-[11px] text-[#616061]">
                      Direct intake pipeline connected to senior coordinators
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold font-heading border border-emerald-200">
                  <CheckCheck className="w-3.5 h-3.5" /> Instant Payout Ready
                </span>
              </div>

              {/* Messages Feed */}
              <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                {filteredFeed.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-base shrink-0">
                      {msg.avatar}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1D1C1D] font-heading">{msg.sender}</span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-heading border ${msg.stageColor}`}>
                          {msg.stage}
                        </span>
                      </div>

                      <p className="text-slate-700 text-xs leading-relaxed font-normal">
                        {msg.text}
                      </p>

                      <div className="pt-1 flex items-center gap-3 text-[11px] text-[#4A154B] font-bold font-heading">
                        <span>💰 Reward: {msg.payout}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#1264A3] hover:underline cursor-pointer">View Status Card →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Quick-Refer Box */}
              <form onSubmit={handleSendHeroLead} className="mt-4 pt-3 border-t border-[#E0E0E0]">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#4A154B]/20 focus-within:border-[#4A154B]">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder={
                      heroTab === 'hospital'
                        ? 'Try typing: "Referred Rajesh Kumar for Knee Surgery"'
                        : heroTab === 'academy'
                          ? 'Try typing: "Referred Amit Singh for NDA 2026 Batch"'
                          : 'Try typing: "Referred City Dental for Google SEO Suite"'
                    }
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#1D1C1D] focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4A154B] hover:bg-[#3B113C] text-white text-xs font-bold font-heading transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Send Lead</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-[#616061] mt-1.5 text-center font-medium">
                  💡 Type any sample referral above to test real-time counselor response & status tracking!
                </div>
              </form>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. DEEP PLUM INTERACTIVE FEATURE SECTION (SLACK STAR CANVAS)              */}
      {/* ========================================================================= */}
      <section id="slack-tour" className="py-20 bg-[#4A154B] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-14">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold font-heading uppercase tracking-wider">
              ✨ POWERFUL REFERRAL INFRASTRUCTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
              Reimagine what's possible with transparent referrals.
            </h2>
            <p className="text-base sm:text-lg text-slate-200">
              Automate partner handoffs, eliminate WhatsApp clutter, and dispatch instant UPI rewards the moment admissions happen.
            </p>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Interactive Tabs */}
            <div className="lg:col-span-5 space-y-3">
              {plumFeatures.map((item, idx) => {
                const isActive = activePlumTab === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePlumTab(idx)}
                    className={`p-5 rounded-2xl transition cursor-pointer border ${isActive
                      ? 'bg-white/15 border-white/40 shadow-xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold font-heading text-emerald-300 uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#ECB22E]">
                        {item.metric}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-white mb-1">
                      {item.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Interactive Dark Preview UI */}
            <div className="lg:col-span-7 bg-[#350d36] rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-slate-300 font-medium">Active Pipeline State</div>
                  <div className="text-lg font-bold font-heading text-white mt-0.5">
                    {plumFeatures[activePlumTab].title}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-bold font-heading text-xs">
                  ● Live Sync
                </span>
              </div>

              {/* Dynamic Mockup Content */}
              {activePlumTab === 0 && (
                <div className="space-y-3 text-xs">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 text-lg flex items-center justify-center font-bold">
                        🏥
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">City Care Hospital • Orthopedic Lead</div>
                        <div className="text-slate-300 text-[11px]">Handoff time: 14 mins • Assigned to Dr. Mehta</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold font-heading">
                      Consultation Active
                    </span>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 text-lg flex items-center justify-center font-bold">
                        🎓
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Ottobon Academy • NDA Defense Prep</div>
                        <div className="text-slate-300 text-[11px]">Handoff time: 22 mins • Assigned to Pooja M.</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold font-heading">
                      Campus Tour Booked
                    </span>
                  </div>
                </div>
              )}

              {activePlumTab === 1 && (
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
                  <div className="text-slate-300 font-medium">Candidate Stage Progression:</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
                      <div className="font-bold text-emerald-300">✓ Submitted</div>
                      <div className="text-[10px] text-slate-300">10:14 AM</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
                      <div className="font-bold text-emerald-300">✓ Contacted</div>
                      <div className="text-[10px] text-slate-300">10:28 AM</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/30 border border-blue-400">
                      <div className="font-bold text-blue-200">● Admitted</div>
                      <div className="text-[10px] text-blue-200">Today</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/30 border border-emerald-400">
                      <div className="font-bold text-emerald-300">₹ Rewarded</div>
                      <div className="text-[10px] text-emerald-300">Instant UPI</div>
                    </div>
                  </div>
                </div>
              )}

              {activePlumTab === 2 && (
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Automated UPI Payout Receipt:</span>
                    <span className="text-emerald-400 font-mono font-bold">UTR: 8934019284</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between font-mono">
                    <span className="text-white">Amount Transferred:</span>
                    <span className="text-2xl font-bold text-emerald-400 font-heading">₹5,000.00</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Paid directly to beneficiary UPI ID: rahul.sharma@okaxis • Receipt archived permanently.
                  </div>
                </div>
              )}

              {activePlumTab === 3 && (
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
                  <div className="font-bold font-heading text-white">100% Attribution Lock:</div>
                  <p className="text-slate-300 leading-relaxed">
                    Referral ID <code className="bg-black/40 px-2 py-0.5 rounded text-[#ECB22E]">#REF-9942</code> is cryptographically locked to your account. No other referrer or facility desk can overwrite your attribution.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THREE PROGRAM SHOWCASE CARDS                                           */}
      {/* ========================================================================= */}
      <section id="programs-grid" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold font-heading text-[#4A154B] uppercase tracking-wider">
            VERIFIED REFERRAL PROGRAMS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1D1C1D] tracking-tight">
            One platform. Multiple ways to refer and earn.
          </h2>
          <p className="text-base sm:text-lg text-[#616061]">
            Choose what fits your network. Every referral is handled with dedicated care and tracked from first call to final conversion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

          {/* Card 1: Healthcare */}
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-7 shadow-lg flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center border border-emerald-100">
                  🏥
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#2EB67D] font-bold font-heading text-xs border border-emerald-200">
                  Direct Reward / Patient
                </span>
              </div>

              <h3 className="text-2xl font-bold font-heading text-[#1D1C1D]">
                Healthcare & Surgeries
              </h3>

              <div className="text-xs font-bold text-[#4A154B]">
                Partner: City Care Multispeciality Hospital
              </div>

              <p className="text-sm text-[#616061] leading-relaxed">
                Know someone seeking orthopedic care, cardiology consultations, surgery, or diagnostic packages? Refer them directly to City Care Hospital. Our medical desk assists them within 2 hours.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-[#616061]">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Fast OPD / IPD intake within 24h
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Payout triggered upon admission
              </div>
              <button
                onClick={onStartReferring}
                className="w-full mt-3 py-3 rounded-xl bg-slate-100 hover:bg-[#4A154B] hover:text-white font-bold font-heading text-xs text-[#1D1C1D] transition"
              >
                Refer a Patient →
              </button>
            </div>
          </div>

          {/* Card 2: Education */}
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-7 shadow-lg flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center border border-blue-100">
                  🎓
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1264A3] font-bold font-heading text-xs border border-blue-200">
                  Direct Reward / Admission
                </span>
              </div>

              <h3 className="text-2xl font-bold font-heading text-[#1D1C1D]">
                Defence & Degree Coaching
              </h3>

              <div className="text-xs font-bold text-[#4A154B]">
                Partner: Ottobon & Bansal Defence Academy
              </div>

              <p className="text-sm text-[#616061] leading-relaxed">
                Know a student preparing for NDA, CDS, SSB interviews, or university degrees? Connect them with expert faculty and physical training. Earn referral rewards the moment they confirm enrollment.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-[#616061]">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Free counseling & campus tour
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Direct fee confirmation alerts
              </div>
              <button
                onClick={onStartReferring}
                className="w-full mt-3 py-3 rounded-xl bg-slate-100 hover:bg-[#4A154B] hover:text-white font-bold font-heading text-xs text-[#1D1C1D] transition"
              >
                Refer a Student →
              </button>
            </div>
          </div>

          {/* Card 3: Business Services */}
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-7 shadow-lg flex flex-col justify-between hover:border-[#4A154B]/40 transition space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-2xl flex items-center justify-center border border-purple-100">
                  🌸
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold font-heading text-xs border border-purple-200">
                  Direct Reward / Business
                </span>
              </div>

              <h3 className="text-2xl font-bold font-heading text-[#1D1C1D]">
                Business Growth & Marketing
              </h3>

              <div className="text-xs font-bold text-[#4A154B]">
                Partner: sBloom Growth Suite
              </div>

              <p className="text-sm text-[#616061] leading-relaxed">
                Know a clinic owner, hospital director, or local business looking to automate Google reviews, patient acquisition, and local SEO? Introduce them to sBloom and earn referral payout on contract sign-up.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-[#616061]">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Free marketing audit for the lead
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#2EB67D]" /> Instant reward upon retainer sign-up
              </div>
              <button
                onClick={onStartReferring}
                className="w-full mt-3 py-3 rounded-xl bg-slate-100 hover:bg-[#4A154B] hover:text-white font-bold font-heading text-xs text-[#1D1C1D] transition"
              >
                Refer a Business →
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. ALTERNATING FEATURE 1: "Give every referral instant context"            */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-y border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-bold font-heading text-[#4A154B] uppercase tracking-wider">
                01 • COMPLETE CONTEXT
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1D1C1D] tracking-tight leading-tight">
                Give every referral instant context.
              </h2>
              <p className="text-base text-[#616061] leading-relaxed">
                When you submit a contact, our counselors receive their specific background and requirements immediately—ensuring warm, personalized outreach without cold calls.
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-8">
                <div>
                  <div className="text-3xl font-extrabold font-heading text-[#4A154B]">24 Hours</div>
                  <div className="text-xs text-[#616061] font-medium">Average time to first consultation</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <div className="text-3xl font-extrabold font-heading text-[#2EB67D]">98%</div>
                  <div className="text-xs text-[#616061] font-medium">Candidate satisfaction rate</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#FAF9F6] rounded-3xl border border-[#E0E0E0] p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold font-heading text-sm text-[#1D1C1D]">Patient Referral File #MED-8841</span>
                <span className="text-xs font-bold font-heading text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ● Senior Doctor Assigned
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 font-medium">Patient Name</div>
                    <div className="font-bold text-[#1D1C1D] text-sm mt-0.5">Ananya Sharma</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Required Service</div>
                    <div className="font-bold text-[#4A154B] text-sm mt-0.5">Orthopedic Knee Consultation</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                  <strong>Notes:</strong> Patient requested evening OPD appointment with Dr. Mehta. Previous X-Rays uploaded.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ALTERNATING FEATURE 2: "Connect referrers directly with counselors"     */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 order-2 lg:order-1 bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold font-heading text-sm text-[#1D1C1D]">Direct Admission Desk Chat</span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-bold font-heading">
                Ottobon Academy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs">
                  👨‍🏫
                </div>
                <div>
                  <div className="font-bold font-heading text-[#1D1C1D]">Dean Sharma (Ottobon Admissions)</div>
                  <p className="text-slate-600 mt-0.5">Candidate Rahul completed written mock test & interview today. He is joining the NDA batch on Monday!</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold font-heading text-emerald-800">🎉 Referral Reward Ready for Release</span>
                <span className="text-xs font-mono font-bold text-emerald-700">Instant UPI</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            <div className="text-xs font-bold font-heading text-[#1264A3] uppercase tracking-wider">
              02 • DIRECT HUMAN CONNECTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1D1C1D] tracking-tight leading-tight">
              Connect referrers directly with counselors.
            </h2>
            <p className="text-base text-[#616061] leading-relaxed">
              No robotic automated rejection emails. You have direct communication lines with admission deans and hospital coordinators so you always know the exact status.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ALTERNATING FEATURE 3: "Manage all your payouts from one place"         */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-y border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-bold font-heading text-[#2EB67D] uppercase tracking-wider">
                03 • AUTOMATED PAYOUTS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1D1C1D] tracking-tight leading-tight">
                Manage all your payouts from one clean ledger.
              </h2>
              <p className="text-base text-[#616061] leading-relaxed">
                Track every approved referral fee, download verified receipts for tax records, and receive automatic transfers directly to your bank account or UPI handle.
              </p>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-3xl font-extrabold font-heading text-[#2EB67D]">100%</div>
                <div className="text-xs text-[#616061] font-medium">On-time payout rate with digital receipts</div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#4A154B] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <div className="text-xs text-slate-300 font-medium">Partner Earnings Summary</div>
                  <div className="text-2xl font-bold font-heading text-white mt-0.5">₹25,000 Total Earned</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 font-bold font-heading text-xs">
                  ● All Dispatched
                </span>
              </div>

              {/* Payout Items */}
              <div className="space-y-3 text-xs">
                <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</div>
                    <div>
                      <div className="font-bold text-white">City Care Hospital • Orthopedic Surgery</div>
                      <div className="text-slate-300 text-[11px]">UTR: 8934019284 • Instant UPI</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-base text-emerald-300">₹5,000</span>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</div>
                    <div>
                      <div className="font-bold text-white">Ottobon Academy • NDA Defense Batch</div>
                      <div className="text-slate-300 text-[11px]">UTR: 7729103940 • Bank Transfer</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-base text-emerald-300">₹5,000</span>
                </div>
              </div>

              {/* Custom Link Box */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Your 1-Click Referral Link:</span>
                  <span className="text-emerald-400">Attribution Tagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value="https://ref.platform.io/r/rahul-partner"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-[#ECB22E] hover:bg-[#dfa727] text-slate-950 font-bold font-heading text-xs transition flex items-center gap-1 shrink-0"
                  >
                    {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ALTERNATING FEATURE 4: "Secure. Scalable. Silo-free."                  */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 order-2 lg:order-1 bg-white rounded-3xl border border-[#E0E0E0] p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold font-heading text-sm text-[#1D1C1D]">Enterprise Security & Privacy Console</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold font-heading">
                ISO / HIPAA Aligned
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-bold text-[#1D1C1D] font-heading">Tenant Data Isolation</div>
                <p className="text-slate-600">Hospital and student records are strictly compartmentalized.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-bold text-[#1D1C1D] font-heading">Role-Based Access</div>
                <p className="text-slate-600">Referrers only view their own leads and earned commissions.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-bold text-[#1D1C1D] font-heading">Audit Trail Logs</div>
                <p className="text-slate-600">Every admission status change and payout is permanently stamped.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-bold text-[#1D1C1D] font-heading">Fraud Protection</div>
                <p className="text-slate-600">Duplicate detection algorithms prevent conflicting claims.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            <div className="text-xs font-bold font-heading text-[#4A154B] uppercase tracking-wider">
              04 • ENTERPRISE PRIVACY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1D1C1D] tracking-tight leading-tight">
              Secure. Scalable. Privacy-first.
            </h2>
            <p className="text-base text-[#616061] leading-relaxed">
              Medical records and student phone numbers are protected with enterprise-grade access controls and strict privacy isolation.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. DEEP PLUM ROI & IMPACT SECTION                                         */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#4A154B] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-14">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
              The numbers behind our referral network.
            </h2>
            <p className="text-base text-slate-200">
              Transforming informal recommendations into a transparent, scalable revenue channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-3 backdrop-blur-md">
              <div className="text-5xl sm:text-6xl font-extrabold font-heading text-emerald-300">
                85%
              </div>
              <div className="text-lg font-bold font-heading text-white">
                Faster Intake Turnaround
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Counselors contact referred leads within 24 hours of submission.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-3 backdrop-blur-md">
              <div className="text-5xl sm:text-6xl font-extrabold font-heading text-[#ECB22E]">
                ₹25L+
              </div>
              <div className="text-lg font-bold font-heading text-white">
                Verified Rewards Dispatched
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Over 500 successful admissions and consultations rewarded with zero delays.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-3 backdrop-blur-md">
              <div className="text-5xl sm:text-6xl font-extrabold font-heading text-blue-300">
                0
              </div>
              <div className="text-lg font-bold font-heading text-white">
                Lost Leads or Disputes
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every referral is locked with encrypted IDs so no commission is ever missed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. REAL TESTIMONIAL QUOTE                                                */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E0E0E0] p-8 sm:p-14 shadow-xl relative space-y-6">
          <div className="text-4xl text-[#4A154B] font-serif">“</div>

          <p className="text-lg sm:text-2xl text-[#1D1C1D] font-medium leading-relaxed">
            I used to refer 10-15 students and patients every admission season through phone calls and never knew if they joined. With this tracker, I see when they visit the campus, when they pay fees, and my referral fee is credited to my UPI within 10 minutes.
          </p>

          <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
            <div className="w-12 h-12 rounded-full bg-[#4A154B]/10 text-2xl flex items-center justify-center">
              👨‍⚕️
            </div>
            <div>
              <div className="font-bold font-heading text-base text-[#1D1C1D]">Dr. Arvind Sharma</div>
              <div className="text-xs text-[#616061]">Senior Healthcare Consultant & Educational Counselor</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. BIG BOTTOM PLUM CTA BANNER                                            */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[#4A154B] text-white text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight">
            See all that you can accomplish when referrals work seamlessly.
          </h2>

          <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
            Join hundreds of doctors, teachers, counselors, and community leaders who refer with confidence and get paid on time.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartReferring}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#4A154B] font-extrabold font-heading text-base shadow-lg transition active:scale-95"
            >
              SUBMIT A REFERRAL NOW
            </button>

            <button
              onClick={onTrackRewards}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-heading text-base border border-white/30 transition"
            >
              ACCESS DASHBOARD
            </button>
          </div>

          <div className="text-xs text-slate-300 pt-2 font-medium">
            Free to join • Instant verified UPI payouts • Live milestone updates
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. 5-COLUMN FOOTER                                                       */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-[#E0E0E0] py-16 px-4 sm:px-6 lg:px-8 text-xs text-[#616061]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">

          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4A154B] text-white font-extrabold text-sm flex items-center justify-center font-heading">
                R
              </div>
              <span className="text-base font-bold font-heading text-[#1D1C1D]">
                Referral Platform
              </span>
            </div>
            <p className="text-xs text-[#616061] max-w-sm leading-relaxed">
              Connecting healthcare facilities, premier defense coaching, and growth suites with instant partner rewards.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold font-heading text-[#1D1C1D] uppercase text-[11px] tracking-wider">PROGRAMS</div>
            <div className="space-y-2">
              <div><a href="#programs-grid" className="hover:text-[#1D1C1D] transition">Healthcare Intake</a></div>
              <div><a href="#programs-grid" className="hover:text-[#1D1C1D] transition">Defence Admissions</a></div>
              <div><a href="#programs-grid" className="hover:text-[#1D1C1D] transition">sBloom Growth Suite</a></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold font-heading text-[#1D1C1D] uppercase text-[11px] tracking-wider">PARTNERS</div>
            <div className="space-y-2">
              <div><span className="text-slate-600">City Care Hospital</span></div>
              <div><span className="text-slate-600">Ottobon Academy</span></div>
              <div><span className="text-slate-600">Bansal & Basara Defence</span></div>
              <div><span className="text-slate-600">Medcy Health Tech</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold font-heading text-[#1D1C1D] uppercase text-[11px] tracking-wider">COMPANY</div>
            <div className="space-y-2">
              <div><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1D1C1D] transition">About Us</a></div>
              <div><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1D1C1D] transition">Privacy Policy</a></div>
              <div><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1D1C1D] transition">Terms of Service</a></div>
              <div><button onClick={onStartReferring} className="hover:text-[#1D1C1D] transition text-left">Contact Partner Desk</button></div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© {new Date().getFullYear()} Referral Platform • City Care Hospital • Ottobon • sBloom. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-medium">● Systems Normal • All Desks Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
