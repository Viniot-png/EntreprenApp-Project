import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventService, Event, CreateEventData } from '@/lib/api/services/event.service';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  X,
  Image as ImageIcon,
  Edit2,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const Events = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  // Dialog states
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Form states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventFormData, setEventFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    seats: 0,
    price: 0,
    isPaid: false,
    category: 'other',
    currency: 'EUR',
    paymentMethods: [] as any,
  });
  // Support for single image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    paymentMethod: 'bank_card',
  });

  // Queries
  const { data: allEvents = [], isLoading: isLoadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const r = await eventService.getEvents();
      return r.data || [];
    },
    enabled: !loading,
  });

  const { data: myEvents = [], refetch: refetchMyEvents } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      if (!user) return [];
      const r = await eventService.getMyEvents();
      return r.data || [];
    },
    enabled: !loading && !!user,
  });

  const { data: myRegistrations = [], refetch: refetchMyRegistrations } = useQuery({
    queryKey: ['myRegistrations'],
    queryFn: async () => {
      if (!user) return [];
      const r = await eventService.getMyRegistrations();
      return r.data || [];
    },
    enabled: !loading && !!user,
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!eventFormData.title || !eventFormData.startDate || !eventFormData.endDate || !eventFormData.location) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      // Pass selected file (if any)
      return eventService.createEvent(eventFormData, selectedImage ? [selectedImage] : undefined);
    },
    onSuccess: (response: any) => {
      // Log the created event for debugging image availability
      try { console.debug('createEvent response', response?.data); } catch (e) {}
      toast({ title: 'Événement créé !', description: 'L\'événement a été créé avec succès.' });
      setCreateEventOpen(false);
      resetEventForm();
      refetchEvents();
      refetchMyEvents();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'événement',
        variant: 'destructive',
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) throw new Error('Aucun événement sélectionné');
      return eventService.updateEvent(selectedEvent._id, eventFormData, selectedImage ? [selectedImage] : undefined);
    },
    onSuccess: (response: any) => {
      try { console.debug('updateEvent response', response?.data); } catch (e) {}
      toast({ title: 'Événement modifié !', description: 'L\'événement a été mis à jour.' });
      setEditEventOpen(false);
      resetEventForm();
      refetchEvents();
      refetchMyEvents();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier l\'événement',
        variant: 'destructive',
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) throw new Error('Aucun événement sélectionné');
      return eventService.deleteEvent(selectedEvent._id);
    },
    onSuccess: () => {
      toast({ title: 'Événement supprimé !', description: 'L\'événement a été supprimé.' });
      setDeleteConfirmOpen(false);
      setSelectedEvent(null);
      refetchEvents();
      refetchMyEvents();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'événement',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) throw new Error('Aucun événement sélectionné');
      return eventService.registerToEvent(selectedEvent._id, registrationData);
    },
    onSuccess: () => {
      toast({ title: 'Inscription confirmée !', description: 'Vous êtes inscrit à l\'événement.' });
      setRegisterModalOpen(false);
      setRegistrationData({ name: '', email: '', paymentMethod: 'bank_card' });
      refetchEvents();
      refetchMyRegistrations();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de s\'inscrire',
        variant: 'destructive',
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return eventService.unregisterFromEvent(eventId);
    },
    onSuccess: () => {
      toast({ title: 'Désinscription confirmée !', description: 'Vous êtes désinscrit de l\'événement.' });
      refetchEvents();
      refetchMyRegistrations();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de se désinscrire',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetEventForm = () => {
    setEventFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      seats: 0,
      price: 0,
      isPaid: false,
      category: 'other',
    });
    setSelectedImage(null);
    setImagePreview('');
    setSelectedEvent(null);
  };

  // helper for image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openCreateDialog = () => {
    resetEventForm();
    setCreateEventOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      location: event.location,
      seats: event.seats || 0,
      price: event.price || 0,
      isPaid: event.isPaid || false,
      category: event.category || 'other',
    });
    if (event.image && event.image.url) {
      setImagePreview(event.image.url);
      setSelectedImage(null); // Reset file, keep preview for display
    }
    setEditEventOpen(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setDeleteConfirmOpen(true);
  };

  const openRegisterModal = (event: Event) => {
    setSelectedEvent(event);
    setRegistrationData({
      name: user?.fullname || '',
      email: user?.email || '',
      paymentMethod: 'bank_card',
    });
    setRegisterModalOpen(true);
  };

  // Filter and search
  const getFilteredEvents = (events: Event[]) => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    return filtered;
  };

  const isEventPast = (event: Event) => {
    return new Date(event.endDate) < new Date();
  };

  const isEventUpcoming = (event: Event) => {
    return new Date(event.startDate) >= new Date();
  };

  const isUserRegistered = (event: Event) => {
    return myRegistrations.some((reg) => reg._id === event._id);
  };

  const isEventCreatedByUser = (event: Event) => {
    return user && event.organizer?._id === user._id;
  };

  const upcomingEvents = getFilteredEvents(allEvents.filter(isEventUpcoming));
  const pastEvents = getFilteredEvents(allEvents.filter(isEventPast));

  // Use shared EventCard component from components/EventCard.tsx for consistent multi-image display

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center h-screen">Chargement...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Événements</h1>
            <p className="text-gray-600 mt-1">Découvrez et gérez les événements</p>
          </div>
          <Button onClick={openCreateDialog} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Créer un événement
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="w-10 h-10 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="w-10 h-10 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Search and filter */}
          <div className="ml-auto flex gap-2">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rechercher un événement</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Titre, description, lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Fermer</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtrer les événements</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="education">Éducation</SelectItem>
                        <SelectItem value="sport">Sport</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lieu</Label>
                    <Input
                      placeholder="Ex: Paris, Lyon..."
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Fermer</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
            {user && <TabsTrigger value="my-events">Mes événements</TabsTrigger>}
            {user && <TabsTrigger value="my-registrations">Mes inscriptions</TabsTrigger>}
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="mt-6">
            {isLoadingEvents ? (
              <div className="text-center py-12">Chargement des événements...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Aucun événement à venir</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {upcomingEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event}
                    onRegister={() => {
                      setSelectedEvent(event);
                      setRegisterModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="mt-6">
            {pastEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Aucun événement passé</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {pastEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Events */}
          {user && (
            <TabsContent value="my-events" className="mt-6">
              {myEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Vous n'avez pas créé d'événements</div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                  {myEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event}
                      showActions={true}
                      onEdit={() => {
                        setSelectedEvent(event);
                        setEventFormData({
                          title: event.title,
                          description: event.description,
                          startDate: event.startDate,
                          endDate: event.endDate,
                          location: event.location,
                          seats: event.seats || 0,
                          price: event.price || 0,
                          isPaid: event.isPaid || false,
                          category: event.category || 'other',
                          currency: event.currency as any,
                          paymentMethods: event.paymentMethods as any,
                        });
                        setEditEventOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedEvent(event);
                        setDeleteConfirmOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* My Registrations */}
          {user && (
            <TabsContent value="my-registrations" className="mt-6">
              {myRegistrations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Vous n'êtes inscrit à aucun événement</div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                  {myRegistrations.map((event) => (
                    <div key={event._id} className="relative">
                      <EventCard event={event} />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => unregisterMutation.mutate(event._id)}
                          disabled={unregisterMutation.isPending}
                        >
                          Se désinscrire
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Create/Edit Event Dialog */}
        <Dialog open={createEventOpen || editEventOpen} onOpenChange={(open) => {
          if (!open) {
            resetEventForm();
            setCreateEventOpen(false);
            setEditEventOpen(false);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editEventOpen ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    placeholder="Titre de l'événement"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={eventFormData.category}
                    onValueChange={(value) => setEventFormData({ ...eventFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Description détaillée de l'événement"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Lieu *</Label>
                  <Input
                    id="location"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    placeholder="Lieu de l'événement"
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Nombre de places</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="0"
                    value={eventFormData.seats}
                    onChange={(e) => setEventFormData({ ...eventFormData, seats: parseInt(e.target.value) || 0 })}
                    placeholder="0 = illimité"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={eventFormData.isPaid}
                    onChange={(e) => setEventFormData({ ...eventFormData, isPaid: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPaid" className="mb-0 cursor-pointer">
                    Événement payant
                  </Label>
                </div>
                {eventFormData.isPaid && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="price">Prix</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={eventFormData.price}
                        onChange={(e) => setEventFormData({ ...eventFormData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select
                        value={eventFormData.currency}
                        onValueChange={(value) => setEventFormData({ ...eventFormData, currency: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">$ Dollar</SelectItem>
                          <SelectItem value="EUR">€ Euro</SelectItem>
                          <SelectItem value="XOF">CFA Franc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {eventFormData.isPaid && (
                <div>
                  <Label>Modes de paiement acceptés</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mobile_money"
                        checked={(eventFormData.paymentMethods || []).includes('mobile_money')}
                        onChange={(e) => {
                          const methods = eventFormData.paymentMethods || [];
                          if (e.target.checked) {
                            setEventFormData({ ...eventFormData, paymentMethods: [...methods, 'mobile_money'] as any });
                          } else {
                            setEventFormData({ ...eventFormData, paymentMethods: methods.filter(m => m !== 'mobile_money') as any });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="mobile_money" className="mb-0 cursor-pointer">Mobile Money</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="bank_card"
                        checked={(eventFormData.paymentMethods || []).includes('bank_card')}
                        onChange={(e) => {
                          const methods = eventFormData.paymentMethods || [];
                          if (e.target.checked) {
                            setEventFormData({ ...eventFormData, paymentMethods: [...methods, 'bank_card'] as any });
                          } else {
                            setEventFormData({ ...eventFormData, paymentMethods: methods.filter(m => m !== 'bank_card') as any });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="bank_card" className="mb-0 cursor-pointer">Carte Bancaire</Label>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="image">Photo de l'événement</Label>
                <div className="border-2 border-dashed rounded-lg p-4 mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer h-40 hover:bg-accent/50 rounded transition">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 text-center">Cliquez pour sélectionner une photo</span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedImage(file);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setImagePreview(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetEventForm();
                  setCreateEventOpen(false);
                  setEditEventOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => (editEventOpen ? updateEventMutation.mutate() : createEventMutation.mutate())}
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
              >
                {editEventOpen ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Register Modal */}
        <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>S'inscrire à l'événement</DialogTitle>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded">
                  <h3 className="font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.location}</p>
                </div>

                <div>
                  <Label htmlFor="reg-name">Nom complet *</Label>
                  <Input
                    id="reg-name"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    placeholder="Votre email"
                  />
                </div>

                {selectedEvent.isPaid && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm font-semibold text-blue-900">
                        Montant: {selectedEvent.price}€
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="payment-method">Mode de paiement</Label>
                      <Select
                        value={registrationData.paymentMethod}
                        onValueChange={(value) =>
                          setRegistrationData({ ...registrationData, paymentMethod: value })
                        }
                      >
                        <SelectTrigger id="payment-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_card">Carte bancaire</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="transfer">Virement bancaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setRegisterModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending}
                  >
                    Confirmer l'inscription
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer "{selectedEvent?.title}" ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEventMutation.mutate()}
                disabled={deleteEventMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Events;