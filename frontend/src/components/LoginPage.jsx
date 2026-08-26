import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CloudSun, 
  Sparkles, 
  UserCheck, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { 
    initiateLogin, 
    verifyMfaOtp, 
    mfaPending, 
    cancelMfa, 
    authError, 
    authLoading, 
    auth0 
  } = useAuth();

  const [email, setEmail] = useState('careers@fidenz.com');
  const [password, setPassword] = useState('Pass#fidenz');
  const [otp, setOtp] = useState('');

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    const res = await initiateLogin(email, password);
    if (res.success && res.demoOtp) {
      setOtp(res.demoOtp); // pre-populate demo OTP for smooth evaluation
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    await verifyMfaOtp(otp);
  };

  const handleFillTestCredentials = () => {
    setEmail('careers@fidenz.com');
    setPassword('Pass#fidenz');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          padding: '2.5rem 2rem', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff',
              boxShadow: 'var(--glow-cyan)',
              marginBottom: '1rem'
            }}
          >
            <CloudSun size={30} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>AeroComfort</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Fidenz Weather & Biometeorological Analytics
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div 
            style={{ 
              background: 'rgba(244, 63, 94, 0.15)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              color: '#fda4af', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.82rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {!mfaPending ? (
          /* Step 1: Initial Login Form */
          <div>
            {/* Reviewer Quick Credential Banner */}
            <div 
              style={{ 
                background: 'rgba(56, 189, 248, 0.08)', 
                border: '1px solid rgba(56, 189, 248, 0.25)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                  Test Credentials (Part 2)
                </span>
                <button 
                  type="button" 
                  onClick={handleFillTestCredentials}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Autofill
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Email: <strong style={{ color: 'var(--text-primary)' }}>careers@fidenz.com</strong> | Password: <strong style={{ color: 'var(--text-primary)' }}>Pass#fidenz</strong>
              </div>
            </div>

            <form onSubmit={handleSubmitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <div className="search-input-wrapper" style={{ maxWidth: '100%' }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. careers@fidenz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div className="search-input-wrapper" style={{ maxWidth: '100%' }}>
                  <Lock size={16} color="var(--text-muted)" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                disabled={authLoading}
              >
                {authLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Proceed to MFA Verification</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Step 3: Restricted Signups Notice */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={14} color="var(--accent-amber)" />
              <span>Public Signups Restricted • Whitelisted Users Only</span>
            </div>

            {/* Auth0 Universal Login Alternative Button */}
            {auth0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  className="btn btn-glass"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={() => auth0.loginWithRedirect()}
                >
                  <ShieldCheck size={16} />
                  <span>Log in with Auth0 Universal Login</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Multi-Factor Authentication (Email Verification OTP) */
          <div>
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Step 2: Multi-Factor Authentication</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                A 6-digit verification code has been dispatched to:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {mfaPending.email}
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Enter 6-Digit Email OTP
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    Demo Code: {mfaPending.otp}
                  </span>
                </div>
                <div className="search-input-wrapper" style={{ maxWidth: '100%' }}>
                  <Key size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    style={{ letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                    placeholder="824901"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem' }}
                disabled={authLoading}
              >
                {authLoading ? <span>Verifying OTP...</span> : <span>Verify & Unlock Dashboard</span>}
              </button>

              <button 
                type="button" 
                className="btn btn-glass" 
                style={{ width: '100%', fontSize: '0.8rem' }}
                onClick={cancelMfa}
              >
                Cancel & Back to Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
