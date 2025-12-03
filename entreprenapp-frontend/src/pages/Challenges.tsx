import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { challengeService, Challenge, CreateChallengeData } from '@/lib/api/services/challenge.service';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Trophy, Users, Calendar, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageLoading from '@/components/ui/page-loading';

const Challenges = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateChallengeData>({
    title: '',
    description: '',
    sector: '',
    deadline: '',
    fundingAmount: 0,
  });

  // Queries
  const { data: allChallenges = [], isLoading: isLoadingChallenges, refetch: refetchChallenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const r = await challengeService.getChallenges();
      return r.data || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateChallengeData) => {
      return challengeService.createChallenge(data);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Défi créé avec succès',
      });
      setFormData({ title: '', description: '', sector: '', deadline: '', fundingAmount: 0 });
      setCreateDialogOpen(false);
      refetchChallenges();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le défi',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; data: Partial<CreateChallengeData> }) => {
      return challengeService.updateChallenge(data.id, data.data as any);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Défi modifié avec succès',
      });
      setEditingChallenge(null);
      setFormData({ title: '', description: '', sector: '', deadline: '', fundingAmount: 0 });
      refetchChallenges();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le défi',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return challengeService.deleteChallenge(challengeId);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Défi supprimé',
      });
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      refetchChallenges();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le défi',
        variant: 'destructive',
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return challengeService.applyToChallenge(challengeId);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Vous avez postulé au défi',
      });
      refetchChallenges();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de postuler',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erreur', description: 'Le titre est requis', variant: 'destructive' });
      return;
    }

    if (editingChallenge) {
      await updateMutation.mutateAsync({ id: editingChallenge._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const filteredChallenges = allChallenges.filter((challenge: any) => {
    return challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.sector?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const myChallenges = filteredChallenges.filter((c: any) => c.organisation?._id === user?._id);
  const appliedChallenges = filteredChallenges.filter((c: any) =>
    c.applicants?.some((app: any) => app._id === user?._id)
  );
  const activeChallenges = filteredChallenges.filter((c: any) => !c.applicants?.some((app: any) => app._id === user?._id));

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement des défis..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Défis</h1>
            <p className="text-muted-foreground">Participez à des défis entrepreneuriaux et remportez des prix</p>
          </div>
          {(user?.role === 'organisation' || user?.role === 'university') && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau Défi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingChallenge ? 'Modifier le défi' : 'Créer un nouveau défi'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre du défi</Label>
                    <Input
                      id="title"
                      placeholder="Nom du défi"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le défi et ses objectifs"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sector">Secteur</Label>
                      <Input
                        id="sector"
                        placeholder="ex: Tech, Santé"
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="deadline">Date limite</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fundingAmount">Montant du prix ($)</Label>
                    <Input
                      id="fundingAmount"
                      type="number"
                      placeholder="0"
                      value={formData.fundingAmount}
                      onChange={(e) => setFormData({ ...formData, fundingAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      setEditingChallenge(null);
                      setFormData({ title: '', description: '', sector: '', deadline: '', fundingAmount: 0 });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingChallenge ? 'Modifier' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des défis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Tous ({filteredChallenges.length})</TabsTrigger>
            <TabsTrigger value="active">Actifs ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="applied">Mes Postulations ({appliedChallenges.length})</TabsTrigger>
            {(user?.role === 'organisation' || user?.role === 'university') && (
              <TabsTrigger value="my">Mes Défis ({myChallenges.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredChallenges.length === 0 ? (
              <Card className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Aucun défi trouvé</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredChallenges.map((challenge: any) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    isOwner={challenge.organisation?._id === user?._id}
                    isApplied={challenge.applicants?.some((app: any) => app._id === user?._id)}
                    onApply={() => applyMutation.mutate(challenge._id)}
                    onEdit={() => {
                      setEditingChallenge(challenge);
                      setFormData({
                        title: challenge.title,
                        description: challenge.description,
                        sector: challenge.sector,
                        deadline: challenge.deadline,
                        fundingAmount: challenge.fundingAmount,
                      });
                      setCreateDialogOpen(true);
                    }}
                    onDelete={() => {
                      setDeleteTargetId(challenge._id);
                      setDeleteConfirmOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length === 0 ? (
              <Card className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Aucun défi actif</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeChallenges.map((challenge: any) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    isOwner={false}
                    isApplied={false}
                    onApply={() => applyMutation.mutate(challenge._id)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            {appliedChallenges.length === 0 ? (
              <Card className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Vous n'avez pas encore postulé</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appliedChallenges.map((challenge: any) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    isOwner={false}
                    isApplied={true}
                    onApply={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {(user?.role === 'organisation' || user?.role === 'university') && (
            <TabsContent value="my" className="space-y-4">
              {myChallenges.length === 0 ? (
                <Card className="text-center py-12">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé de défis</p>
                  <Button
                    onClick={() => {
                      setEditingChallenge(null);
                      setFormData({ title: '', description: '', sector: '', deadline: '', fundingAmount: 0 });
                      setCreateDialogOpen(true);
                    }}
                  >
                    Créer un défi
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {myChallenges.map((challenge: any) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      isOwner={true}
                      isApplied={false}
                      onApply={() => {}}
                      onEdit={() => {
                        setEditingChallenge(challenge);
                        setFormData({
                          title: challenge.title,
                          description: challenge.description,
                          sector: challenge.sector,
                          deadline: challenge.deadline,
                          fundingAmount: challenge.fundingAmount,
                        });
                        setCreateDialogOpen(true);
                      }}
                      onDelete={() => {
                        setDeleteTargetId(challenge._id);
                        setDeleteConfirmOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le défi?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le défi sera supprimé définitivement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => deleteTargetId && deleteMutation.mutate(deleteTargetId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

// ChallengeCard Component
const ChallengeCard = ({
  challenge,
  isOwner,
  isApplied,
  onApply,
  onEdit,
  onDelete,
}: {
  challenge: any;
  isOwner: boolean;
  isApplied: boolean;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const daysLeft = challenge.deadline ? 
    Math.ceil((new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground truncate mb-2">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground">{challenge.sector}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={onDelete} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground line-clamp-2">{challenge.description}</p>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="font-semibold">${challenge.fundingAmount}</p>
              <p className="text-xs text-muted-foreground">Prix</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-semibold">{daysLeft > 0 ? `${daysLeft}j` : 'Terminé'}</p>
              <p className="text-xs text-muted-foreground">Restant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-semibold">{challenge.applicants?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Postulants</p>
            </div>
          </div>
        </div>

        {/* Creator */}
        {challenge.organisation && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={typeof challenge.organisation.profileImage === 'string' ? challenge.organisation.profileImage : challenge.organisation.profileImage?.url} />
                <AvatarFallback>{challenge.organisation.fullname?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{challenge.organisation.fullname}</span>
            </div>
            {!isOwner && !isApplied && daysLeft > 0 && (
              <Button size="sm" onClick={onApply}>
                Postuler
              </Button>
            )}
            {isApplied && (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Postulé
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Challenges;
