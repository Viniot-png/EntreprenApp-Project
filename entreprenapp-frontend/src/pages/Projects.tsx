import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { projectService, CreateProjectData, Project } from '@/lib/api/services/project.service';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Search, Filter, Trash2, Edit2, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageLoading from '@/components/ui/page-loading';

const Projects = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    sector: '',
    stage: 'Idea',
    fundingGoal: 0,
  });

  // Queries
  const { data: allProjects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const r = await projectService.getProjects();
      return r.data || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      return projectService.createProject(data);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Projet créé avec succès',
      });
      setFormData({ title: '', description: '', sector: '', stage: 'Idea', fundingGoal: 0 });
      setCreateDialogOpen(false);
      refetchProjects();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le projet',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; data: Partial<CreateProjectData> }) => {
      return projectService.updateProject(data.id, data.data as any);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Projet modifié avec succès',
      });
      setEditingProject(null);
      setFormData({ title: '', description: '', sector: '', stage: 'Idea', fundingGoal: 0 });
      refetchProjects();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le projet',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return projectService.deleteProject(projectId);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Projet supprimé',
      });
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      refetchProjects();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le projet',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erreur', description: 'Le titre est requis', variant: 'destructive' });
      return;
    }

    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const filteredProjects = allProjects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.sector?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'all' || project.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const myProjects = filteredProjects.filter((p: any) => p.creator?._id === user?._id);
  const investedProjects = filteredProjects.filter((p: any) => p.investors?.some((inv: any) => inv._id === user?._id));

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement des projets..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projets</h1>
            <p className="text-muted-foreground">Découvrez et gérez les projets entrepreneuriaux</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Projet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Modifier le projet' : 'Créer un nouveau projet'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du projet</Label>
                  <Input
                    id="title"
                    placeholder="Nom du projet"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet"
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
                      placeholder="ex: Technologie, Santé"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stage">Stade</Label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Idea">Idée</SelectItem>
                        <SelectItem value="MVP">MVP</SelectItem>
                        <SelectItem value="Prototype">Prototype</SelectItem>
                        <SelectItem value="Launch">Lancement</SelectItem>
                        <SelectItem value="Growth">Croissance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fundingGoal">Objectif de financement ($)</Label>
                  <Input
                    id="fundingGoal"
                    type="number"
                    placeholder="0"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: Number(e.target.value) })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingProject(null);
                    setFormData({ title: '', description: '', sector: '', stage: 'Idea', fundingGoal: 0 });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des projets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stades</SelectItem>
              <SelectItem value="Idea">Idée</SelectItem>
              <SelectItem value="MVP">MVP</SelectItem>
              <SelectItem value="Prototype">Prototype</SelectItem>
              <SelectItem value="Launch">Lancement</SelectItem>
              <SelectItem value="Growth">Croissance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Tous ({filteredProjects.length})</TabsTrigger>
            <TabsTrigger value="my">Mes Projets ({myProjects.length})</TabsTrigger>
            <TabsTrigger value="invested">Investissements ({investedProjects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Aucun projet trouvé</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProjects.map((project: any) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isOwner={project.creator?._id === user?._id}
                    onEdit={() => {
                      setEditingProject(project);
                      setFormData({
                        title: project.title,
                        description: project.description,
                        sector: project.sector,
                        stage: project.stage,
                        fundingGoal: project.fundingGoal,
                      });
                      setCreateDialogOpen(true);
                    }}
                    onDelete={() => {
                      setDeleteTargetId(project._id);
                      setDeleteConfirmOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4">
            {myProjects.length === 0 ? (
              <Card className="text-center py-12">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore de projets</p>
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setFormData({ title: '', description: '', sector: '', stage: 'Idea', fundingGoal: 0 });
                    setCreateDialogOpen(true);
                  }}
                >
                  Créer un projet
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myProjects.map((project: any) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isOwner={true}
                    onEdit={() => {
                      setEditingProject(project);
                      setFormData({
                        title: project.title,
                        description: project.description,
                        sector: project.sector,
                        stage: project.stage,
                        fundingGoal: project.fundingGoal,
                      });
                      setCreateDialogOpen(true);
                    }}
                    onDelete={() => {
                      setDeleteTargetId(project._id);
                      setDeleteConfirmOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invested" className="space-y-4">
            {investedProjects.length === 0 ? (
              <Card className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Vous n'avez pas investi dans de projets</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {investedProjects.map((project: any) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isOwner={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le projet?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le projet sera supprimé définitivement.
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

// ProjectCard Component
const ProjectCard = ({
  project,
  isOwner,
  onEdit,
  onDelete,
}: {
  project: any;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const fundingPercentage = project.fundingGoal ? (project.raisedAmount / project.fundingGoal) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground truncate">{project.title}</h3>
              <Badge variant="secondary">{project.stage}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{project.sector}</p>
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
        <p className="text-sm text-foreground line-clamp-2">{project.description}</p>

        {/* Funding Progress */}
        {project.fundingGoal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">${project.raisedAmount || 0} levés</span>
              <span className="text-muted-foreground">${project.fundingGoal} objectif</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(fundingPercentage)}% financé</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{project.investors?.length || 0} investisseurs</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>{project.createdAt && new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Creator */}
        {project.creator && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={typeof project.creator.profileImage === 'string' ? project.creator.profileImage : project.creator.profileImage?.url} />
              <AvatarFallback>{project.creator.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">par {project.creator.fullname}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Projects;
