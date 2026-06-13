import React, { useState } from 'react';
import { Lock, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill out all credentials fields.');
      return;
    }

    // Authenticate credentials
    if (
      (email === 'admin@retailpulse.ai' || email === 'admin') &&
      password === 'admin123'
    ) {
      onLoginSuccess();
    } else {
      setError('Invalid username/email or password. Please try again.');
    }
  };

  const handleAutofill = () => {
    setEmail('admin@retailpulse.ai');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#07080c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-main)'
      }}
    >
      {/* Background glowing circles */}
      <div 
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          top: '20%',
          left: '30%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0) 70%)',
          bottom: '15%',
          right: '25%',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      <div 
        className="glass-card" 
        style={{ 
          width: '420px', 
          maxWidth: '90%', 
          padding: '2.5rem 2rem', 
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          background: 'rgba(16, 18, 27, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '0.8rem',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className="gradient-text">
            RetailPulse AI Gate
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Enter your credentials to access the console
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'var(--color-danger-bg)', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              display: 'flex', 
              gap: '0.5rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-main)', 
              marginBottom: '1.2rem' 
            }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Email input field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Username / Email</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-dark)' 
                }} 
              />
              <input 
                type="text" 
                placeholder="admin@retailpulse.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-custom"
                style={{ 
                  paddingLeft: '2.5rem', 
                  width: '100%', 
                  fontSize: '0.85rem',
                  height: '42px',
                  background: 'rgba(255,255,255,0.02)'
                }}
              />
            </div>
          </div>

          {/* Password input field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-dark)' 
                }} 
              />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-custom"
                style={{ 
                  paddingLeft: '2.5rem', 
                  width: '100%', 
                  fontSize: '0.85rem',
                  height: '42px',
                  background: 'rgba(255,255,255,0.02)'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              height: '42px', 
              width: '100%', 
              justifyContent: 'center', 
              marginTop: '0.5rem',
              boxShadow: 'var(--glow-primary)'
            }}
          >
            Authenticate Gateway
          </button>
        </form>

        {/* Demo Credentials Help Card */}
        <div 
          style={{ 
            marginTop: '1.8rem', 
            paddingTop: '1.2rem', 
            borderTop: '1px dashed var(--border-subtle)',
            textAlign: 'center'
          }}
        >
          <div 
            style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px dashed rgba(99, 102, 241, 0.2)', 
              borderRadius: '8px', 
              padding: '0.6rem 0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Evaluator Demo Mode active:
            </span>
            <button 
              type="button" 
              onClick={handleAutofill}
              className="btn btn-secondary"
              style={{ 
                padding: '0.3rem 0.6rem', 
                fontSize: '0.75rem', 
                justifyContent: 'center',
                color: 'var(--color-primary-light)',
                borderColor: 'rgba(99, 102, 241, 0.2)'
              }}
            >
              Autofill Credentials
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
