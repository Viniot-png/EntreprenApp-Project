import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api/services/auth.service';

const verifySchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  verificationCode: z.string().min(6, 'Code invalide').max(6, 'Code invalide'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

const COUNTDOWN_SECONDS = 3 * 60; // 3 minutes

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const prefillEmail = query.get('email') || '';

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: prefillEmail, verificationCode: '' },
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(COUNTDOWN_SECONDS);
  const [isCounting, setIsCounting] = useState<boolean>(true);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  useEffect(() => {
    // start countdown on mount (assumes code was just sent after registration)
    setIsCounting(true);
    setSecondsLeft(COUNTDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (!isCounting) return;
    if (secondsLeft <= 0) {
      setIsCounting(false);
      return;
    }

    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [isCounting, secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setLoadingVerify(true);
      const resp = await authService.verifyEmail(data.verificationCode);
      if (resp.success) {
        toast({ title: 'Compte activé', description: 'Votre compte est maintenant activé.' });
        // after successful verification backend now sets auth cookies; go to dashboard
        navigate('/dashboard');
      } else {
        throw new Error(resp.message || 'Code invalide');
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Impossible de vérifier le code', variant: 'destructive' });
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({ title: 'Email requis', description: 'Veuillez entrer votre email pour renvoyer le code', variant: 'destructive' });
      return;
    }

    try {
      setLoadingResend(true);
      const resp = await authService.resendVerificationCode(email);
      if (resp.success) {
        toast({ title: 'Code renvoyé', description: 'Un nouveau code a été envoyé à votre email si le compte existe.' });
        // restart timer
        setSecondsLeft(COUNTDOWN_SECONDS);
        setIsCounting(true);
      } else {
        throw new Error(resp.message || 'Impossible de renvoyer le code');
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Impossible de renvoyer le code', variant: 'destructive' });
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérifier votre compte</h1>
              <p className="text-gray-600">Entrez le code de vérification envoyé à votre adresse email.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="votre@email.com" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de vérification</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" maxLength={6} {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Réinitialiser le code dans : <span className="font-medium">{formatTime(secondsLeft)}</span></div>
                  <button
                    type="button"
                    disabled={isCounting}
                    onClick={handleResend}
                    className={`text-sm font-semibold ${isCounting ? 'text-gray-400' : 'text-gold-600 hover:text-gold-700'}`}
                  >
                    {loadingResend ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={loadingVerify}>{loadingVerify ? 'Vérification...' : 'Activer mon compte'}</Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">Vous n'avez pas reçu l'email ? Vérifiez les spams ou <Link to="/register" className="text-gold-600 font-semibold">réinscrivez-vous</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
