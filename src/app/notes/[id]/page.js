'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { UploadButton } from '@uploadthing/react'

export default function NoteDetailPage() {
  const { id }    = useParams()
  const { token } = useAuth()
  const router    = useRouter()

  const [form, setForm]           = useState({ title: '', content: '', subject: '', tags: '', isPinned: false })
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  useEffect(() => {
    if (!token || !id) return
    api.get(`/notes/${id}`, token).then((n) => {
      setForm({
        title:    n.title,
        content:  n.content,
        subject:  n.subject || '',
        tags:     (n.tags || []).join(', '),
        isPinned: n.isPinned || false,
      })
      setAttachments(n.attachments || [])
      setLoading(false)
    })
  }, [token, id])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    await api.patch(`/notes/${id}`, payload, token)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  // Called when UploadThing finishes uploading note attachments
  const handleAttachmentUpload = async (res) => {
    setUploading(false)
    try {
      for (const file of res) {
        // Save file record linked to this note
        const saved = await api.post('/files', {
          filename:  file.name,
          url:       file.url,
          fileType:  'note-attachment',
          size:      file.size,
          mimeType:  file.type || 'application/octet-stream',
          linkedNote: id,
        }, token)
        setAttachments((prev) => [...prev, saved])
      }
      setUploadMsg('Files uploaded!')
      setTimeout(() => setUploadMsg(''), 3000)
    } catch (err) {
      setUploadMsg(err.message)
    }
  }

  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('Remove this file?')) return
    await api.delete(`/files/${fileId}`, token)
    setAttachments((prev) => prev.filter((f) => f._id !== fileId))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>← Back</button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saved && <span style={{ color: '#16a34a', fontSize: '14px' }}>✓ Saved</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="form-group">
        <input
          className="form-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Note title"
          style={{ fontSize: '22px', fontWeight: '700', padding: '8px 0',
            border: 'none', borderBottom: '1px solid #ddd', borderRadius: '0' }}
        />
      </div>

      {/* Subject + Tags */}
      <div className="grid-2" style={{ marginBottom: '16px' }}>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-input" value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
      </div>

      {/* Content */}
      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '14px' }}
        />
      </div>

      {/* Pin */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' }}>
        <input type="checkbox" checked={form.isPinned}
          onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
        Pin this note
      </label>

      {/* Attachments section */}
      <div className="card">
        <p className="form-label" style={{ marginBottom: '12px' }}>Attachments (images & PDFs)</p>

        {/* Upload button - Type 2: note attachments */}
        <UploadButton
          endpoint="noteAttachment"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={handleAttachmentUpload}
          onUploadError={(err) => { setUploading(false); setUploadMsg(err.message) }}
          appearance={{
            button: {
              background: '#4f46e5', color: '#fff',
              padding: '6px 14px', borderRadius: '6px',
              fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', border: 'none',
            },
          }}
        />

        {uploading && <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Uploading files...</p>}
        {uploadMsg && (
          <p style={{ fontSize: '13px', color: uploadMsg.includes('!') ? '#16a34a' : '#dc2626', marginTop: '8px' }}>
            {uploadMsg}
          </p>
        )}

        {/* List of attached files */}
        {attachments.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachments.map((file) => (
              <div key={file._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {file.mimeType?.includes('pdf') ? '📄' : '🖼️'}
                  </span>
                  <a href={file.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '13px', color: '#4f46e5' }}>
                    {file.filename}
                  </a>
                </div>
                <button className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteAttachment(file._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 && !uploading && (
          <p style={{ fontSize: '13px', color: '#aaa', marginTop: '10px' }}>No attachments yet</p>
        )}
      </div>
    </div>
  )
}
