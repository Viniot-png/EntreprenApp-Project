import apiClient from '../client';

export interface UserProfile {
  user: {
    _id: string;
    fullname: string;
    username: string;
    email: string;
    role: string;
    profileImage: string;
    bio?: string;
    expertise?: string[];
  };
  events: Array<{
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    image?: string;
    organizer: string;
    participants: string[];
  }>;
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    image?: string;
    status: string;
    category: string;
    creator: string;
    members: string[];
  }>;
  posts: Array<{
    _id: string;
    content: string;
    image?: string;
    likes: string[];
    comments: number;
    createdAt: string;
  }>;
}

export const userProfileService = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      console.log(`[userProfileService] Fetching profile for userId: ${userId}`);
      
      const response = await apiClient.get(`/api/suggestions/profile/${userId}`);
      console.log(`[userProfileService] Response received:`, response);
      
      if (!response) {
        throw new Error('Pas de réponse du serveur');
      }

      if (!response.data) {
        throw new Error('response.data est null/undefined');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur serveur');
      }

      if (!response.data.data) {
        console.warn('[userProfileService] response.data.data is null, returning empty profile');
        // Return minimal valid profile instead of throwing
        return {
          user: {
            _id: userId,
            fullname: 'Utilisateur',
            username: 'unknown',
            email: 'unknown@example.com',
            role: 'member',
            profileImage: '',
          },
          events: [],
          projects: [],
          posts: []
        };
      }

      const profileData = response.data.data;
      
      // Ensure all required fields exist
      const validProfile: UserProfile = {
        user: {
          _id: profileData.user?._id || userId,
          fullname: profileData.user?.fullname || 'Utilisateur',
          username: profileData.user?.username || 'unknown',
          email: profileData.user?.email || 'unknown@example.com',
          role: profileData.user?.role || 'member',
          profileImage: profileData.user?.profileImage || '',
          bio: profileData.user?.bio,
          expertise: profileData.user?.expertise,
        },
        events: profileData.events || [],
        projects: profileData.projects || [],
        posts: profileData.posts || []
      };

      console.log('[userProfileService] Returning profile:', validProfile);
      return validProfile;
    } catch (error: any) {
      console.error('[userProfileService] Error:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Impossible de charger le profil');
    }
  }
};
