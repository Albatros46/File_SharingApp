import axios from 'axios'

export const TOKEN_KEY = 'cloudshare_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid: drop it and send the user to the login page
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback
}

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const filesApi = {
  list: () => api.get('/files').then((r) => r.data),
  upload: (files, onProgress) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return api
      .post('/files', form, {
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
      })
      .then((r) => r.data)
  },
  setVisibility: (id, isPublic) => api.patch(`/files/${id}/visibility`, { isPublic }).then((r) => r.data),
  remove: (id) => api.delete(`/files/${id}`),
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
}

export const publicApi = {
  info: (id) => api.get(`/public/files/${id}`).then((r) => r.data),
  downloadUrl: (id) => `${api.defaults.baseURL}/public/files/${id}/download`,
}

export const paymentsApi = {
  plans: () => api.get('/payments/plans').then((r) => r.data),
  checkout: (planId) => api.post('/payments/checkout', { planId }).then((r) => r.data),
  verify: (sessionId) => api.post('/payments/verify', { sessionId }).then((r) => r.data),
  transactions: () => api.get('/payments/transactions').then((r) => r.data),
}

export default api
