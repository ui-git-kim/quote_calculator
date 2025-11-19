// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Login, Register, ProtectedRoute } from '@/features/auth'
import { House, SignOut } from '@phosphor-icons/react'

// Your existing home page - now protected
function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">
            <House size={24} weight="duotone" />
            My App
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="text-sm">
            Welcome, <span className="font-semibold">{user?.name || user?.email}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            <SignOut size={20} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Welcome! 🚀</h2>
            <p>Your app is ready to build with:</p>
            <ul className="list-disc list-inside">
              <li>Vite + React + TypeScript</li>
              <li>Tailwind CSS v4 + DaisyUI</li>
              <li>Phosphor Icons</li>
              <li>Express + Prisma backend</li>
              <li>JWT Authentication ✨</li>
            </ul>
            <div className="card-actions justify-end">
              <button 
                className="btn btn-primary"
                onClick={() => toast.success('Everything is working!')}
              >
                Test Toast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App