import { House } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">
            <House size={24} weight="duotone" />
            My App
          </a>
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

export default App