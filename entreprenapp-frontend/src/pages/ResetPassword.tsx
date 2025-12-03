import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api/services';
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Lien invalide</h2>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Le lien de réinitialisation est invalide ou expiré.
          </p>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(resetToken, data.password);

      if (response.success) {
        setSuccess(true);
        toast({
          title: 'Succès',
          description: 'Votre mot de passe a été réinitialisé avec succès',
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error: any) {
      const message = error.message || 'Erreur lors de la réinitialisation';
      
      if (message.includes('expired') || message.includes('invalid')) {
        setTokenError(true);
      }

      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Mot de passe réinitialisé!</h2>
          </div>

          <p className="text-gray-600 text-center mb-6">
            Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>

          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Aller à la connexion
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Redirection automatique dans quelques secondes...
          </p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Lien expiré</h2>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Le lien de réinitialisation a expiré (10 minutes maximum).
          </p>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <Button
          onClick={() => navigate('/login')}
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Réinitialiser le mot de passe</h1>
        <p className="text-gray-600 mb-6">
          Entrez votre nouveau mot de passe
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                {...register('password')}
                type="password"
                placeholder="Au moins 8 caractères"
                className="w-full pl-10"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Répétez le mot de passe"
                className="w-full pl-10"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
            <p className="text-xs text-gray-600">
              ✓ Minimum 8 caractères <br />
              ✓ Doit être différent de l'ancien mot de passe
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors mt-6"
            disabled={loading}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  );
}
