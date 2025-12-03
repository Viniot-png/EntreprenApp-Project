/**
 * Utilitaires d'optimisation de performance
 */

import React from 'react';

/**
 * Fonction pour débouncer un callback
 * Utile pour limiter les appels répétés (ex: recherche, scroll)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Fonction pour throttle un callback
 * Utile pour limiter la fréquence des appels (ex: scroll handler)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Créer une version memoïzée d'une fonction
 * Utile pour des calculs coûteux basés sur les props
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Observer d'intersection pour le lazy loading
 */
export const createIntersectionObserver = (
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(
    ([entry]) => {
      callback(entry.isIntersecting);
    },
    {
      threshold: 0.1,
      ...options,
    }
  );
};

/**
 * Hook pour utiliser l'intersection observer
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) => {
  React.useEffect(() => {
    const observer = createIntersectionObserver(callback, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [callback, options, ref]);
};
