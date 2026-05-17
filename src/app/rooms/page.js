'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import Toast from '../../components/Toast'

const emptyForm = { name: '', description: '', subject: '', isPrivate: false, tags: '' }

export default function RoomsPage() {
  const { token, user }       = useAuth()
  const [rooms, setRooms]     = useState([])
  const [search, setSearch]   = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  const fetchRooms = async () => {
    const params = new URLSearchParams()
    if (search)  params.set('search', search)
    if (subject) params.set('subject', subject)
    const data = await api.get(`/rooms?${params}`, token)
    setRooms(data)
    setLoading(false)
  }

  useEffect(() => { if (token) fetchRooms() }, [token, search, subject])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    await api.post('/rooms', payload, token)
    setShowForm(false)
    setForm(emptyForm)
    fetchRooms()
    setSaving(false)
  }

  const handleJoin = async (roomId, isPrivate) => {
    try {
      if (isPrivate) {
        await api.post(`/rooms/${roomId}/request`, {}, token)
        setToast({ message: 'Request sent! Wait for owner to approve.', type: 'success' })
        fetchRooms()
      } else {
        await api.post(`/rooms/${roomId}/join`, {}, token)
        fetchRooms()
        setToast({ message: 'Joined room!', type: 'success' })
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Study Rooms</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Room'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px' }}>New Room</h2>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Room Name *</label>
                <input className="form-input" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input className="form-input" required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" style={{ minHeight: '70px' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="math, exam, algebra"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={form.isPrivate}
                  onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />
                Private room
              </label>
            </div>
          </form>
        </div>
      )}

      <div className="search-bar">
        <input className="search-input" placeholder="Search by name..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="search-input" placeholder="Filter by subject..."
          value={subject} onChange={(e) => setSubject(e.target.value)}
          style={{ maxWidth: '200px' }} />
      </div>

      {rooms.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No rooms found. Create one!</p>
      ) : (
        <div className="grid-3">
          {rooms.map((r) => {
            const isMember  = r.members?.some(m => m._id === user?._id)
            const isPending = r.pendingRequests?.some(p => p._id === user?._id)

            return (
              <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-subject">{r.subject}</span>
                  {r.isPrivate && <span className="badge badge-private">Private</span>}
                </div>
                <h3 style={{ marginBottom: '6px' }}>{r.name}</h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{r.description}</p>
                <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '14px' }}>{r.members?.length} members</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/rooms/${r._id}`} className="btn btn-secondary btn-sm">Open</Link>
                  {!isMember && (
                    isPending ? (
                      <button className="btn btn-secondary btn-sm" disabled>Pending...</button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleJoin(r._id, r.isPrivate)}>
                        {r.isPrivate ? 'Request' : 'Join'}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}