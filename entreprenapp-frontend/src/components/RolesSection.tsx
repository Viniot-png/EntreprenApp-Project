
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Briefcase, Rocket, Building2, GraduationCap, Settings } from 'lucide-react';

const RolesSection = () => {
  const [activeTab, setActiveTab] = useState('entrepreneurs');

  const roles = {
    entrepreneurs: {
      title: "Entrepreneurs",
      icon: Lightbulb,
      color: "from-blue-500 to-blue-600",
      features: [
        "Profil complet avec CV et portfolio interactif",
        "Appels à projets personnalisés selon vos critères",
        "Mentorat exclusif par des experts reconnus",
        "Suivi détaillé de vos candidatures en temps réel",
        "Accès privilégié aux ressources de formation premium"
      ]
    },
    investisseurs: {
      title: "Investisseurs",
      icon: Briefcase,
      color: "from-green-500 to-green-600",
      features: [
        "Filtres avancés pour identifier les projets pertinents",
        "Analyse ROI et métriques de performance détaillées",
        "Suivi intelligent de vos portefeuilles d'investissement",
        "Due diligence simplifiée avec outils automatisés",
        "Réseau exclusif d'investisseurs et co-investisseurs"
      ]
    },
    startups: {
      title: "Startups",
      icon: Rocket,
      color: "from-purple-500 to-purple-600",
      features: [
        "Création assistée de pitch deck professionnel",
        "Accès direct aux investisseurs qualifiés",
        "Outils de croissance et métriques de performance",
        "Visibilité accrue auprès des partenaires stratégiques",
        "Support technique et accompagnement personnalisé"
      ]
    },
    organisations: {
      title: "Organisations",
      icon: Building2,
      color: "from-orange-500 to-orange-600",
      features: [
        "Publication simplifiée d'appels à projets ciblés",
        "Suivi en temps réel des projets soutenus",
        "Mesure d'impact avec tableaux de bord détaillés",
        "Gestion optimisée des partenariats stratégiques",
        "Reporting automatisé et analyses approfondies"
      ]
    },
    universites: {
      title: "Universités",
      icon: GraduationCap,
      color: "from-indigo-500 to-indigo-600",
      features: [
        "Organisation facilitée de hackathons et concours",
        "Partenariats industrie-université structurés",
        "Promotion et valorisation de la recherche",
        "Connexion étudiants-entreprises optimisée",
        "Suivi des alumni et de leurs réussites"
      ]
    },
    admin: {
      title: "Administrateurs",
      icon: Settings,
      color: "from-red-500 to-red-600",
      features: [
        "Modération avancée de contenu et interactions",
        "Statistiques globales et analytics détaillées",
        "Gestion complète des utilisateurs et permissions",
        "Configuration fine de l'algorithme de matching",
        "Support technique prioritaire et monitoring"
      ]
    }
  };

  return (
    <section id="roles" className="responsive-padding-section bg-white">
      <div className="container mx-auto responsive-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="responsive-text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Fonctionnalités par Rôle
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="responsive-text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Des outils spécialisés et optimisés pour chaque acteur de l'écosystème entrepreneurial
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8 sm:mb-12">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 bg-transparent p-0 h-auto w-full max-w-5xl">
                {Object.entries(roles).map(([key, role]) => {
                  const IconComponent = role.icon;
                  return (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-400 data-[state=active]:to-gold-600 data-[state=active]:text-white data-[state=active]:shadow-gold text-gray-700 font-medium rounded-lg sm:rounded-xl py-3 sm:py-4 px-3 sm:px-6 transition-all duration-300 flex flex-col items-center space-y-1 sm:space-y-2 min-h-[60px] sm:min-h-[80px] border border-gray-200 data-[state=active]:border-gold-500"
                    >
                      <IconComponent className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="text-xs sm:text-sm leading-tight text-center">{role.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {Object.entries(roles).map(([key, role]) => {
              const IconComponent = role.icon;
              return (
                <TabsContent key={key} value={key} className="animate-fade-in">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-elegant border border-gray-100">
                    <div className="flex items-center mb-6 sm:mb-8">
                      <div className={`w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r ${role.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mr-4 sm:mr-6`}>
                        <IconComponent className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="responsive-text-2xl font-bold text-gray-900">{role.title}</h3>
                        <div className={`w-16 sm:w-20 h-1 bg-gradient-to-r ${role.color} mt-2 rounded-full`}></div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3 sm:space-x-4 group">
                          <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r ${role.color} rounded-full flex-shrink-0 mt-2 group-hover:scale-125 transition-transform duration-300`}></div>
                          <span className="responsive-text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
