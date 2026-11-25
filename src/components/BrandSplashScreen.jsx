import { useEffect, useState } from 'react';

const SPLASH_KEY = 'iacondo_web_splash_seen_v1';

function shouldShowSplash() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    if (window.sessionStorage?.getItem(SPLASH_KEY) === '1') return false;
    return true;
  } catch {
    return false;
  }
}

export default function BrandSplashScreen({
  subtitle = 'Gestión Inteligente de Condominios',
  logoSrc = '/favicon.png',
  durationMs = 2800
}) {
  const [visible, setVisible] = useState(() => shouldShowSplash());
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      window.sessionStorage?.setItem(SPLASH_KEY, '1');
    } catch {}

    const fadeDelay = Math.max(1200, durationMs - 550);
    const fadeTimer = setTimeout(() => setExiting(true), fadeDelay);
    const hideTimer = setTimeout(() => setVisible(false), durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, durationMs]);

  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      role="status"
      aria-label="Iniciando IA Condo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 38%, #0c2340 0%, #061224 52%, #030812 100%)',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        cursor: 'pointer',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes iac-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes iac-spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes iac-pulse-glow {
          0%, 100% { transform: scale(0.95); opacity: 0.45; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes iac-logo-pop {
          0% { opacity: 0; transform: scale(0.76) translateY(14px); }
          60% { opacity: 1; transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iac-text-rise {
          0% { opacity: 0; transform: translateY(14px); letter-spacing: 0.14em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.04em; }
        }
        @keyframes iac-sub-rise {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes iac-shimmer {
          0% { transform: translateX(-140%) skewX(-22deg); }
          100% { transform: translateX(240%) skewX(-22deg); }
        }
        @keyframes iac-bar-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at 50% 45%, black 15%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 15%, transparent 72%)',
          pointerEvents: 'none'
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(14, 165, 233, 0.10) 45%, transparent 72%)',
          filter: 'blur(18px)',
          animation: 'iac-pulse-glow 2.6s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '188px',
          height: '188px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.6rem'
        }}
      >
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'iac-spin-cw 14s linear infinite'
          }}
        >
          <defs>
            <linearGradient id="iacWebRingA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="none" stroke="url(#iacWebRingA)" strokeWidth="1.5" strokeDasharray="58 20 12 20" />
          <circle cx="100" cy="8" r="3.2" fill="#22d3ee" />
          <circle cx="100" cy="192" r="2.4" fill="#38bdf8" />
        </svg>

        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '12px',
            width: 'calc(100% - 24px)',
            height: 'calc(100% - 24px)',
            animation: 'iac-spin-ccw 10s linear infinite'
          }}
        >
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(45, 212, 191, 0.35)" strokeWidth="1.2" strokeDasharray="8 14" />
          <circle cx="190" cy="100" r="2.8" fill="#2dd4bf" />
        </svg>

        <div
          style={{
            position: 'relative',
            width: '126px',
            height: '126px',
            borderRadius: '30px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(226, 242, 255, 0.94))',
            boxShadow: '0 20px 48px rgba(2, 132, 199, 0.42), 0 0 0 1px rgba(125, 211, 252, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'iac-logo-pop 850ms cubic-bezier(0.22, 1, 0.36, 1) forwards'
          }}
        >
          <img
            src={logoSrc}
            alt="IA Condo"
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '55%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)',
              animation: 'iac-shimmer 1.6s ease-in-out 0.55s 1',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.35rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #ffffff 0%, #bae6fd 50%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'iac-text-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) 180ms both'
          }}
        >
          IA Condo
        </div>
        <div
          style={{
            marginTop: '0.45rem',
            fontSize: '0.92rem',
            color: '#94a3b8',
            letterSpacing: '0.02em',
            animation: 'iac-sub-rise 650ms ease 420ms both'
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            width: '170px',
            height: '3px',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.2)',
            margin: '1.4rem auto 0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #0ea5e9, #2dd4bf)',
              boxShadow: '0 0 12px rgba(45, 212, 191, 0.8)',
              animation: `iac-bar-fill ${Math.max(1200, durationMs - 350)}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'rgba(148, 163, 184, 0.65)',
          letterSpacing: '0.04em',
          animation: 'iac-sub-rise 700ms ease 600ms both'
        }}
      >
        SOLUCIONES DIGITALES CREAPPTIVAS C.A. • RIF: J508901061
      </div>
    </div>
  );
}
