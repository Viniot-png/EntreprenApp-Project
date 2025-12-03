
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <section id="home" className="relative gradient-dark overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-radial from-gold-500/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-radial from-gold-600/15 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-radial from-gold-400/25 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto responsive-padding relative z-10 responsive-padding-section">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="responsive-text-6xl font-bold text-white mb-6 sm:mb-8 animate-fade-in leading-tight">
            Rejoignez l'écosystème{' '}
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              entrepreneurial intelligent
            </span>
          </h1>
          
          <p className="responsive-text-xl text-gray-300 mb-8 sm:mb-12 animate-fade-in max-w-3xl mx-auto leading-relaxed px-4" style={{ animationDelay: '0.2s' }}>
            Connectez-vous aux bonnes opportunités, au bon moment, avec les bons partenaires dans l'écosystème africain.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in mb-12 sm:mb-16 px-4" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={() => scrollToSection('#about')}
              size="lg" 
              className="gradient-gold text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 responsive-text-base rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Découvrir la plateforme
            </Button>
            <Button 
              onClick={handleRegisterClick}
              size="lg" 
              variant="outline" 
              className="border-2 border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 responsive-text-base rounded-xl transition-all duration-300 hover:scale-105 bg-transparent w-full sm:w-auto"
            >
              S'inscrire gratuitement
            </Button>
          </div>

          {/* Network visualization */}
          <div className="relative animate-fade-in px-4" style={{ animationDelay: '0.6s' }}>
            <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 lg:gap-6">
              {['Entrepreneurs', 'Investisseurs', 'Startups', 'Organisations', 'Universités'].map((role, index) => (
                <div key={role} className="relative group">
                  <div className="bg-white/10 backdrop-blur-sm border border-gold-400/30 rounded-full px-3 sm:px-6 py-2 sm:py-3 text-gold-300 text-xs sm:text-sm font-medium transition-all duration-300 group-hover:bg-gold-500/20 group-hover:border-gold-400/60 group-hover:scale-105">
                    {role}
                  </div>
                  {index < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-6 h-0.5 bg-gradient-to-r from-gold-400/60 to-gold-600/30"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
