
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Briefcase, Rocket, Building2, GraduationCap } from 'lucide-react';
import { UserRole } from '@/hooks/useRegistration';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onNext: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect, onNext }) => {
  const roles = [
    {
      id: 'entrepreneur' as UserRole,
      title: 'Entrepreneur',
      description: 'Je suis un entrepreneur individuel cherchant des opportunités',
      icon: Lightbulb,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'investisseur' as UserRole,
      title: 'Investisseur',
      description: 'Je cherche des projets et startups à financer',
      icon: Briefcase,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'startup' as UserRole,
      title: 'Startup',
      description: 'Je représente une startup en croissance',
      icon: Rocket,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'organisation' as UserRole,
      title: 'Organisation',
      description: 'ONG, institution ou organisme gouvernemental',
      icon: Building2,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'universite' as UserRole,
      title: 'Université',
      description: 'Institution académique ou centre de recherche',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Quel est votre rôle ?
        </h2>
        <p className="text-lg text-gray-600">
          Sélectionnez le rôle qui vous correspond le mieux pour personnaliser votre expérience
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {roles.map((role) => {
          const IconComponent = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <div
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'border-gold-500 bg-gradient-to-br from-gold-50 to-white shadow-gold'
                  : 'border-gray-200 bg-white hover:border-gold-300 hover:shadow-lg'
              }`}
            >
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedRole && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="gradient-gold text-white font-semibold px-8 py-3 rounded-xl shadow-gold hover:shadow-lg transition-all duration-300"
          >
            Continuer
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
