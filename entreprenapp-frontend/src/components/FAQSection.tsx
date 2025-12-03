
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Comment créer un compte sur EntreprenApp ?",
      answer: "L'inscription est gratuite et simple. Il suffit de remplir le formulaire d'inscription en précisant votre rôle (entrepreneur, investisseur, startup, etc.) et vos centres d'intérêt. Notre algorithme intelligent personnalisera ensuite votre expérience selon vos besoins spécifiques."
    },
    {
      question: "La plateforme est-elle vraiment gratuite ?",
      answer: "Oui, l'accès de base à EntreprenApp est entièrement gratuit et inclut les fonctionnalités essentielles. Nous proposons également des fonctionnalités premium pour les utilisateurs souhaitant bénéficier d'un accompagnement renforcé, d'outils avancés et d'un support prioritaire."
    },
    {
      question: "Qui peut proposer un appel à projet ?",
      answer: "Les organisations, entreprises, institutions publiques, universités et investisseurs qualifiés peuvent publier des appels à projets. Chaque annonce est soigneusement vérifiée par notre équipe pour garantir la qualité, la légitimité et la pertinence des opportunités proposées."
    },
    {
      question: "Comment fonctionne l'algorithme de personnalisation ?",
      answer: "Notre IA avancée analyse votre profil détaillé, vos préférences, votre secteur d'activité, votre géolocalisation et votre historique d'interactions pour vous proposer uniquement les opportunités les plus pertinentes. Plus vous utilisez la plateforme, plus les recommandations deviennent précises et adaptées."
    },
    {
      question: "Puis-je gérer plusieurs rôles sur mon compte ?",
      answer: "Absolument ! Vous pouvez avoir plusieurs casquettes (par exemple être entrepreneur et investisseur simultanément). Notre interface intelligente s'adapte automatiquement pour vous permettre de basculer facilement entre vos différents rôles et leurs fonctionnalités spécifiques."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "La sécurité et la confidentialité de vos données sont notre priorité absolue. Nous utilisons les dernières technologies de chiffrement de niveau bancaire et respectons strictement les réglementations internationales sur la protection des données personnelles (RGPD, etc.)."
    },
    {
      question: "Comment puis-je maximiser mes chances de financement ?",
      answer: "Complétez intégralement votre profil, utilisez nos outils avancés de création de pitch, participez activement aux webinaires de formation, suivez les conseils personnalisés de nos mentors experts, et engagez-vous dans notre communauté. Notre équipe support dédiée est également disponible pour vous accompagner dans votre démarche."
    }
  ];

  return (
    <section id="faq" className="responsive-padding-section bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto responsive-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="responsive-text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Questions Fréquentes
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="responsive-text-lg text-gray-600 leading-relaxed px-4">
              Tout ce que vous devez savoir sur EntreprenApp pour bien commencer
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-bold text-gray-900 hover:text-gold-600 transition-colors responsive-text-base py-4 sm:py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pt-2 pb-4 sm:pb-6 responsive-text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
