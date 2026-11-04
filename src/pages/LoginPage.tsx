import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Building2, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Spinner } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { LoginCrane } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { mapAuthError } from '@/features/auth/errors'
import {
  consumeReturnTo,
  resolveReturnTo,
} from '@/features/auth/returnTo'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas'

export function LoginPage() {
  const { signIn, session, loading } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const statePath = (
    location.state as { from?: { pathname?: string } } | null
  )?.from?.pathname
  const from = resolveReturnTo(statePath)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (session) {
    consumeReturnTo()
    return <Navigate to={from} replace />
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[42%] flex-col justify-center overflow-hidden bg-primary px-10 py-10 text-primary-fg lg:flex">
        <div className="relative z-10">
          <div className="mb-10 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-white/15">
              <Building2 className="size-4" />
            </span>
            <span className="font-display text-xl font-semibold">СтройCRM</span>
          </div>
          <h1 className="font-display text-4xl leading-[1.15] font-bold tracking-tight">
            Стройка под контролем —
            <br />
            от объекта до сдачи
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
            Назначайте работы, следите за статусами и держите команду в курсе —
            без таблиц и хаоса в чатах.
          </p>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </aside>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
        <LoginCrane />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-white">
                <Building2 className="size-3.5" />
              </span>
              <span className="font-display text-xl font-semibold text-ink">
                СтройCRM
              </span>
            </div>
          </div>

          <h2 className="font-display text-3xl font-semibold text-ink">Вход</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Войдите под своей учётной записью
          </p>

          <form
            className="mt-8 rounded-xl border border-line bg-paper-elevated/95 p-5 shadow-[var(--ds-shadow-md)] backdrop-blur-[2px] md:p-6"
            onSubmit={handleSubmit(async (values) => {
              setError(null)
              try {
                await signIn(values.email, values.password)
              } catch (e) {
                setError(mapAuthError(e))
              }
            })}
          >
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="manager@crm.local"
                {...register('email')}
              />
            </FormField>
            <div className="mt-4">
              <FormField
                label="Пароль"
                htmlFor="password"
                error={errors.password?.message}
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-11"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-paper hover:text-ink"
                    aria-label={
                      showPassword ? 'Скрыть пароль' : 'Показать пароль'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <Button type="submit" className="mt-6 w-full" loading={isSubmitting}>
              Войти
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
