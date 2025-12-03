import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EventCard from '@/components/EventCard';
import { eventService } from '@/lib/api/services/event.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', paymentMethod: 'bank_card' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('No event id');
      const res = await eventService.getEventById(id);
      return res.data;
    },
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No event selected');
      return eventService.registerToEvent(id, form);
    },
    onSuccess: () => {
      toast({ title: 'Inscription réussie', description: 'Vous êtes inscrit à l\'événement.' });
      setOpen(false);
      refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message || 'Impossible de s\'inscrire', variant: 'destructive' });
    }
  });

  if (isLoading) return <DashboardLayout><div className="p-8">Chargement...</div></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="p-8">Événement introuvable</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <EventCard event={data} onRegister={() => setOpen(true)} showActions={false} />

          {/* Registration dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>S'inscrire à l'événement</DialogTitle>
              </DialogHeader>
              <DialogDescription>Veuillez fournir vos informations pour finaliser l'inscription.</DialogDescription>

              <div className="space-y-3">
                <div>
                  <Label>Nom</Label>
                  <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Méthode de paiement</Label>
                  <Select onValueChange={(v) => setForm(prev => ({ ...prev, paymentMethod: v }))} value={form.paymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_card">Carte bancaire</SelectItem>
                      <SelectItem value="mobile_money">Mobile money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isLoading}>S'inscrire</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDetails;
