import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import MyFiles from './pages/MyFiles'
import PaymentSuccess from './pages/PaymentSuccess'
import PublicFile from './pages/PublicFile'
import Subscriptions from './pages/Subscriptions'
import Transactions from './pages/Transactions'
import UploadPage from './pages/UploadPage'

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <p className="text-5xl font-bold text-brand-600">404</p>
        <p className="mt-2 text-slate-600">Page not found</p>
        <Link to="/" className="btn-primary mt-6">
          Go home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/file/:id" element={<PublicFile />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/my-files" element={<MyFiles />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
