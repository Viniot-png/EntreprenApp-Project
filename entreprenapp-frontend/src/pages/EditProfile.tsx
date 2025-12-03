import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/api/services';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Camera, ArrowLeft, Loader2 } from 'lucide-react';

// Zod validation schema
const editProfileSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Initialize previews after user is loaded
  const [previewsInitialized, setPreviewsInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullname: '',
      bio: '',
      location: '',
      gender: '',
      dob: '',
    },
  });

  // Set form values and previews when user data is loaded
  useEffect(() => {
    if (user && !previewsInitialized) {
      reset({
        fullname: user?.fullname || user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        gender: (user?.gender as any) || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      });
      
      // Handle profileImage which can be string or object
      const profileImg = typeof user?.profileImage === 'string' 
        ? user.profileImage 
        : user?.profileImage?.url || null;
      setProfileImagePreview(profileImg);
      
      // Handle coverImage which can be string or object
      const coverImg = typeof user?.coverImage === 'string' 
        ? user.coverImage 
        : user?.coverImage?.url || null;
      setCoverImagePreview(coverImg);
      
      setPreviewsInitialized(true);
    }
  }, [user, previewsInitialized]);

  // Redirection si pas authentifié
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Gestion upload image profil
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'L\'image ne doit pas dépasser 5MB',
          variant: 'destructive',
        });
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion upload image couverture
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'L\'image ne doit pas dépasser 5MB',
          variant: 'destructive',
        });
        return;
      }

      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form with validation
  const onSubmit = async (data: EditProfileFormData) => {
    // Client-side validation
    if (!data.fullname || data.fullname.trim().length < 2) {
      toast({
        title: 'Erreur',
        description: 'Le nom doit contenir au moins 2 caractères',
        variant: 'destructive',
      });
      return;
    }

    if (data.bio && data.bio.length > 500) {
      toast({
        title: 'Erreur',
        description: 'La bio ne peut pas dépasser 500 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Ajouter champs texte
      formData.append('fullname', data.fullname);
      if (data.bio) formData.append('bio', data.bio);
      if (data.location) formData.append('location', data.location);
      // Convert "unspecified" to empty string for gender
      const genderValue = data.gender === 'unspecified' ? '' : data.gender;
      if (genderValue) formData.append('gender', genderValue);
      if (data.dob) formData.append('dob', data.dob);

      // Ajouter images si présentes
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }

      // Appeler API
      const response = await authService.updateProfile(formData);

      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Votre profil a été mis à jour avec succès',
        });

        // Reset state
        setProfileImageFile(null);
        setCoverImageFile(null);

        // Redirection après succès
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Une erreur est survenue lors de la mise à jour',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Éditer mon profil</h1>
            <p className="text-sm text-muted-foreground">Mettez à jour vos informations personnelles</p>
          </div>
        </div>

        {/* Cover Image */}
        <Card className="overflow-hidden">
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary to-primary/80 group cursor-pointer">
            {coverImagePreview ? (
              <img
                src={coverImagePreview}
                alt="Couverture"
                className="w-full h-full object-cover"
              />
            ) : user?.coverImage ? (
              <img
                src={typeof user.coverImage === 'string' ? user.coverImage : (user.coverImage?.url || '')}
                alt="Couverture"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => coverInputRef.current?.click()}
                type="button"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-16 sm:-mt-24 group/avatar">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                  <AvatarImage
                    src={profileImagePreview || (typeof user?.profileImage === 'string' ? user.profileImage : (user?.profileImage?.url || ''))}
                    alt={user?.fullname || user?.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {(user?.fullname || user?.name)?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-10 w-10 bg-background border-2 border-background hover:bg-muted opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">JPG, PNG ou GIF. Max 5MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Mettez à jour vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="fullname">Nom complet *</Label>
                <Input
                  id="fullname"
                  placeholder="Votre nom complet"
                  {...register('fullname')}
                  disabled={isLoading}
                />
                {errors.fullname && (
                  <p className="text-sm text-destructive">{errors.fullname.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (À propos de vous)</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous... (max 500 caractères)"
                  {...register('bio')}
                  disabled={isLoading}
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {watch('bio')?.length || 0}/500 caractères
                </p>
              </div>

              {/* Location et Genre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    placeholder="Ville, Pays"
                    {...register('location')}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={watch('gender') || 'unspecified'}
                    onValueChange={(value) => setValue('gender', value === 'unspecified' ? '' : (value as any))}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unspecified">Non spécifié</SelectItem>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                      <SelectItem value="prefer-not-to-say">Préfère ne pas dire</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date de naissance</Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register('dob')}
                    disabled={isLoading}
                  />
                  {errors.dob && (
                    <p className="text-sm text-destructive">{errors.dob.message}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Aide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conseils</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Utilisez une photo de profil claire et professionnelle</p>
            <p>• Votre bio aide les autres à vous comprendre</p>
            <p>• Mettez à jour votre localisation pour une meilleure correspondance</p>
            <p>• Tous les champs sauf le nom sont optionnels</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditProfile;
