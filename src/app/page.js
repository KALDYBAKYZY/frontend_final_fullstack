import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '16px', color: '#4f46e5' }}>
          StudyHub
        </h1>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '32px' }}>
          Study rooms, shared notes, live chat — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/register" className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 28px' }}>
            Get Started
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ fontSize: '16px', padding: '12px 28px' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
