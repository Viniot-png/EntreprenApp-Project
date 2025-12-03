
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('fr');
  const navigate = useNavigate();

  const navItems = [
    { label: 'Accueil', href: '#home' },
    { label: 'À propos', href: '#about' },
    { label: 'Rôles', href: '#roles' },
    { label: 'Ressources', href: '#resources' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleRegisterClick = () => {
    navigate('/register');
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-gold-200/30 shadow-elegant">
      <div className="container mx-auto responsive-padding">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/a08a9764-dc5c-46ad-bc00-d7ddc061222a.png" 
              alt="EA ENTREPRENAPP" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-gold-600 transition-all duration-300 font-medium text-sm tracking-wide relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Language Toggle & CTA */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-6">
            <div className="flex items-center">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="flex items-center space-x-1 xl:space-x-2 text-gray-700 hover:text-gold-600 transition-colors p-1 xl:p-2 rounded-lg hover:bg-gold-50"
              >
                <span>{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                <span className="text-xs xl:text-sm font-medium">{language === 'fr' ? 'FR' : 'EN'}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center space-x-2 xl:space-x-3">
              <Button 
                onClick={handleLoginClick}
                variant="outline"
                className="font-semibold px-3 xl:px-6 py-2 xl:py-2.5 rounded-xl border-gold-200 text-gold-700 hover:bg-gold-50 transition-all duration-300 text-xs xl:text-sm"
              >
                <span className="hidden xl:inline">Se connecter</span>
                <span className="xl:hidden">Connexion</span>
              </Button>
              <Button 
                onClick={handleRegisterClick}
                className="gradient-gold text-white font-semibold px-3 xl:px-6 py-2 xl:py-2.5 rounded-xl shadow-gold hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs xl:text-sm"
              >
                S'inscrire
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="lg:hidden text-gray-700 hover:text-gold-600 p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-effect border-gold-200/30 w-[300px] sm:w-80 overflow-y-auto">
              <div className="flex flex-col h-full justify-between">
                {/* Navigation Items */}
                <div className="flex flex-col space-y-4 mt-6 sm:mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="text-gray-700 hover:text-gold-600 transition-colors text-left p-3 rounded-lg hover:bg-gold-50 font-medium w-full text-base"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Language and Actions - Bottom section */}
                <div className="border-t border-gold-200/30 pt-4 sm:pt-6 mt-8">
                  <button
                    onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                    className="flex items-center space-x-3 text-gray-700 hover:text-gold-600 p-3 rounded-lg hover:bg-gold-50 w-full mb-4"
                  >
                    <span>{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    <span className="font-medium">{language === 'fr' ? 'Français' : 'English'}</span>
                  </button>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleLoginClick}
                      variant="outline"
                      className="w-full font-semibold py-3 text-sm sm:text-base rounded-xl border-gold-200 text-gold-700 hover:bg-gold-50"
                    >
                      Se connecter
                    </Button>
                    <Button 
                      onClick={handleRegisterClick}
                      className="w-full gradient-gold text-white font-semibold py-3 text-sm sm:text-base rounded-xl shadow-gold"
                    >
                      S'inscrire
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
