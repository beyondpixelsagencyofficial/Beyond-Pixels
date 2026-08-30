import React, { createContext, useContext, useState, useEffect } from 'react';
import { CMSContent } from '../types';
import { useAuth } from './AuthContext';

interface CMSContextType {
  cms: CMSContent | null;
  isLoading: boolean;
  error: string | null;
  updateCMS: (newContent: Partial<CMSContent>) => Promise<boolean>;
  refreshCMS: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCMS = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cms');
      if (!res.ok) throw new Error('Failed to fetch CMS content');
      const text = await res.text();
      const data = JSON.parse(text);
      setCms(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching CMS:', err);
      setError(err.message || 'Error loading CMS content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const updateCMS = async (newContent: Partial<CMSContent>): Promise<boolean> => {
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(newContent)
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update CMS');
      }

      if (data.cms) {
        setCms(data.cms);
      } else {
        await fetchCMS();
      }
      return true;
    } catch (err: any) {
      console.error('Failed to update CMS:', err);
      setError(err.message || 'Failed to save changes');
      return false;
    }
  };

  return (
    <CMSContext.Provider
      value={{
        cms,
        isLoading,
        error,
        updateCMS,
        refreshCMS: fetchCMS
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
