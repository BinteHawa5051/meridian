import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get('meridian_session')?.value;

  // If not authenticated, redirect to login
  if (!token) {
    redirect('/login');
  }

  // If authenticated, redirect to dashboard
  redirect('/dashboard');
  return null;
}