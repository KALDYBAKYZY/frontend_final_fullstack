'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">StudyHub</Link>

      {user && (
        <div className="navbar-links">
          <Link href="/dashboard" className="navbar-link">Dashboard</Link>
          <Link href="/rooms"     className="navbar-link">Rooms</Link>
          <Link href="/notes"     className="navbar-link">Notes</Link>
        </div>
      )}

      <div className="navbar-user">
        {user ? (
          <>
            <Link href="/profile">
              {user.avatar
                ? <img src={user.avatar} alt="" className="navbar-avatar" />
                : <div className="navbar-avatar-letter">{user.username?.[0]?.toUpperCase()}</div>
              }
            </Link>
            <span style={{ fontSize: '14px', color: '#555' }}>{user.username}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login"    className="btn btn-secondary btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
