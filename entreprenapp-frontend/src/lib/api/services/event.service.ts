import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Event {
  _id: string;
  id?: string;
  title: string;
  description: string;
  seats: number;
  startDate: string;
  endDate: string;
  location: string;
  image?: { url: string; publicId?: string };
  category?: string;
  price?: number;
  currency?: 'USD' | 'EUR' | 'XOF';
  paymentMethods?: ('mobile_money' | 'bank_card')[];
  isPaid?: boolean;
  status?: string;
  registrations?: any[];
  participantsCount?: number;
  organizer?: {
    _id: string;
    fullname: string;
    email: string;
    profileImage?: { url: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  seats?: number;
  startDate: string;
  endDate: string;
  location: string;
  price?: number;
  isPaid?: boolean;
  category?: string;
  currency?: 'USD' | 'EUR' | 'XOF';
  paymentMethods?: ('mobile_money' | 'bank_card')[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  seats?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
  price?: number;
  isPaid?: boolean;
  category?: string;
  currency?: 'USD' | 'EUR' | 'XOF';
  paymentMethods?: ('mobile_money' | 'bank_card')[];
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
}

export interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

export interface RegisterEventResponse {
  success: boolean;
  message: string;
  data: Event;
}

export const eventService = {
  /**
   * Obtenir tous les événements
   */
  async getEvents(): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(API_ENDPOINTS.EVENTS.BASE);
  },

  /**
   * Obtenir un événement par son ID
   */
  async getEventById(id: string): Promise<EventResponse> {
    return apiClient.get<EventResponse>(`${API_ENDPOINTS.EVENTS.BASE}/${id}`);
  },

  /**
   * Créer un nouvel événement avec images (jusqu'à 4)
   */
  async createEvent(data: CreateEventData, images?: File[]): Promise<EventResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    formData.append('location', data.location);
    if (data.seats) formData.append('seats', data.seats.toString());
    if (data.price) formData.append('price', data.price.toString());
    if (data.isPaid) formData.append('isPaid', data.isPaid.toString());
    if (data.category) formData.append('category', data.category);
    if (data.currency) formData.append('currency', data.currency);
    if (data.paymentMethods) {
      data.paymentMethods.forEach(method => {
        formData.append('paymentMethods', method);
      });
    }
    
    // Ajouter l'image (une seule) - champ 'media' pour correspondre au backend
    if (images && images.length > 0) {
      formData.append('media', images[0]); // Seulement le premier fichier
    }

    return apiClient.post<EventResponse>(`${API_ENDPOINTS.EVENTS.BASE}/create-event-with-image`, formData);
  },

  /**
   * Mettre à jour un événement
   */
  async updateEvent(id: string, data: UpdateEventData, images?: File[]): Promise<EventResponse> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.location) formData.append('location', data.location);
    if (data.seats !== undefined) formData.append('seats', data.seats?.toString() || '');
    if (data.price !== undefined) formData.append('price', data.price?.toString() || '');
    if (data.isPaid !== undefined) formData.append('isPaid', data.isPaid?.toString() || 'false');
    if (data.category) formData.append('category', data.category);
    if (data.currency) formData.append('currency', data.currency);
    if (data.paymentMethods) {
      data.paymentMethods.forEach(method => {
        formData.append('paymentMethods', method);
      });
    }
    
    // Ajouter l'image si fournie (une seule) - champ 'media'
    if (images && images.length > 0) {
      formData.append('media', images[0]); // Seulement le premier fichier
    }

    // PUT to the standard update route (the backend accepts files via multipart on PUT /api/event/:id)
    return apiClient.put<EventResponse>(`${API_ENDPOINTS.EVENTS.BASE}/${id}`, formData);
  },

  /**
   * S'inscrire à un événement
   */
  async registerToEvent(eventId: string, registrationData?: { name: string; email: string; paymentMethod?: string }): Promise<RegisterEventResponse> {
    // Backend expects POST /:id/register
    return apiClient.post<RegisterEventResponse>(
      `${API_ENDPOINTS.EVENTS.BASE}/${eventId}/register`,
      registrationData || {}
    );
  },

  /**
   * Annuler l'inscription
   */
  async unregisterFromEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.EVENTS.BASE}/${eventId}/unregister`
    );
  },

  /**
   * Obtenir les inscriptions d'un événement
   */
  async getEventRegistrations(eventId: string): Promise<{ success: boolean; data: any[] }> {
    return apiClient.get<{ success: boolean; data: any[] }>(
      `${API_ENDPOINTS.EVENTS.BASE}/${eventId}/registrations`
    );
  },

  /**
   * Obtenir mes événements créés
   */
  async getMyEvents(): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${API_ENDPOINTS.EVENTS.BASE}/user/my-events`);
  },

  /**
   * Obtenir mes inscriptions
   */
  async getMyRegistrations(): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${API_ENDPOINTS.EVENTS.BASE}/user/my-registrations`);
  },

  /**
   * Supprimer un événement
   */
  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.EVENTS.BASE}/${id}`
    );
  }
};

