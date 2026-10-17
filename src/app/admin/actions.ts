'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  passwordsMatch,
} from './auth';

export async function authenticateAdmin(formData: FormData) {
  const password = process.env.ADMIN_PASSWORD;
  const submittedPassword = formData.get('password');

  if (!password) {
    redirect('/admin?error=not-configured');
  }

  if (
    typeof submittedPassword !== 'string' ||
    !passwordsMatch(submittedPassword, password)
  ) {
    redirect('/admin?error=invalid-password');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  redirect('/admin');
}
