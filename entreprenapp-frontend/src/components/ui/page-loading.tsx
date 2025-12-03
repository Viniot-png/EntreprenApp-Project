import React from 'react';

interface PageLoadingProps {
  message?: string;
}

const PageLoading = ({ message = "Chargement..." }: PageLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <img 
          src="/lovable-uploads/a08a9764-dc5c-46ad-bc00-d7ddc061222a.png" 
          alt="EA ENTREPRENAPP" 
          className="h-16 w-auto animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg animate-[slide-in-right_1s_ease-in-out_infinite]"></div>
      </div>
      <p className="text-muted-foreground animate-fade-in">{message}</p>
    </div>
  );
};

export default PageLoading;