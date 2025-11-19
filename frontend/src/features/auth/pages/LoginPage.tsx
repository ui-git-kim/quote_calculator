import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { EnvelopeSimple, LockKey } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Page
 */
export default function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
    } catch (error) {
      // Error is handled in useAuth hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <h1 className="card-title text-3xl font-bold text-center justify-center mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to your account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeSimple className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? 'input-error' : ''
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKey className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="divider">OR</div>
          <p className="text-center text-sm text-base-content/70">
            Don't have an account?{' '}
            <Link to="/register" className="link link-primary font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
