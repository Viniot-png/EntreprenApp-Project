
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserRole, RoleSpecificData } from '@/hooks/useRegistration';

// Schémas de validation pour chaque rôle
const entrepreneurSchema = z.object({
  secteurActivite: z.string().min(1, 'Le secteur d\'activité est requis'),
  stadeDevloppement: z.string().min(1, 'Le stade de développement est requis'),
  rechercheFinancement: z.string().min(1, 'Veuillez préciser si vous recherchez un financement'),
  montantRecherche: z.string().optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

const investisseurSchema = z.object({
  typeInvestissement: z.string().min(1, 'Le type d\'investissement est requis'),
  secteursInteret: z.string().min(1, 'Les secteurs d\'intérêt sont requis'),
  ticketMoyen: z.string().min(1, 'Le ticket moyen est requis'),
  experience: z.string().min(1, 'L\'expérience est requise'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

const startupSchema = z.object({
  nomStartup: z.string().min(2, 'Le nom de la startup doit contenir au moins 2 caractères'),
  stade: z.string().min(1, 'Le stade est requis'),
  secteur: z.string().min(1, 'Le secteur est requis'),
  tailleEquipe: z.string().min(1, 'La taille de l\'équipe est requise'),
  rechercheActive: z.string().min(1, 'Veuillez préciser vos recherches actives'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

const organisationSchema = z.object({
  typeOrganisation: z.string().min(1, 'Le type d\'organisation est requis'),
  nomOrganisation: z.string().min(2, 'Le nom de l\'organisation doit contenir au moins 2 caractères'),
  secteurIntervention: z.string().min(1, 'Le secteur d\'intervention est requis'),
  programmes: z.string().min(1, 'Les programmes sont requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

const universiteSchema = z.object({
  nomEtablissement: z.string().min(2, 'Le nom de l\'établissement doit contenir au moins 2 caractères'),
  departements: z.string().min(1, 'Les départements sont requis'),
  programmesEntrepreneuriaux: z.string().min(1, 'Les programmes entrepreneuriaux sont requis'),
  ville: z.string().min(1, 'La ville est requise'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

interface RoleSpecificFormsProps {
  role: UserRole;
  initialData: RoleSpecificData;
  onSubmit: (data: RoleSpecificData) => void;
  onBack: () => void;
}

const RoleSpecificForms: React.FC<RoleSpecificFormsProps> = ({ role, initialData, onSubmit, onBack }) => {
  const getSchema = () => {
    switch (role) {
      case 'entrepreneur': return entrepreneurSchema;
      case 'investisseur': return investisseurSchema;
      case 'startup': return startupSchema;
      case 'organisation': return organisationSchema;
      case 'universite': return universiteSchema;
      default: return z.object({});
    }
  };

  const form = useForm<RoleSpecificData>({
    resolver: zodResolver(getSchema()),
    defaultValues: initialData || {}
  });

  const handleSubmit = (data: RoleSpecificData) => {
    onSubmit(data);
  };

  const renderForm = () => {
    switch (role) {
      case 'entrepreneur':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="secteurActivite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'activité *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tech">Technologie</SelectItem>
                      <SelectItem value="sante">Santé</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="energie">Énergie</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stadeDevloppement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stade de développement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre stade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idee">Idée</SelectItem>
                      <SelectItem value="prototype">Prototype</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="croissance">Croissance</SelectItem>
                      <SelectItem value="scale">Scale-up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rechercheFinancement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recherchez-vous un financement ? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="oui">Oui, activement</SelectItem>
                      <SelectItem value="peut-etre">Peut-être, je m'informe</SelectItem>
                      <SelectItem value="non">Non, pas pour le moment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="montantRecherche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant recherché (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 100 000 €" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez votre projet *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez brièvement votre projet entrepreneurial..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'investisseur':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="typeInvestissement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'investissement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="business-angel">Business Angel</SelectItem>
                      <SelectItem value="venture-capital">Venture Capital</SelectItem>
                      <SelectItem value="private-equity">Private Equity</SelectItem>
                      <SelectItem value="family-office">Family Office</SelectItem>
                      <SelectItem value="crowdfunding">Crowdfunding</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secteursInteret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteurs d'intérêt *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tech, Santé, FinTech..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketMoyen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket moyen d'investissement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre ticket" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5k-25k">5k - 25k €</SelectItem>
                      <SelectItem value="25k-100k">25k - 100k €</SelectItem>
                      <SelectItem value="100k-500k">100k - 500k €</SelectItem>
                      <SelectItem value="500k-1M">500k - 1M €</SelectItem>
                      <SelectItem value="1M+">1M+ €</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expérience en investissement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre expérience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant (0-2 ans)</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire (2-5 ans)</SelectItem>
                      <SelectItem value="experimente">Expérimenté (5-10 ans)</SelectItem>
                      <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez votre approche d'investissement *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre stratégie et critères d'investissement..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'startup':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nomStartup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la startup *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de votre startup" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stade de développement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre stade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="serie-a">Série A</SelectItem>
                      <SelectItem value="serie-b">Série B</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secteur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'activité *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tailleEquipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille de l'équipe *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la taille" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 personnes</SelectItem>
                      <SelectItem value="3-5">3-5 personnes</SelectItem>
                      <SelectItem value="6-10">6-10 personnes</SelectItem>
                      <SelectItem value="11-20">11-20 personnes</SelectItem>
                      <SelectItem value="20+">20+ personnes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rechercheActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recherche active *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Financement, Talents, Partenaires..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez votre startup *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre startup, votre mission et vos objectifs..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'organisation':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="typeOrganisation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'organisation *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ong">ONG</SelectItem>
                      <SelectItem value="institution">Institution publique</SelectItem>
                      <SelectItem value="gouvernement">Gouvernement</SelectItem>
                      <SelectItem value="incubateur">Incubateur</SelectItem>
                      <SelectItem value="accelerateur">Accélérateur</SelectItem>
                      <SelectItem value="fondation">Fondation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomOrganisation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'organisation *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de votre organisation" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secteurIntervention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'intervention *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Innovation, Développement économique..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programmes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programmes offerts *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Accompagnement, Subventions, Formation..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez votre organisation *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre mission et comment vous soutenez l'écosystème entrepreneurial..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'universite':
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nomEtablissement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'établissement *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de votre université/école" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ville de l'établissement" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Départements concernés *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Management, Ingénierie, Business..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programmesEntrepreneuriaux"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programmes entrepreneuriaux *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Incubateur étudiant, Cours d'entrepreneuriat..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez vos programmes *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez comment votre établissement soutient l'entrepreneuriat étudiant..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return <div>Rôle non reconnu</div>;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'entrepreneur': return 'Informations Entrepreneur';
      case 'investisseur': return 'Informations Investisseur';
      case 'startup': return 'Informations Startup';
      case 'organisation': return 'Informations Organisation';
      case 'universite': return 'Informations Université';
      default: return 'Informations spécifiques';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {getRoleTitle()}
        </h2>
        <p className="text-lg text-gray-600">
          Complétez les informations spécifiques à votre profil
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {renderForm()}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-8 py-3 rounded-xl"
            >
              Retour
            </Button>
            <Button
              type="submit"
              className="gradient-gold text-white font-semibold px-8 py-3 rounded-xl shadow-gold hover:shadow-lg transition-all duration-300"
            >
              Continuer
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RoleSpecificForms;
