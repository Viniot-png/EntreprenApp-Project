import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api/services';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(data.email);
      
      if (response.success) {
        setSentEmail(data.email);
        setSent(true);
        toast({
          title: 'Email envoyé',
          description: `Vérifiez votre boîte mail (${data.email}) pour le lien de réinitialisation`,
        });
      } else {
        throw new Error(response.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'email de réinitialisation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Email envoyé!</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-center">
              Un lien de réinitialisation a été envoyé à <br />
              <strong className="text-blue-600">{sentEmail}</strong>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Vérifiez votre boîte mail et votre dossier spam
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Le lien d'accès expire dans 10 minutes
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Cliquez sur le lien pour réinitialiser votre mot de passe
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
          >
            Retour à la connexion
          </Button>

          <Button
            onClick={() => setSent(false)}
            variant="outline"
            className="w-full"
          >
            Renvoyer l'email
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

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mot de passe oublié?</h1>
        <p className="text-gray-600 mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="vous@exemple.com"
              className="w-full"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Pas encore inscrit?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
