'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

const emptyForm = { title: '', content: '', subject: '', tags: '' }

export default function NotesPage() {
  const { token }             = useAuth()
  const [notes, setNotes]     = useState([])
  const [search, setSearch]   = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)

  const fetchNotes = async () => {
    const params = new URLSearchParams()
    if (search)  params.set('search', search)
    if (subject) params.set('subject', subject)
    const data = await api.get(`/notes?${params}`, token)
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => { if (token) fetchNotes() }, [token, search, subject])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    await api.post('/notes', payload, token)
    setShowForm(false)
    setForm(emptyForm)
    fetchNotes()
    setSaving(false)
  }

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return
    await api.delete(`/notes/${noteId}`, token)
    setNotes(notes.filter((n) => n._id !== noteId))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Notes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Note'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px' }}>New Note</h2>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-textarea"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="physics, chapter-3"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <input className="search-input" placeholder="Search notes..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="search-input" placeholder="Filter by subject..."
          value={subject} onChange={(e) => setSubject(e.target.value)}
          style={{ maxWidth: '200px' }} />
      </div>

      {notes.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No notes yet. Create your first one!</p>
      ) : (
        <div className="grid-3">
          {notes.map((n) => (
            <div key={n._id} className="card" style={{ borderLeft: n.isPinned ? '4px solid #f59e0b' : '' }}>
              <h3 style={{ marginBottom: '6px' }}>{n.title}</h3>

              {n.subject && (
                <span className="badge badge-subject" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  {n.subject}
                </span>
              )}

              <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {n.content || 'No content'}
              </p>

              <div style={{ marginBottom: '10px' }}>
                {n.tags?.map((tag) => <span key={tag} className="note-tag">{tag}</span>)}
              </div>

              <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
                {new Date(n.updatedAt).toLocaleDateString()}
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href={`/notes/${n._id}`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
