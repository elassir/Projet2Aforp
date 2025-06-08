import { useState, useEffect } from 'react';
import { useAuth } from '../provider/AuthProvider';
import { supabase } from '../initSupabase';
import { User } from '../types/entities';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    updateUserProfile,
    refetch: fetchUserProfile,
  };
};
