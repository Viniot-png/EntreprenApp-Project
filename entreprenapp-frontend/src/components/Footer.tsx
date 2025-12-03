
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'LinkedIn', href: '#' },
    { name: 'Instagram', href: '#' },
    { name: 'Twitter', href: '#' },
    { name: 'YouTube', href: '#' },
  ];

  const legalLinks = [
    { name: 'Mentions légales', href: '#' },
    { name: 'CGU', href: '#' },
    { name: 'Politique de confidentialité', href: '#' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto responsive-padding py-12 sm:py-16">
        <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <img 
                src="/lovable-uploads/a08a9764-dc5c-46ad-bc00-d7ddc061222a.png" 
                alt="EA ENTREPRENAPP" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 sm:mb-8 max-w-md leading-relaxed responsive-text-sm">
              La plateforme intelligente qui connecte et fait collaborer tous les acteurs de l'écosystème entrepreneurial africain pour accélérer l'innovation et la croissance.
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="px-3 sm:px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gold-500 hover:text-white transition-all duration-300 responsive-text-xs font-medium"
                  aria-label={social.name}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 sm:mb-6 responsive-text-base">Navigation</h3>
            <ul className="space-y-3 sm:space-y-4">
              {['Accueil', 'À propos', 'Rôles', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace('à propos', 'about').replace(' ', '')}`}
                    className="text-gray-400 hover:text-gold-400 transition-colors duration-300 hover:underline responsive-text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 sm:mb-6 responsive-text-base">Restez Connecté</h3>
            <p className="text-gray-400 responsive-text-xs mb-4 sm:mb-6 leading-relaxed">
              Recevez les dernières actualités et opportunités directement dans votre boîte mail.
            </p>
            <button
              onClick={scrollToTop}
              className="gradient-gold text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-gold hover:shadow-lg responsive-text-xs w-full sm:w-auto"
            >
              Retour en haut ↑
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <p className="text-gray-400 responsive-text-xs text-center md:text-left">
            © {currentYear} EntreprenApp. Tous droits réservés.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-gold-400 responsive-text-xs transition-colors duration-300 whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
