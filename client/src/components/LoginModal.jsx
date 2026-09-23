import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Building2, ArrowRight, Network, Eye, EyeOff, Phone, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured } from '../services/firebase';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('Healthcare');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Phone OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [devSimulatedOtp, setDevSimulatedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setError('');
    setSuccessMsg('');
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91${cleanPhone.slice(-10)}`;

    setOtpLoading(true);

    try {
      if (isFirebaseConfigured && auth) {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {}
          });
        }
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(`OTP sent to ${formattedPhone}`);
      } else {
        // Dev Simulation Mode (Zero-Config Testing before Firebase keys are pasted)
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        setDevSimulatedOtp(mockCode);
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(`Test Mode: OTP sent to ${formattedPhone} (Code: ${mockCode})`);
      }
    } catch (err) {
      console.error('Phone OTP Error:', err);
      if (err.code === 'auth/billing-not-enabled' || (err.message && err.message.includes('billing-not-enabled'))) {
        // Graceful fallback to test mode if Google billing is not yet attached
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        setDevSimulatedOtp(mockCode);
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(`Firebase Spark Plan Active (Simulated SMS Mode). Verification OTP: ${mockCode}`);
      } else {
        setError(err.message || 'Failed to send SMS OTP. Please check the number and try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setOtpLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otpCode.trim());
        setIsPhoneVerified(true);
        setSuccessMsg('Phone number successfully verified!');
      } else if (devSimulatedOtp) {
        if (otpCode.trim() === devSimulatedOtp || otpCode.trim() === '123456') {
          setIsPhoneVerified(true);
          setSuccessMsg('Phone number verified successfully!');
        } else {
          setError('Invalid OTP code. Please try again.');
        }
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError('Invalid or expired OTP code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPhoneVerified) {
      setError('Please verify your phone number via OTP first before creating an account.');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91${cleanPhone.slice(-10)}`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: formattedPhone,
          email: email.trim(),
          organization_name: orgName.trim() || null,
          industry: orgName.trim() ? industry : 'Independent / Individual',
          password
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Registration failed. Please check details.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Invisible ReCAPTCHA Container for Firebase */}
        <div id="recaptcha-container"></div>

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isRegister ? 'Create Partner Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegister
                  ? 'Verify phone to join the network & earn rewards'
                  : 'Enter your credentials to access your dashboard'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success / Error Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}
        {successMsg && !error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="p-6 space-y-4">
          
          {isRegister ? (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone Authentication Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Mobile Phone Number *</span>
                  {isPhoneVerified ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-blue-600 font-bold">SMS OTP Required</span>
                  )}
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      disabled={isPhoneVerified}
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      className={`w-full pl-12 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono ${
                        isPhoneVerified ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900' : 'border-slate-300'
                      }`}
                    />
                  </div>

                  {!isPhoneVerified && (
                    <button
                      type="button"
                      disabled={otpLoading || phone.length < 10 || resendTimer > 0}
                      onClick={handleSendOtp}
                      className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition shrink-0 flex items-center gap-1"
                    >
                      {otpLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : resendTimer > 0 ? (
                        `${resendTimer}s`
                      ) : otpSent ? (
                        'Resend OTP'
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  )}
                </div>

                {/* OTP Verification Input Box */}
                {otpSent && !isPhoneVerified && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-900">Enter 6-Digit SMS Code</span>
                      {devSimulatedOtp && (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          OTP: {devSimulatedOtp}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-blue-300 text-center font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                      <button
                        type="button"
                        disabled={otpLoading || otpCode.length !== 6}
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition shrink-0"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Organization (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Organization / Clinic / School</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. City Health Clinic or Apex School"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Industry Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Industry Category</span>
                  <span className="text-[10px] text-slate-400 font-normal">{orgName.trim() ? 'Required for org' : 'Disabled (No Org)'}</span>
                </label>
                <select
                  disabled={!orgName.trim()}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium transition outline-none ${
                    orgName.trim()
                      ? 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                  }`}
                >
                  <option value="Healthcare">Healthcare / Clinics / Hospitals</option>
                  <option value="Education">Education / Schools / Institutes</option>
                  <option value="Corporate / Other">Corporate / Brand / Other</option>
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={loading || !isPhoneVerified}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-1.5 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            /* Sign In Mode */
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isRegister ? 'Already registered? Sign in with Email' : "New Partner? Register with Phone"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
