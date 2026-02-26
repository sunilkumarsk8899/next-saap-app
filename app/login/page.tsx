import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <p className="text-slate-300">Sign in to save and manage your favorite photos.</p>
      <AuthForm />
    </div>
  );
}
