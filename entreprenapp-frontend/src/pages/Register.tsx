
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/hooks/useRegistration';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProgressIndicator from '@/components/register/ProgressIndicator';
import RoleSelector from '@/components/register/RoleSelector';
import BasicInfoForm from '@/components/register/BasicInfoForm';
import RoleSpecificForms from '@/components/register/RoleSpecificForms';

const Register = () => {
  const navigate = useNavigate();
  const { register, user, loading } = useAuth();
  const { toast } = useToast();
  
  const {
    currentStep,
    registrationData,
    updateRole,
    updateBasicInfo,
    updateRoleSpecificData,
    nextStep,
    prevStep
  } = useRegistration();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Mapper les rôles du frontend vers le backend
  const mapRoleToBackend = (role: string | null): string => {
    if (!role) return 'entrepreneur';
    const mapping: Record<string, string> = {
      'investisseur': 'investor',
      'universite': 'university',
    };
    return mapping[role] || role;
  };

  const handleFinalSubmit = async () => {
    try {
      // Préparer les données d'inscription
      const registerData: any = {
        firstName: registrationData.basicInfo.firstName,
        lastName: registrationData.basicInfo.lastName,
        email: registrationData.basicInfo.email,
        password: registrationData.basicInfo.password,
        role: mapRoleToBackend(registrationData.role),
      };

      // Ajouter les données spécifiques au rôle
      const roleData = registrationData.roleSpecificData;
      
      // Mapper les champs selon le rôle
      if (registrationData.role === 'entrepreneur') {
        registerData.sector = roleData.secteurActivite;
        registerData.location = roleData.location || '';
      } else if (registrationData.role === 'investisseur') {
        registerData.sector = roleData.secteursInteret;
        registerData.professionalEmail = registrationData.basicInfo.email;
        // Note: verificationDocument devrait être géré dans le formulaire
      } else if (registrationData.role === 'startup') {
        registerData.sector = roleData.secteur;
        registerData.professionalEmail = registrationData.basicInfo.email;
      } else if (registrationData.role === 'organisation') {
        registerData.sector = roleData.secteurIntervention;
        registerData.professionalEmail = registrationData.basicInfo.email;
      } else if (registrationData.role === 'universite') {
        registerData.universityName = roleData.nomEtablissement;
        registerData.officialUniversityEmail = registrationData.basicInfo.email;
        registerData.location = roleData.ville || '';
      }

      await register(registerData);
      // Le toast est déjà géré dans useAuth
      // Rediriger vers la page de vérification en pré-remplissant l'email
      navigate(`/verify?email=${encodeURIComponent(registrationData.basicInfo.email)}`);
    } catch (error) {
      // L'erreur est déjà gérée dans useAuth avec un toast
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelector
            selectedRole={registrationData.role}
            onRoleSelect={updateRole}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <BasicInfoForm
            initialData={registrationData.basicInfo}
            onSubmit={(data) => {
              updateBasicInfo(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 3:
        return registrationData.role ? (
          <RoleSpecificForms
            role={registrationData.role}
            initialData={registrationData.roleSpecificData}
            onSubmit={(data) => {
              updateRoleSpecificData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600">Aucun rôle sélectionné</p>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Confirmation
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Récapitulatif de votre inscription
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-left">
                <div><strong>Rôle :</strong> {registrationData.role}</div>
                <div><strong>Nom :</strong> {registrationData.basicInfo.firstName} {registrationData.basicInfo.lastName}</div>
                <div><strong>Email :</strong> {registrationData.basicInfo.email}</div>
                <div><strong>Téléphone :</strong> {registrationData.basicInfo.phone}</div>
                {/* Affichage des données spécifiques au rôle */}
                {Object.keys(registrationData.roleSpecificData).length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <strong>Informations spécifiques :</strong>
                    <div className="mt-2 space-y-2">
                      {Object.entries(registrationData.roleSpecificData).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')} :</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" onClick={prevStep}>Retour</Button>
              <Button className="gradient-gold text-white" onClick={handleFinalSubmit}>Créer mon compte</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto responsive-padding">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gold-600 transition-colors">
              <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">Retour</span>
            </Link>
            <img 
              src="/lovable-uploads/a08a9764-dc5c-46ad-bc00-d7ddc061222a.png" 
              alt="EA ENTREPRENAPP" 
              className="h-6 sm:h-8 w-auto"
            />
            <Link to="/login" className="text-gray-600 hover:text-gold-600 transition-colors">
              <span className="text-sm sm:text-base hidden sm:inline">Déjà un compte ? Se connecter</span>
              <span className="text-sm sm:hidden">Connexion</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto responsive-padding py-8 sm:py-12">
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default Register;
