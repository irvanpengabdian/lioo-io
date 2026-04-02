import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPosStaffUserId } from '../lib/pos-session';

export default async function POSRootPage() {
  if (await getPosStaffUserId()) {
    redirect('/pos');
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-background)',
      padding: '1rem',
    }}>
      <div style={{
        padding: '2.5rem',
        textAlign: 'center',
        background: 'var(--color-surface-white)',
        borderRadius: '1.5rem',
        boxShadow: '0 24px 48px rgba(44, 79, 27, 0.06)',
        maxWidth: '22rem',
        width: '100%',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '2.75rem', height: '2.75rem',
            background: 'linear-gradient(145deg, #7C8B6F 0%, #2C4F1B 100%)',
            borderRadius: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(44, 79, 27, 0.28)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.65 21C8 19 12.85 17.61 15 14c1.5-2.19 2-5 2-6z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.82 19.34C3.82 19.34 6 14 9 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-on-surface)' }}>
            lioo<span style={{ color: '#7C8B6F', fontWeight: 600 }}> POS</span>
          </span>
        </div>

        {/* Divider dot */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '0.25rem', height: '0.25rem', borderRadius: '9999px', background: 'var(--color-surface-high)' }} />
          ))}
        </div>

        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
          Terminal Kasir
        </h1>
        <p style={{ color: 'var(--color-outline)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Masuk dengan akun staff untuk memulai sesi kasir.
        </p>

        <Link
          href="/api/auth/login"
          style={{
            display: 'block',
            width: '100%',
            background: 'linear-gradient(145deg, #436831 0%, #2C4F1B 100%)',
            color: '#fff',
            padding: '0.875rem 1.5rem',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.9375rem',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
            boxShadow: '0 8px 24px rgba(44, 79, 27, 0.28)',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
          }}
        >
          Masuk sebagai Staff
        </Link>

        <p style={{ marginTop: '1.5rem', fontSize: '0.6875rem', color: 'var(--color-outline)', opacity: 0.7 }}>
          Terminal ini khusus untuk kasir dan staf.
        </p>
      </div>
    </div>
  );
}
