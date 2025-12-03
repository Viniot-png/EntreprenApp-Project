'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch, useSearchDebounce } from '@/hooks/useSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Users, FileText, Calendar, Trophy, Briefcase, Search, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link as RouterLink } from 'react-router-dom';

const RESULT_TYPES = [
  { key: 'users', label: 'Users', icon: Users, color: 'text-blue-500' },
  { key: 'posts', label: 'Posts', icon: FileText, color: 'text-green-500' },
  { key: 'events', label: 'Events', icon: Calendar, color: 'text-purple-500' },
  { key: 'challenges', label: 'Challenges', icon: Trophy, color: 'text-orange-500' },
  { key: 'projects', label: 'Projects', icon: Briefcase, color: 'text-pink-500' }
];

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';

  const { query, setQuery, debouncedQuery } = useSearchDebounce(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isEmpty } = useSearch(
    debouncedQuery,
    selectedType || undefined,
    10,
    currentPage * 10,
    !!debouncedQuery
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? '' : type);
    setCurrentPage(0);
  };

  const renderUserResult = (user: any) => (
    <RouterLink to={`/profile/${user._id}`} key={user._id} className="no-underline">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt={user.fullname}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{user.fullname}</h3>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              {user.bio && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{user.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </RouterLink>
  );

  const renderPostResult = (post: any) => (
    <RouterLink to={`/posts/${post._id}`} key={post._id} className="no-underline">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          {post.title && <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>}
          <p className="text-sm text-gray-600 line-clamp-3">{post.content || post.description}</p>
          {post.author && (
            <p className="text-xs text-gray-500 mt-3">By {post.author.fullname}</p>
          )}
        </CardContent>
      </Card>
    </RouterLink>
  );

  const renderEventResult = (event: any) => (
    <RouterLink to={`/events/${event._id}`} key={event._id} className="no-underline">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{event.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          {event.location && <p className="text-xs text-gray-500 mt-2">📍 {event.location}</p>}
          {event.startDate && (
            <p className="text-xs text-gray-500">📅 {new Date(event.startDate).toLocaleDateString()}</p>
          )}
        </CardContent>
      </Card>
    </RouterLink>
  );

  const renderChallengeResult = (challenge: any) => (
    <RouterLink to={`/challenges/${challenge._id}`} key={challenge._id} className="no-underline">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{challenge.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
          {challenge.category && <p className="text-xs text-gray-500 mt-2">🏷️ {challenge.category}</p>}
        </CardContent>
      </Card>
    </RouterLink>
  );

  const renderProjectResult = (project: any) => (
    <RouterLink to={`/projects/${project._id}`} key={project._id} className="no-underline">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{project.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          {project.category && <p className="text-xs text-gray-500 mt-2">🏷️ {project.category}</p>}
        </CardContent>
      </Card>
    </RouterLink>
  );

  const renderResultsByType = (type: string, results: any[], icon: React.ElementType, color: string) => {
    if (!results || results.length === 0) return null;

    const Icon = icon;
    let renderFn;

    switch (type) {
      case 'users':
        renderFn = renderUserResult;
        break;
      case 'posts':
        renderFn = renderPostResult;
        break;
      case 'events':
        renderFn = renderEventResult;
        break;
      case 'challenges':
        renderFn = renderChallengeResult;
        break;
      case 'projects':
        renderFn = renderProjectResult;
        break;
      default:
        return null;
    }

    return (
      <div key={type} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-6 h-6 ${color}`} />
          <h2 className="text-xl font-bold">
            {RESULT_TYPES.find(t => t.key === type)?.label} ({results.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(renderFn)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
            <Search className="w-8 h-8" />
            Search Results
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search posts, users, events, challenges, projects..."
              value={query}
              onChange={handleSearch}
              className="w-full h-12 text-lg"
              autoFocus
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Type Filters */}
        {query && (
          <div className="flex flex-wrap gap-2 mb-8">
            {RESULT_TYPES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleTypeFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedType === key
                    ? `${color} bg-opacity-10 border-2 border-current`
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Results or Empty State */}
        {!query ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter a search query (minimum 2 characters) to find posts, users, events, challenges, and projects.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
          </div>
        ) : isEmpty ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No results found for "{query}". Try different keywords or browse our categories.
            </AlertDescription>
          </Alert>
        ) : (
          <div>
            {/* Results Summary */}
            <p className="text-gray-600 mb-6">
              Found <strong>{data?.total}</strong> result{data?.total !== 1 ? 's' : ''} for "{query}"
            </p>

            {/* Render each type */}
            {RESULT_TYPES.map(({ key, label, icon, color }) => 
              renderResultsByType(
                key,
                data?.results[key as keyof typeof data.results] || [],
                icon,
                color
              )
            )}

            {/* Pagination */}
            {data && data.total > 10 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-6 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="px-6 py-2">
                  Page {currentPage + 1} of {Math.ceil(data.total / 10)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={(currentPage + 1) * 10 >= data.total}
                  className="px-6 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
