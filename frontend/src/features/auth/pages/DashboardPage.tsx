import { useAuth } from '../hooks/useAuth'
import { SignOut, User } from '@phosphor-icons/react'

/**
 * Dashboard Page - Protected route
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Dashboard</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <User className="w-6 h-6" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li className="menu-title">
                <span>{user?.email}</span>
              </li>
              <li>
                <a onClick={logout}>
                  <SignOut className="w-4 h-4" />
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Welcome back!</h2>
              <p className="text-base-content/70">
                You're logged in as <strong>{user?.name || user?.email}</strong>
              </p>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Stats</h2>
              <div className="stat">
                <div className="stat-title">Total Projects</div>
                <div className="stat-value text-primary">0</div>
                <div className="stat-desc">Get started by creating your first project</div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Get Started</h2>
              <p className="text-base-content/70">
                This is your dashboard. Start building your app here!
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Create Project</button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="alert alert-info mt-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Template Ready!</h3>
            <div className="text-xs">
              This is a starter template with authentication. Customize the dashboard to fit your
              needs.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
