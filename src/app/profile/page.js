'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { UploadButton } from '@uploadthing/react'

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const [form, setForm] = useState({
    username: user?.username || '',
    bio:      user?.bio      || '',
    avatar:   user?.avatar   || '',
  })
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]           = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.patch('/auth/profile', form, token)
      updateUser(updated)
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Called when UploadThing finishes uploading the avatar
  const handleAvatarUpload = async (res) => {
    const file = res[0]
    setUploading(false)
    setForm((prev) => ({ ...prev, avatar: file.url }))

    try {
      // 1. Update user profile with new avatar URL
      const updated = await api.patch('/auth/profile', { ...form, avatar: file.url }, token)
      updateUser(updated)

      // 2. Save file record to our DB (links file to user)
      await api.post('/files', {
        filename: file.name,
        url:      file.url,
        fileType: 'avatar',
        size:     file.size,
        mimeType: 'image/*',
      }, token)

      setMsg('Avatar updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '560px' }}>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>Edit Profile</h1>

      {/* Avatar upload card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <p className="form-label" style={{ marginBottom: '14px' }}>Profile Photo</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {form.avatar ? (
            <img src={form.avatar} alt="avatar"
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                objectFit: 'cover', border: '2px solid #4f46e5' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%',
              background: '#e0e7ff', color: '#4f46e5', fontWeight: '700',
              fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>JPG or PNG, max 4MB</p>
            <UploadButton
              endpoint="avatarUploader"
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={handleAvatarUpload}
              onUploadError={(err) => { setUploading(false); setMsg(err.message) }}
              appearance={{
                button: {
                  background: '#4f46e5', color: '#fff',
                  padding: '6px 14px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', border: 'none',
                },
              }}
            />
            {uploading && <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Uploading...</p>}
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: '600', fontSize: '16px' }}>{user?.username}</p>
        <p style={{ fontSize: '13px', color: '#888' }}>{user?.email}</p>
        <span className="badge badge-subject" style={{ marginTop: '6px', display: 'inline-block' }}>{user?.role}</span>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>
      )}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" style={{ minHeight: '90px' }}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
