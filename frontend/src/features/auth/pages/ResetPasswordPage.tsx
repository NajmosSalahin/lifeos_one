import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '../../../app/supabase';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
      }
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setError('');
    const { error: authError } = await supabase.auth.updateUser({ password: data.password });
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate('/login', { state: { message: 'Password reset successfully. Sign in with your new password.' } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Reset password</h1>
          <p className="mt-2 text-sm text-text-secondary">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="password" label="New Password" type="password" placeholder="New password" error={errors.password?.message} {...register('password')} />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Resetting...' : 'Reset Password'}</Button>
        </form>
      </motion.div>
    </div>
  );
}
