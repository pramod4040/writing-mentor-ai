'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  setPasswordInputSchema,
  updateUserSettingsInputSchema,
  type SetPasswordInput,
  type UpdateUserSettingsInput,
} from '@writer-mentor-ai/shared/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMentorTypes } from '@/lib/hooks/use-mentor-types';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/auth/user-avatar';

export default function SettingsPage() {
  const { user, updateSettings, setPassword } = useAuth();
  const { data: mentorTypes } = useMentorTypes();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<UpdateUserSettingsInput>({
    resolver: zodResolver(updateUserSettingsInputSchema),
    values: {
      name: user?.name ?? '',
      defaultMentorTypeId: user?.defaultMentorTypeId ?? null,
    },
  });

  const passwordForm = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordInputSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (values: UpdateUserSettingsInput) => {
    setProfileError(null);
    setProfileMessage(null);
    try {
      await updateSettings(values);
      setProfileMessage('Settings saved.');
    } catch (err) {
      setProfileError(err instanceof ApiClientError ? err.message : 'Failed to save settings');
    }
  };

  const onPasswordSubmit = async (values: SetPasswordInput) => {
    if (!user) return;
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      const payload: SetPasswordInput = {
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      if (user.hasPassword && values.currentPassword) {
        payload.currentPassword = values.currentPassword;
      }
      const updated = await setPassword(payload);
      passwordForm.reset();
      setPasswordMessage(
        updated.hasPassword && user.hasPassword
          ? 'Password updated.'
          : 'Password set. You can now sign in with email.',
      );
    } catch (err) {
      setPasswordError(err instanceof ApiClientError ? err.message : 'Failed to update password');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage your account and writing preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile information from sign-in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} image={user.image} size="md" />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-mentor">Default review type</Label>
              <Select
                id="default-mentor"
                value={profileForm.watch('defaultMentorTypeId') ?? ''}
                onChange={(e) =>
                  profileForm.setValue('defaultMentorTypeId', e.target.value || null)
                }
              >
                <option value="">Select a mentor type</option>
                {mentorTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-[var(--muted)]">
                Used for AI reviews until you choose another type.
              </p>
            </div>
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileMessage && <p className="text-sm text-green-700">{profileMessage}</p>}
            <Button type="submit">Save account settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI reviews</CardTitle>
          <CardDescription>
            Your daily AI review allowance resets on a rolling 24-hour window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Daily limit:{' '}
            <span className="font-medium">{user.dailyAiReviewLimit} reviews per 24 hours</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            {user.hasPassword
              ? 'Change your password for email sign-in.'
              : 'Set a password to sign in with email in addition to Google.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            {user.hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register('currentPassword')}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">{user.hasPassword ? 'New password' : 'Password'}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('password')}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {passwordForm.formState.errors.root && (
              <p className="text-sm text-red-600">{passwordForm.formState.errors.root.message}</p>
            )}
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-green-700">{passwordMessage}</p>}
            <Button type="submit">
              {user.hasPassword ? 'Update password' : 'Set password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
