import { useState, useEffect, useCallback } from 'react';
import { 
  authService, 
  type FrontendUser, 
  type LoginData, 
  type RegisterData,
  type FrontendRegisterData 
} from '@/lib/api/services';
import { useToast } from '@/hooks/use-toast';

interface UseAuthReturn {
  user: FrontendUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData | FrontendRegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger l'utilisateur depuis le localStorage ou l'API
  const loadUser = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Vérifier que le token est toujours valide en récupérant le profil
        try {
          const response = await authService.getProfile();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Si le token est invalide, nettoyer le localStorage
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await authService.login(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue !',
        });
      } else {
        throw new Error(response.message || 'Erreur lors de la connexion');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible de se connecter',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyer quand même le localStorage même en cas d'erreur
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [toast]);

  const register = useCallback(async (data: RegisterData | FrontendRegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      
      if (response.success) {
        toast({
          title: 'Inscription réussie',
          description: 'Vérifiez votre email pour activer votre compte.',
        });
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message || 'Impossible de créer le compte',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
  };
};

