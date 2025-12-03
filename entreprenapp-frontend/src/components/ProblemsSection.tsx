
import { DollarSign, Target, TrendingUp, Handshake } from 'lucide-react';

const ProblemsSection = () => {
  const problems = [
    {
      title: "Difficulté à trouver des financements",
      description: "Les entrepreneurs peinent à identifier les bonnes sources de financement adaptées à leur projet et secteur d'activité.",
      icon: DollarSign,
      color: "from-red-500 to-red-600"
    },
    {
      title: "Trop d'opportunités non pertinentes",
      description: "Les investisseurs reçoivent des centaines de propositions non qualifiées qui ne correspondent pas à leurs critères spécifiques.",
      icon: Target,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Accès limité aux ressources",
      description: "Les startups manquent de visibilité et d'accès aux outils nécessaires pour leur croissance et leur développement.",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Mauvaise coordination institutionnelle",
      description: "Faible coordination entre innovation, institutions et terrain limite considérablement l'impact des initiatives entrepreneuriales.",
      icon: Handshake,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-24 gradient-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gold-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Les Défis que Nous Résolvons
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              EntreprenApp adresse les principales problématiques de l'écosystème entrepreneurial africain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {problems.map((problem, index) => {
              const IconComponent = problem.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-gold-400/50 transition-all duration-500 hover:transform hover:scale-105 group"
                >
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-12 h-12 text-gold-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                    {problem.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {problem.description}
                  </p>
                  <div className={`w-full h-1 bg-gradient-to-r ${problem.color} mt-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
