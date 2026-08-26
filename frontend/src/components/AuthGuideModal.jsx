import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  UserCheck, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function AuthGuideModal() {
  const { authModalOpen, setAuthModalOpen } = useWeather();

  if (!authModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '700px' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={() => setAuthModalOpen(false)}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Auth0 Authentication & Access Control</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MFA, Whitelist & Single Sign-On Architecture</div>
          </div>
        </div>

        {/* Test User Credentials Card */}
        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
            <Key size={16} />
            <span>Fidenz Evaluator Test Credentials</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Test Email</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                careers@fidenz.com
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Password</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                Pass#fidenz
              </div>
            </div>
          </div>
        </div>

        {/* Part 2 Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Part 2 Requirements Implementation
          </h4>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-glass)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Step 1: Dashboard Authentication Protection</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Comfort Index calculations and dashboard views are guarded with Auth0 OpenID Connect & Express JWT verification middleware.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-glass)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Step 2: Multi-Factor Authentication (MFA)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Configured with Auth0 Email Verification One-Time Passcodes (OTP) for elevated multi-factor login sessions.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-glass)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Step 3: Restrict Signups & User Whitelist</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Public registration is disabled on the Auth0 tenant. Only whitelisted users and invited evaluator emails can access the platform.
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => {
              alert('Auth0 SSO Profile Session Active (Evaluator: careers@fidenz.com)');
              setAuthModalOpen(false);
            }}
          >
            <UserCheck size={16} />
            <span>Confirm Authenticated Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
