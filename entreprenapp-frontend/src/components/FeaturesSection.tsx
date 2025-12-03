
import { Brain, Target, BarChart3, BookOpen, Network, TrendingUp } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: "Matching Intelligent Personnalisé",
      description: "Notre algorithme IA analyse vos besoins et préférences pour vous connecter aux opportunités les plus pertinentes et prometteuses.",
      icon: Brain,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Opportunités Ciblées par Rôle",
      description: "Recevez uniquement les contenus et opportunités qui correspondent parfaitement à votre profil et vos objectifs stratégiques.",
      icon: Target,
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Suivi et Gestion des Candidatures",
      description: "Tableau de bord centralisé pour suivre efficacement vos candidatures, projets et toutes vos interactions importantes.",
      icon: BarChart3,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Accès aux Ressources Premium",
      description: "Guides exclusifs, webinaires experts, formations spécialisées et accompagnement personnalisé par des mentors expérimentés.",
      icon: BookOpen,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Réseau Structuré par Rôle",
      description: "Connectez-vous facilement avec des entrepreneurs, investisseurs et experts reconnus de votre secteur d'activité.",
      icon: Network,
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      title: "Analytics et Insights",
      description: "Données détaillées et analyses approfondies pour optimiser vos stratégies et mesurer précisément votre impact.",
      icon: TrendingUp,
      gradient: "from-teal-500 to-green-600"
    }
  ];

  return (
    <section className="responsive-padding-section bg-gray-25">
      <div className="container mx-auto responsive-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="responsive-text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Notre Valeur Ajoutée
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="responsive-text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Des fonctionnalités avancées et innovantes pour optimiser votre parcours entrepreneurial
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-elegant hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-gray-100 group"
                >
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 gradient-gold rounded-xl flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gold-500 opacity-90"></div>
                      <IconComponent className="w-5 sm:w-7 h-5 sm:h-7 text-white relative z-10" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-gold-400 to-gold-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                  </div>
                  <h3 className="responsive-text-lg font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="responsive-text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
