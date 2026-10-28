import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Field'
import { Alert, Spinner } from '@/components/feedback'
import { useAuth } from '@/features/auth/useAuth'
import { loginSchema, type LoginValues } from '@/schemas/auth'

// Responsibility: staff sign-in form. Public applicants never use this page.
export default function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/staff'
  const [error, setError] = useState<string | null>(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (auth.loading) return <Spinner />
  if (auth.isStaffSession) return <Navigate to={from} replace />

  const onSubmit = async (v: LoginValues) => {
    setError(null)
    const msg = await auth.signIn(v.email, v.password)
    if (msg) setError(msg)
    else navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-semibold">Staff sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="username" required error={errors.email?.message} {...register('email')} />
        <TextField label="Password" type="password" autoComplete="current-password" required error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
      </form>
    </div>
  )
}