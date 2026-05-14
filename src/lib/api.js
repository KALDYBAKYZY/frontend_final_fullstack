const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res  = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  get:    (path, token)       => request(path, { method: 'GET' }, token),
  post:   (path, body, token) => request(path, { method: 'POST',   body: JSON.stringify(body) }, token),
  patch:  (path, body, token) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }, token),
  delete: (path, token)       => request(path, { method: 'DELETE' }, token),
}
