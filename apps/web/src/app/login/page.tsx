'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { loginInputSchema, type LoginInput } from '@writer-mentor-ai/shared/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { ApiClientError } from '@/lib/api/client';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(values);
      router.replace('/' as Route);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await googleLogin({ idToken: credentialResponse.credential });
      router.replace('/' as Route);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue writing and reviewing. New accounts are created with Google sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-center text-sm text-[var(--muted)]">
              Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
            </p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-2 text-[var(--muted)]">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in with email'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--muted)]">
            No password yet? Sign in with Google, then set a password in Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
