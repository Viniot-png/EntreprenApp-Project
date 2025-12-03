/**
 * Adaptateurs pour convertir les données utilisateur entre le format frontend et backend
 * 
 * Le backend utilise : fullname, username
 * Le frontend utilise parfois : name, firstName, lastName
 */

import type { User as BackendUser } from '../services/auth.service';

/**
 * Interface utilisateur pour le frontend (format unifié)
 */
export interface FrontendUser {
  id: string;
  _id?: string; // Pour compatibilité
  name: string; // Nom complet pour l'affichage
  fullname?: string; // Pour compatibilité avec le backend
  username?: string;
  email: string;
  role: string;
  avatar?: string;
  profileImage?: string | { url?: string };
  coverImage?: string | { url?: string };
  bio?: string;
  location?: string;
  gender?: string;
  dob?: string;
  isEmailVerified?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  joinedDate?: string;
  company?: string;
  expertise?: string[];
  // Champs pour le réseau (Network)
  status?: 'friend' | 'pending' | 'none';
  requestId?: string | null;
  requestDirection?: 'sent' | 'received' | null;
}

/**
 * Convertit un utilisateur du backend vers le format frontend
 */
export function backendToFrontendUser(backendUser: BackendUser | any): FrontendUser {
  // Gérer les images (peuvent être des objets avec url ou des strings)
  const profileImage = backendUser.profileImage 
    ? (typeof backendUser.profileImage === 'string' 
        ? backendUser.profileImage 
        : backendUser.profileImage.url || backendUser.profileImage)
    : undefined;
    
  const coverImage = backendUser.coverImage
    ? (typeof backendUser.coverImage === 'string'
        ? backendUser.coverImage
        : backendUser.coverImage.url || backendUser.coverImage)
    : undefined;

  return {
    id: backendUser._id || backendUser.id,
    _id: backendUser._id,
    name: backendUser.fullname || backendUser.name || '', // Utiliser fullname comme name
    fullname: backendUser.fullname,
    username: backendUser.username,
    email: backendUser.email,
    role: backendUser.role,
    avatar: profileImage, // Mapper profileImage vers avatar pour compatibilité
    profileImage: profileImage,
    coverImage: coverImage,
    bio: backendUser.bio,
    location: backendUser.location,
    gender: backendUser.gender,
    dob: backendUser.dob,
    isEmailVerified: backendUser.isEmailVerified || backendUser.isVerified,
    isVerified: backendUser.isVerified || backendUser.isEmailVerified,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    joinedDate: backendUser.createdAt || backendUser.joinedDate,
    // Champs pour le réseau
    status: backendUser.status || 'none',
    requestId: backendUser.requestId || null,
    requestDirection: backendUser.requestDirection || null,
  };
}

/**
 * Convertit les données d'inscription du frontend vers le format backend
 */
export interface FrontendRegisterData {
  firstName?: string;
  lastName?: string;
  name?: string;
  fullname?: string;
  username?: string;
  email: string;
  password: string;
  role: string;
  location?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  [key: string]: any;
}

export interface BackendRegisterData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role: string;
  location?: string;
  gender?: string;
  dob?: string;
  sector?: string;
  professionalEmail?: string;
  foundedYear?: number;
  universityName?: string;
  officialUniversityEmail?: string;
  verificationDocument?: File;
}

/**
 * Convertit les données d'inscription du frontend vers le format backend
 */
export function frontendToBackendRegisterData(
  frontendData: FrontendRegisterData
): BackendRegisterData {
  // Générer un username si non fourni (basé sur l'email ou le nom)
  let username = frontendData.username;
  if (!username) {
    if (frontendData.email) {
      username = frontendData.email.split('@')[0];
    } else if (frontendData.firstName) {
      username = `${frontendData.firstName}${frontendData.lastName || ''}`.toLowerCase().replace(/\s+/g, '');
    } else {
      username = `user_${Date.now()}`;
    }
  }

  // Construire le fullname
  let fullname = frontendData.fullname;
  if (!fullname) {
    if (frontendData.firstName && frontendData.lastName) {
      fullname = `${frontendData.firstName} ${frontendData.lastName}`;
    } else if (frontendData.name) {
      fullname = frontendData.name;
    } else {
      fullname = username; // Fallback
    }
  }

  // Extraire les données spécifiques au rôle
  const backendData: BackendRegisterData = {
    username,
    fullname,
    email: frontendData.email,
    password: frontendData.password,
    role: frontendData.role,
  };

  // Ajouter les champs optionnels
  if (frontendData.location) backendData.location = frontendData.location;
  if (frontendData.gender) backendData.gender = frontendData.gender;
  if (frontendData.dob) backendData.dob = frontendData.dob;
  if (frontendData.sector) backendData.sector = frontendData.sector;
  if (frontendData.professionalEmail) backendData.professionalEmail = frontendData.professionalEmail;
  if (frontendData.foundedYear) backendData.foundedYear = frontendData.foundedYear;
  if (frontendData.universityName) backendData.universityName = frontendData.universityName;
  if (frontendData.officialUniversityEmail) backendData.officialUniversityEmail = frontendData.officialUniversityEmail;
  if (frontendData.verificationDocument) backendData.verificationDocument = frontendData.verificationDocument;

  return backendData;
}

/**
 * Convertit les données de mise à jour de profil du frontend vers le format backend
 */
export interface FrontendUpdateProfileData {
  name?: string;
  fullname?: string;
  bio?: string;
  gender?: string;
  dob?: string;
  location?: string;
  profileImage?: File;
  coverImage?: File;
  [key: string]: any;
}

export interface BackendUpdateProfileData {
  fullname?: string;
  bio?: string;
  gender?: string;
  dob?: string;
  location?: string;
  profileImage?: File;
  coverImage?: File;
}

/**
 * Convertit les données de mise à jour de profil
 */
export function frontendToBackendUpdateProfileData(
  frontendData: FrontendUpdateProfileData
): BackendUpdateProfileData {
  const backendData: BackendUpdateProfileData = {};

  // Mapper name vers fullname
  if (frontendData.name && !frontendData.fullname) {
    backendData.fullname = frontendData.name;
  } else if (frontendData.fullname) {
    backendData.fullname = frontendData.fullname;
  }

  // Copier les autres champs directement
  if (frontendData.bio !== undefined) backendData.bio = frontendData.bio;
  if (frontendData.gender !== undefined) backendData.gender = frontendData.gender;
  if (frontendData.dob !== undefined) backendData.dob = frontendData.dob;
  if (frontendData.location !== undefined) backendData.location = frontendData.location;
  if (frontendData.profileImage) backendData.profileImage = frontendData.profileImage;
  if (frontendData.coverImage) backendData.coverImage = frontendData.coverImage;

  return backendData;
}

