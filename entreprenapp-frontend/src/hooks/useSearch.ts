import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface SearchResult {
  _id: string;
  title?: string;
  name?: string;
  fullname?: string;
  username?: string;
  description?: string;
  content?: string;
  email?: string;
  profileImage?: string;
  image?: string;
  createdAt?: string;
  startDate?: string;
  author?: {
    _id: string;
    fullname: string;
    username?: string;
  };
  organizer?: {
    _id: string;
    fullname: string;
  };
  creator?: {
    _id: string;
    fullname: string;
  };
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: {
    posts: SearchResult[];
    users: SearchResult[];
    events: SearchResult[];
    challenges: SearchResult[];
    projects: SearchResult[];
  };
  count: {
    posts: number;
    users: number;
    events: number;
    challenges: number;
    projects: number;
  };
  total: number;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: {
    users: SearchResult[];
    posts: SearchResult[];
    events: SearchResult[];
  };
}

/**
 * Hook para hacer búsqueda global en la aplicación
 * 
 * @param query - Texto a buscar (mínimo 2 caracteres)
 * @param type - Filtrar por tipo: 'posts', 'users', 'events', 'challenges', 'projects'
 * @param limit - Resultados por página (máx 50, default 10)
 * @param offset - Offset para paginación
 * @param enabled - Si la búsqueda está habilitada (default true)
 * 
 * @returns { data, isLoading, error, refetch }
 * 
 * @example
 * const { data, isLoading } = useSearch('javascript', 'posts', 10, 0);
 * if (isLoading) return <Spinner />;
 * return data?.results.posts.map(post => <PostCard key={post._id} post={post} />);
 */
export const useSearch = (
  query: string,
  type?: string,
  limit: number = 10,
  offset: number = 0,
  enabled: boolean = true
) => {
  const isValidQuery = query && query.trim().length >= 2;

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: ['search', query, type, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString(),
        offset: offset.toString(),
        ...(type && { type })
      });

      const response = await apiClient.get(`/search?${params.toString()}`);
      return response.data;
    },
    enabled: enabled && isValidQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: 1,
    retryDelay: 1000
  });

  return {
    data: data || null,
    isLoading: isLoading && isValidQuery,
    error,
    refetch,
    isEmpty: data && data.total === 0,
    hasResults: data && data.total > 0
  };
};

/**
 * Hook para obtener sugerencias de búsqueda (autocomplete)
 * 
 * @param query - Texto a buscar (mínimo 2 caracteres)
 * @param limit - Número máximo de sugerencias (default 5)
 * @param enabled - Si está habilitado (default true)
 * 
 * @returns { suggestions, isLoading, error }
 * 
 * @example
 * const { suggestions, isLoading } = useSearchSuggestions('tech');
 * return (
 *   <div>
 *     {suggestions?.suggestions.users.map(user => (
 *       <UserItem key={user._id} user={user} />
 *     ))}
 *   </div>
 * );
 */
export const useSearchSuggestions = (
  query: string,
  limit: number = 5,
  enabled: boolean = true
) => {
  const isValidQuery = query && query.trim().length >= 2;

  const { data, isLoading, error } = useQuery<SuggestionsResponse>({
    queryKey: ['search-suggestions', query, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`/search/suggestions?${params.toString()}`);
      return response.data;
    },
    enabled: enabled && isValidQuery,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  return {
    suggestions: data?.suggestions || { users: [], posts: [], events: [] },
    isLoading: isLoading && isValidQuery,
    error,
    hasResults: data && (data.suggestions.users.length > 0 || data.suggestions.posts.length > 0 || data.suggestions.events.length > 0)
  };
};

/**
 * Hook para gestionar estado de búsqueda con debounce
 * 
 * @param initialQuery - Query inicial (default '')
 * @param debounceMs - Milisegundos de debounce (default 300)
 * 
 * @returns { query, setQuery, debouncedQuery, isDebouncing }
 * 
 * @example
 * const { debouncedQuery, setQuery } = useSearchDebounce();
 * const { data } = useSearch(debouncedQuery);
 * 
 * return (
 *   <input 
 *     onChange={(e) => setQuery(e.target.value)} 
 *     placeholder="Search..."
 *   />
 * );
 */
export const useSearchDebounce = (initialQuery: string = '', debounceMs: number = 300) => {
  const [query, setQuery] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setIsDebouncing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsDebouncing(false);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isDebouncing
  };
};
