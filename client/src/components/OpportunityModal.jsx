import React, { useState, useEffect } from 'react';
import { X, Building2, Gift, Stethoscope, GraduationCap, ShieldCheck, TrendingUp } from 'lucide-react';

export default function OpportunityModal({ isOpen, onClose, onSave, initialData, currentUser }) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isEntityAdmin = currentUser?.role === 'ADMIN';

  const [organizations, setOrganizations] = useState([]);
  // 'COMPANY' = Refer clinic/school to our company (Ottobon/Medcy/sBloom)
  // 'HOSPITAL_INTAKE' = Refer patient to partner hospital
  // 'COLLEGE_INTAKE' = Refer student to partner college
  const [referralTargetType, setReferralTargetType] = useState('COMPANY');

  const [formData, setFormData] = useState({
    job_id: '',
    target_entity_id: 'ottobon',
    target_organization_id: '',
    intake_type: 'COMPANY_GROWTH',
    lead_origin: 'referral',
    referring_user_id: null,
    client_name: '',
    person_contacted: '',
    designation_role: '',
    phone: '',
    email: '',
    location: '',
    service_product: '',
    requirement_breakdown: '',
    clinical_intake_notes: '',
    current_status: 'SUBMITTED',
    last_discussion: '',
    quoted_price: '',
    pricing_type: 'One-Time',
    quote_status: 'Draft',
    final_agreed_price: '',
    next_action: '',
    follow_up_date: '',
    product_owner: 'Rahul M.',
    conversion_date: '',
    lost_reason: '',
    remarks: ''
  });

  // Fetch active partner organizations
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      fetch('/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.organizations) {
            setOrganizations(data.organizations);
          }
        })
        .catch(err => console.error('Failed to load organizations:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      const isIntake = initialData.intake_type === 'CLIENT_INTAKE' || !!initialData.target_organization_id;
      const isHospital = isIntake && initialData.target_entity_id === 'medcy';
      setReferralTargetType(isIntake ? (isHospital ? 'HOSPITAL_INTAKE' : 'COLLEGE_INTAKE') : 'COMPANY');
      setFormData({
        ...initialData,
        lead_origin: initialData.referring_user_id ? 'referral' : 'own',
        intake_type: initialData.intake_type || (isIntake ? 'CLIENT_INTAKE' : 'COMPANY_GROWTH'),
        quoted_price: initialData.quoted_price || '',
        final_agreed_price: initialData.final_agreed_price || '',
        follow_up_date: initialData.follow_up_date || '',
        conversion_date: initialData.conversion_date || '',
        clinical_intake_notes: initialData.clinical_intake_notes || ''
      });
    } else {
      setReferralTargetType('COMPANY');
      setFormData({
        job_id: '',
        target_entity_id: 'ottobon',
        target_organization_id: '',
        intake_type: 'COMPANY_GROWTH',
        lead_origin: isSuperAdmin ? 'own' : 'referral',
        referring_user_id: !isSuperAdmin ? currentUser?.id : null,
        client_name: '',
        person_contacted: '',
        designation_role: '',
        phone: '',
        email: '',
        location: '',
        service_product: '',
        requirement_breakdown: '',
        clinical_intake_notes: '',
        current_status: 'SUBMITTED',
        last_discussion: '',
        quoted_price: '',
        pricing_type: 'One-Time',
        quote_status: 'Draft',
        final_agreed_price: '',
        next_action: '',
        follow_up_date: '',
        product_owner: 'Rahul M.',
        conversion_date: '',
        lost_reason: '',
        remarks: ''
      });
    }
  }, [initialData, isOpen, isSuperAdmin, currentUser]);

  if (!isOpen) return null;

  const handleTargetTypeSelect = (type) => {
    setReferralTargetType(type);
    if (type === 'COMPANY') {
      setFormData(prev => ({
        ...prev,
        intake_type: 'COMPANY_GROWTH',
        target_organization_id: '',
        target_entity_id: 'ottobon',
        client_name: ''
      }));
    } else if (type === 'HOSPITAL_INTAKE') {
      const firstHospital = organizations.find(o => o.category === 'Healthcare' || o.category === 'HOSPITAL');
      setFormData(prev => ({
        ...prev,
        intake_type: 'CLIENT_INTAKE',
        target_entity_id: 'medcy',
        target_organization_id: firstHospital ? firstHospital.id : '',
        client_name: firstHospital ? firstHospital.name : ''
      }));
    } else if (type === 'COLLEGE_INTAKE') {
      const firstCollege = organizations.find(o => o.category === 'Education' || o.category === 'COLLEGE');
      setFormData(prev => ({
        ...prev,
        intake_type: 'CLIENT_INTAKE',
        target_entity_id: 'ottobon',
        target_organization_id: firstCollege ? firstCollege.id : '',
        client_name: firstCollege ? firstCollege.name : ''
      }));
    }
  };

  const handleOrganizationChange = (orgId) => {
    const selectedOrg = organizations.find(o => o.id === orgId);
    if (selectedOrg) {
      const isHospital = selectedOrg.category === 'Healthcare' || selectedOrg.category === 'HOSPITAL';
      setFormData(prev => ({
        ...prev,
        target_organization_id: orgId,
        client_name: selectedOrg.name,
        target_entity_id: isHospital ? 'medcy' : 'ottobon',
        location: selectedOrg.city || prev.location
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.service_product.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      ...formData,
      intake_type: referralTargetType === 'COMPANY' ? 'COMPANY_GROWTH' : 'CLIENT_INTAKE',
      referring_user_id: formData.lead_origin === 'own' ? null : (formData.referring_user_id || currentUser?.id)
    };

    onSave(payload);
  };

  const hospitalOrgs = organizations.filter(o => o.category === 'Healthcare' || o.category === 'HOSPITAL');
  const collegeOrgs = organizations.filter(o => o.category === 'Education' || o.category === 'COLLEGE');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {initialData ? `Edit Lead (${formData.job_id || 'Details'})` : isSuperAdmin ? '+ Create New Lead' : isEntityAdmin ? '+ Refer Institution to Us' : '+ Submit a Referral'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEntityAdmin
                ? 'Introduce another institution to our company and earn referral payout'
                : 'Fast, simple referral submission in under 30 seconds'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">

          {/* Sleek Segmented Switcher (Only for Independent Users and Super Admins) */}
          {!isEntityAdmin && (
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Referral Intake Category
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTargetTypeSelect('COMPANY')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    referralTargetType === 'COMPANY'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">B2B Enterprise</span>
                  <span className="sm:hidden">Corporate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeSelect('HOSPITAL_INTAKE')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    referralTargetType === 'HOSPITAL_INTAKE'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Patient Admission</span>
                  <span className="sm:hidden">Healthcare</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeSelect('COLLEGE_INTAKE')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    referralTargetType === 'COLLEGE_INTAKE'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Student Admission</span>
                  <span className="sm:hidden">Academic</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. If Patient Referral: Single Clean Hospital Selector */}
          {referralTargetType === 'HOSPITAL_INTAKE' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Partner Hospital / Medical Facility *</label>
              <select
                value={formData.target_organization_id}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose Tied-up Hospital --</option>
                {hospitalOrgs.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. If Student Referral: Single Clean College Selector */}
          {referralTargetType === 'COLLEGE_INTAKE' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Partner College / Educational Institute *</label>
              <select
                value={formData.target_organization_id}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose Tied-up Institution --</option>
                {collegeOrgs.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. If Company Referral: Brand Selector */}
          {(referralTargetType === 'COMPANY' || isEntityAdmin) && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Business Solution *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, target_entity_id: 'ottobon' })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    formData.target_entity_id === 'ottobon'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-blue-900">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ottobon</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Edutech & Institutions</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, target_entity_id: 'medcy' })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    formData.target_entity_id === 'medcy'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Medcy</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Healthcare & Hospitals</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, target_entity_id: 'sbloom' })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    formData.target_entity_id === 'sbloom'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-purple-900">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>sBloom</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Brand & Media Growth</div>
                </button>
              </div>
            </div>
          )}

          {/* Attribution Switch (Super Admin Only) */}
          {isSuperAdmin && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Attribution</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lead_origin: 'own', referring_user_id: null })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center gap-2 ${
                    formData.lead_origin === 'own' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Internal Company Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lead_origin: 'referral' })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs text-left transition flex items-center gap-2 ${
                    formData.lead_origin === 'referral' ? 'bg-purple-50 border-purple-500 text-purple-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5 text-purple-600" />
                  <span>Partner Referral</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields: Clean 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* If Company Lead, ask for Organization Name */}
            {referralTargetType === 'COMPANY' && (
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Referred School / Clinic / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greenwood International School or Care Plus Diagnostics"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {referralTargetType === 'HOSPITAL_INTAKE'
                  ? 'Patient Full Name *'
                  : referralTargetType === 'COLLEGE_INTAKE'
                  ? 'Student / Candidate Name *'
                  : 'Contact Person Name'}
              </label>
              <input
                type="text"
                required={referralTargetType !== 'COMPANY'}
                placeholder={
                  referralTargetType === 'HOSPITAL_INTAKE'
                    ? 'e.g. Ramesh Patel'
                    : referralTargetType === 'COLLEGE_INTAKE'
                    ? 'e.g. Ankit Sharma'
                    : 'e.g. Dr. Rajesh Gupta'
                }
                value={formData.person_contacted}
                onChange={(e) => setFormData({ ...formData, person_contacted: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {referralTargetType === 'HOSPITAL_INTAKE'
                  ? 'Patient Age / Relation'
                  : referralTargetType === 'COLLEGE_INTAKE'
                  ? 'Current Class / Background'
                  : 'Designation / Role'}
              </label>
              <input
                type="text"
                placeholder={
                  referralTargetType === 'HOSPITAL_INTAKE'
                    ? 'e.g. Age 52 (Father)'
                    : referralTargetType === 'COLLEGE_INTAKE'
                    ? 'e.g. 12th PCM / Diploma'
                    : 'e.g. Principal, Director, CMO'
                }
                value={formData.designation_role}
                onChange={(e) => setFormData({ ...formData, designation_role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. contact@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {referralTargetType === 'HOSPITAL_INTAKE'
                  ? 'Procedure / Medical Speciality Needed *'
                  : referralTargetType === 'COLLEGE_INTAKE'
                  ? 'Desired Degree / Course *'
                  : 'Service / Solution Needed *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  referralTargetType === 'HOSPITAL_INTAKE'
                    ? 'e.g. Liver Surgery & Hepatic Care Consultation'
                    : referralTargetType === 'COLLEGE_INTAKE'
                    ? 'e.g. B.Tech Computer Science / MBA'
                    : 'e.g. Digital Admissions Portal, Clinic CRM, or Social Media Authority'
                }
                value={formData.service_product}
                onChange={(e) => setFormData({ ...formData, service_product: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Notes / Clinical Instructions */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {referralTargetType === 'HOSPITAL_INTAKE'
                  ? '📋 Clinical Notes & Diagnosis'
                  : referralTargetType === 'COLLEGE_INTAKE'
                  ? '📋 Academic Background & Preferences'
                  : '📋 Requirement Breakdown / Project Scope'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  referralTargetType === 'HOSPITAL_INTAKE'
                    ? 'e.g. Diagnosed with hepatic lesion on clinic ultrasound. Reports shared; needs specialist consultation with Dr. Mehta.'
                    : referralTargetType === 'COLLEGE_INTAKE'
                    ? 'e.g. 88% in 12th board exams. Interested in merit scholarship and hostel.'
                    : 'Key student/patient capacity, target goals, timelines...'
                }
                value={referralTargetType !== 'COMPANY' ? formData.clinical_intake_notes : formData.requirement_breakdown}
                onChange={(e) => {
                  if (referralTargetType !== 'COMPANY') {
                    setFormData({ ...formData, clinical_intake_notes: e.target.value });
                  } else {
                    setFormData({ ...formData, requirement_breakdown: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

          {/* Super Admin Commercial Controls */}
          {isSuperAdmin && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Admin Commercials
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.current_status}
                    onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="IN DISCUSSION">IN DISCUSSION</option>
                    <option value="PROPOSAL SENT">PROPOSAL SENT</option>
                    <option value="CONVERTED">CONVERTED ✓</option>
                    <option value="NOT CONVERTED">NOT CONVERTED ✕</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quoted Price (₹)</label>
                  <input
                    type="number"
                    value={formData.quoted_price}
                    onChange={(e) => setFormData({ ...formData, quoted_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Type</label>
                  <select
                    value={formData.pricing_type}
                    onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="monthly">monthly</option>
                    <option value="One-Time">One-Time</option>
                    <option value="Monthly Retainer">Monthly Retainer</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            {initialData ? 'Save Changes' : isSuperAdmin ? '+ Create Lead' : '+ Submit Referral'}
          </button>
        </div>

      </div>
    </div>
  );
}
