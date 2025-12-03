/**
 * Export centralisé de tous les services API
 */
export { authService } from './auth.service';
export { postService } from './post.service';
export { messageService } from './message.service';
export { friendService } from './friend.service';
export { eventService } from './event.service';
export { commentService } from './comment.service';
export { projectService } from './project.service';
export { challengeService } from './challenge.service';
export { bookmarkService } from './bookmark.service';

export type {
  RegisterData,
  LoginData,
  User,
  AuthResponse,
  FrontendUser,
} from './auth.service';

// Réexporter les adaptateurs
export {
  backendToFrontendUser,
  frontendToBackendRegisterData,
  frontendToBackendUpdateProfileData,
} from '../utils/userAdapter';

export type {
  FrontendRegisterData,
  FrontendUpdateProfileData,
} from '../utils/userAdapter';

export type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostsResponse,
  PostResponse,
  LikeResponse,
} from './post.service';

export type {
  Message,
  SendMessageData,
  MessageResponse,
} from './message.service';

export type {
  Friend,
  FriendRequest,
  FriendsResponse,
  FriendRequestsResponse,
  SendFriendRequestData,
  RespondToRequestData,
} from './friend.service';

export type {
  Event,
  CreateEventData,
  UpdateEventData,
  EventsResponse,
  EventResponse,
  RegisterEventResponse,
} from './event.service';

export type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentResponse,
  CommentsResponse,
} from './comment.service';

export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectsResponse,
  ProjectResponse,
  InvestInProjectData,
  InvestInProjectResponse,
} from './project.service';

export type {
  Challenge,
  CreateChallengeData,
  UpdateChallengeData,
  ChallengesResponse,
  ChallengeResponse,
  ApplyToChallengeResponse,
  SelectApplicantResponse,
} from './challenge.service';

// Réexporter les adaptateurs de données
export {
  backendToFrontendPost,
  backendToFrontendMessage,
  backendToFrontendComment,
  frontendToBackendPostData,
} from '../utils/dataAdapters';

export type {
  FrontendPost,
  FrontendMessage,
  FrontendComment,
} from '../utils/dataAdapters';

