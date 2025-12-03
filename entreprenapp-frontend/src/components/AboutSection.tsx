
import { Brain, Globe, Rocket } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="responsive-padding-section bg-gray-25">
      <div className="container mx-auto responsive-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Notre Mission
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-6 sm:mb-8"></div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-elegant border border-gray-100 mb-12 sm:mb-16">
            <p className="responsive-text-xl text-gray-700 leading-relaxed text-center px-2">
              <span className="font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">EntreprenApp</span> catalyse le développement entrepreneurial en connectant efficacement entrepreneurs, investisseurs, startups, organisations et universités dans un espace{' '}
              <span className="font-semibold text-gray-900">intelligent, collaboratif et évolutif</span>.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center group">
              <div className="w-16 sm:w-20 h-16 sm:h-20 gradient-gold rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-gold group-hover:scale-110 transition-all duration-300">
                <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="responsive-text-xl font-bold text-gray-900 mb-3 sm:mb-4">Intelligence Artificielle</h3>
              <p className="responsive-text-base text-gray-600 leading-relaxed px-2">Algorithme de matching personnalisé pour des connexions pertinentes et stratégiques</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 sm:w-20 h-16 sm:h-20 gradient-gold rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-gold group-hover:scale-110 transition-all duration-300">
                <Globe className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="responsive-text-xl font-bold text-gray-900 mb-3 sm:mb-4">Écosystème Africain</h3>
              <p className="responsive-text-base text-gray-600 leading-relaxed px-2">Conçu spécifiquement pour l'entrepreneuriat africain et ses défis uniques</p>
            </div>
            
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-16 sm:w-20 h-16 sm:h-20 gradient-gold rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-gold group-hover:scale-110 transition-all duration-300">
                <Rocket className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="responsive-text-xl font-bold text-gray-900 mb-3 sm:mb-4">Croissance Accélérée</h3>
              <p className="responsive-text-base text-gray-600 leading-relaxed px-2">Outils et ressources pour accélérer le développement des projets</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
