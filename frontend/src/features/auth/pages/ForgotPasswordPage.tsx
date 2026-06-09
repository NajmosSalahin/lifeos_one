import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '../../../app/supabase';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
          <p className="mt-2 text-sm text-text-secondary">We sent a password reset link to your email</p>
          <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:underline">Back to sign in</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Forgot password</h1>
          <p className="mt-2 text-sm text-text-secondary">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/login" className="text-accent hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
