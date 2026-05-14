'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

export default function DashboardPage() {
  const { user, token }   = useAuth()
  const [rooms, setRooms] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get('/rooms/my', token),
      api.get('/notes', token),
    ])
      .then(([r, n]) => {
        setRooms(r.slice(0, 4))
        setNotes(n.slice(0, 4))
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hello, {user?.username} 👋</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Here is your overview</p>
        </div>
        <Link href="/rooms" className="btn btn-primary">Browse Rooms</Link>
      </div>

      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Your Rooms</h2>
          <Link href="/rooms" style={{ fontSize: '14px' }}>View all →</Link>
        </div>

        {rooms.length === 0 ? (
          <p style={{ color: '#888' }}>No rooms yet. <Link href="/rooms">Join or create one.</Link></p>
        ) : (
          <div className="grid-2">
            {rooms.map((r) => (
              <Link key={r._id} href={`/rooms/${r._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge badge-subject">{r.subject}</span>
                    {r.isPrivate && <span className="badge badge-private">Private</span>}
                  </div>
                  <h3 style={{ marginBottom: '4px' }}>{r.name}</h3>
                  <p style={{ fontSize: '13px', color: '#888' }}>{r.members?.length} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Notes</h2>
          <Link href="/notes" style={{ fontSize: '14px' }}>View all →</Link>
        </div>

        {notes.length === 0 ? (
          <p style={{ color: '#888' }}>No notes yet. <Link href="/notes">Create your first note.</Link></p>
        ) : (
          <div className="grid-2">
            {notes.map((n) => (
              <Link key={n._id} href={`/notes/${n._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <h3 style={{ marginBottom: '6px' }}>{n.title}</h3>
                  {n.subject && <span className="badge badge-subject">{n.subject}</span>}
                  <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
