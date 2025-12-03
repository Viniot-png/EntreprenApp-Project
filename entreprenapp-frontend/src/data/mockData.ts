import type { FrontendUser } from '@/lib/api/services';

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    title?: string;
  }[];
  externalLink?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockUsers: FrontendUser[] = [
  {
    id: '1',
    name: 'John Entrepreneur',
    email: 'john@example.com',
    role: 'entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop',
    bio: 'Passionate entrepreneur building the next big thing in tech.',
    location: 'San Francisco, CA',
    company: 'TechStartup Inc.',
    expertise: ['Technology', 'Business Development', 'AI'],
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Investor',
    email: 'sarah@venture.com',
    role: 'investor',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b602?w=150&h=150&fit=crop&crop=face',
    bio: 'Venture capitalist focused on early-stage tech companies.',
    location: 'New York, NY',
    company: 'Venture Capital Partners',
    expertise: ['Venture Capital', 'Fintech', 'SaaS'],
    joinedDate: '2024-02-20'
  },
  {
    id: '3',
    name: 'Mike Consultant',
    email: 'mike@consult.com',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    bio: 'Business consultant helping startups scale effectively.',
    location: 'London, UK',
    company: 'Strategic Solutions Ltd.',
    expertise: ['Strategy', 'Operations', 'Growth'],
    joinedDate: '2024-03-10'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    author: mockUsers[0],
    content: 'Excited to announce that we\'ve just closed our Series A funding round! 🚀 This milestone wouldn\'t have been possible without the incredible support of our team, advisors, and investors. We\'re now ready to scale our AI-powered platform to help more businesses automate their workflows.\n\nWhat\'s next? We\'re hiring across all departments and looking for passionate individuals who want to make a real impact. Drop me a message if you\'re interested!',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
        title: 'Team celebration'
      }
    ],
    likesCount: 42,
    commentsCount: 8,
    sharesCount: 5,
    isLiked: false,
    createdAt: '2024-08-16T10:30:00Z',
    updatedAt: '2024-08-16T10:30:00Z'
  },
  {
    id: '2',
    authorId: '2',
    author: mockUsers[1],
    content: 'The startup landscape is evolving rapidly. Here are 5 key trends I\'m watching in 2024:\n\n1. AI Integration in Traditional Industries\n2. Sustainable Tech Solutions\n3. Remote-First Company Models\n4. No-Code/Low-Code Platforms\n5. Decentralized Finance Innovation\n\nWhich trend do you think will have the biggest impact?',
    externalLink: {
      url: 'https://techcrunch.com/startup-trends-2024',
      title: 'Startup Trends Report 2024',
      description: 'Comprehensive analysis of emerging trends in the startup ecosystem',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop'
    },
    likesCount: 28,
    commentsCount: 12,
    sharesCount: 3,
    isLiked: true,
    createdAt: '2024-08-15T14:45:00Z',
    updatedAt: '2024-08-15T14:45:00Z'
  },
  {
    id: '3',
    authorId: '3',
    author: mockUsers[2],
    content: 'Just finished an incredible workshop on "Scaling Operations for High-Growth Startups" 📈\n\nKey takeaways:\n• Build systems before you need them\n• Culture scales harder than technology\n• Data-driven decisions > gut feelings\n• Invest in your team\'s growth\n\nThanks to everyone who attended! The energy and questions were amazing.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop',
        title: 'Workshop presentation'
      }
    ],
    likesCount: 35,
    commentsCount: 6,
    sharesCount: 8,
    isLiked: false,
    createdAt: '2024-08-14T16:20:00Z',
    updatedAt: '2024-08-14T16:20:00Z'
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    authorId: '2',
    author: mockUsers[1],
    content: 'Congratulations on the Series A! Your AI platform has incredible potential. Would love to discuss potential partnership opportunities.',
    likesCount: 5,
    isLiked: false,
    createdAt: '2024-08-16T11:15:00Z',
    updatedAt: '2024-08-16T11:15:00Z',
    replies: [
      {
        id: '2',
        postId: '1',
        authorId: '1',
        author: mockUsers[0],
        content: 'Thank you, Sarah! I\'d love to connect. Sending you a message now.',
        likesCount: 2,
        isLiked: true,
        createdAt: '2024-08-16T11:30:00Z',
        updatedAt: '2024-08-16T11:30:00Z'
      }
    ]
  },
  {
    id: '3',
    postId: '2',
    authorId: '3',
    author: mockUsers[2],
    content: 'Great insights! I think AI integration will be the biggest game-changer. The companies that adapt quickly will have a massive advantage.',
    likesCount: 8,
    isLiked: true,
    createdAt: '2024-08-15T15:30:00Z',
    updatedAt: '2024-08-15T15:30:00Z'
  }
];

// Nouvelles interfaces et données pour les fonctionnalités ajoutées
export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'mention' | 'job';
  content: string;
  actor?: User;
  read: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  name: string;
  avatar: string;
  role: string;
  connectedAt: string;
}

export interface SuggestedConnection extends User {
  reason: string;
}

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: mockUsers[1],
    lastMessage: 'Great! Let\'s schedule a meeting next week.',
    lastMessageAt: '2024-08-17T14:30:00Z',
    unreadCount: 2
  },
  {
    id: '2',
    participant: mockUsers[2],
    lastMessage: 'Thank you for the insights on scaling operations.',
    lastMessageAt: '2024-08-17T10:15:00Z',
    unreadCount: 0
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '2',
    content: 'Hi John! I saw your Series A announcement. Congratulations!',
    createdAt: '2024-08-17T14:00:00Z'
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '1',
    content: 'Thank you Sarah! It\'s been an incredible journey.',
    createdAt: '2024-08-17T14:15:00Z'
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '2',
    content: 'Great! Let\'s schedule a meeting next week.',
    createdAt: '2024-08-17T14:30:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    content: 'Sarah Investor a aimé votre publication',
    actor: mockUsers[1],
    read: false,
    createdAt: '2024-08-17T15:00:00Z'
  },
  {
    id: '2',
    type: 'comment',
    content: 'Mike Consultant a commenté votre publication',
    actor: mockUsers[2],
    read: false,
    createdAt: '2024-08-17T12:30:00Z'
  },
  {
    id: '3',
    type: 'connection',
    content: 'Nouvelle demande de connexion de Emily Johnson',
    actor: {
      id: '4',
      name: 'Emily Johnson',
      email: 'emily@example.com',
      role: 'mentor',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      joinedDate: '2024-08-15'
    },
    read: true,
    createdAt: '2024-08-16T09:00:00Z'
  }
];

export const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Sarah Investor',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b602?w=150&h=150&fit=crop&crop=face',
    role: 'investor',
    connectedAt: '2024-08-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mike Consultant',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    role: 'consultant',
    connectedAt: '2024-08-05T00:00:00Z'
  }
];

export const mockSuggestedConnections: SuggestedConnection[] = [
  {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced mentor helping startups navigate early growth challenges.',
    location: 'Austin, TX',
    company: 'Growth Accelerator',
    expertise: ['Mentoring', 'Product Development', 'Team Building'],
    joinedDate: '2024-08-15',
    reason: 'Travaille dans la même industrie'
  },
  {
    id: '5',
    name: 'David Chen',
    email: 'david@example.com',
    role: 'entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Serial entrepreneur with multiple successful exits in fintech.',
    location: 'San Francisco, CA',
    company: 'FinTech Innovations',
    expertise: ['Fintech', 'Blockchain', 'Fundraising'],
    joinedDate: '2024-08-12',
    reason: 'Connexions communes avec Sarah Investor'
  }
];