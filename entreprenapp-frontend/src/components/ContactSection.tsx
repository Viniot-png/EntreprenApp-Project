
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message envoyé avec succès !",
        description: "Nous vous répondrons sous 48h. Merci pour votre intérêt !",
      });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-24 gradient-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-radial from-gold-500 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-radial from-gold-600 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Contactez-Nous
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Une question ? Un projet ? Écrivons ensemble l'avenir de l'entrepreneuriat africain
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
                    Nom complet
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-gold-400 focus:ring-gold-400/20 rounded-xl py-3"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                    Adresse email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-gold-400 focus:ring-gold-400/20 rounded-xl py-3"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-white mb-3">
                    Votre message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-gold-400 focus:ring-gold-400/20 resize-none rounded-xl"
                    placeholder="Décrivez votre projet, vos questions ou vos besoins..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-gold text-white font-semibold py-4 rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>

                <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
                  <span>📧</span>
                  <span>Nous répondons sous 48h maximum</span>
                </div>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Rejoignez Notre Communauté
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Inscrivez-vous dès maintenant pour accéder aux opportunités exclusives et faire partie de la révolution entrepreneuriale africaine.
                </p>
                <Button className="w-full gradient-gold text-white font-semibold py-4 rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Créer mon compte gratuitement
                </Button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Newsletter EntreprenApp
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Recevez les dernières opportunités, actualités et insights de l'écosystème entrepreneurial.
                </p>
                <div className="flex space-x-3">
                  <Input
                    type="email"
                    placeholder="Votre email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-gold-400 focus:ring-gold-400/20 rounded-xl"
                  />
                  <Button className="gradient-gold text-white font-semibold px-6 rounded-xl shadow-gold hover:shadow-lg transition-all duration-300">
                    S'abonner
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
