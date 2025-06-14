import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../initSupabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Type pour l'utilisateur combiné (Auth + table personnalisée)
interface HybridUser {
  // Données de auth.users
  id: string;
  email: string;
  // Données de la table users personnalisée (structure actuelle)
  user_nom?: string;
  user_prenom?: string;
  user_role?: string;
}

type AuthHybridContextType = {
  user: HybridUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Alias pour loading
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, nom?: string, prenom?: string) => Promise<{ error: any }>;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Alias pour isLoggedIn
};

const AuthHybridContext = createContext<AuthHybridContextType | undefined>(undefined);

export const AuthProviderHybrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<HybridUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Fonction pour récupérer les données personnalisées de l'utilisateur
  const fetchUserProfile = async (authUserId: string, email: string): Promise<HybridUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_nom, user_prenom, user_role')
        .eq('user_email', email.toLowerCase())
        .single();

      if (error) {
        console.log('Aucun profil personnalisé trouvé, utilisation des données auth uniquement');
        
        // Essayer de créer un profil basique si l'utilisateur est connecté
        try {
          console.log('Tentative de création d\'un profil basique...');
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              user_email: email.toLowerCase(),
              user_role: 'user',
            });
            
          if (!insertError) {
            console.log('Profil basique créé avec succès');
            return {
              id: authUserId,
              email: email,
              user_role: 'user',
            };
          } else {
            console.log('Impossible de créer le profil basique:', insertError.message);
          }
        } catch (insertError) {
          console.log('Erreur lors de la création du profil basique:', insertError);
        }
        
        return {
          id: authUserId,
          email: email,
        };
      }

      return {
        id: authUserId,
        email: email,
        user_nom: data.user_nom,
        user_prenom: data.user_prenom,
        user_role: data.user_role,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return {
        id: authUserId,
        email: email,
      };
    }
  };

  // Vérifier la session au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier s'il y a une session active
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        }

        if (session?.user) {
          const hybridUser = await fetchUserProfile(session.user.id, session.user.email!);
          setSession(session);
          setUser(hybridUser);
          setIsLoggedIn(true);
          console.log('Session restaurée pour:', session.user.email);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état auth:', event);
        
        if (session?.user) {
          const hybridUser = await fetchUserProfile(session.user.id, session.user.email!);
          setSession(session);
          setUser(hybridUser);
          setIsLoggedIn(true);
        } else {
          setSession(null);
          setUser(null);
          setIsLoggedIn(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de connexion utilisant l'Auth Supabase
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentative de connexion avec:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error('Erreur de connexion:', error.message);
        return { error };
      }

      if (data.user) {
        const hybridUser = await fetchUserProfile(data.user.id, data.user.email!);
        setSession(data.session);
        setUser(hybridUser);
        setIsLoggedIn(true);
        console.log('Connexion réussie:', data.user.email);
      }

      return { error: null };
      
    } catch (error: any) {
      console.error('Erreur inattendue lors de la connexion:', error);
      return { error: { message: 'Erreur de connexion' } };
    } finally {
      setLoading(false);
    }
  };
  // Fonction d'inscription
  const register = async (email: string, password: string, nom?: string, prenom?: string) => {
    try {
      setLoading(true);
      console.log('Tentative d\'inscription avec:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error('Erreur d\'inscription:', error.message);
        return { error };
      }

      // Si l'inscription réussit et que nous avons un utilisateur
      if (data.user && nom && prenom) {
        try {
          // Attendre un peu pour que l'utilisateur soit bien créé côté auth
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Création du profil personnalisé...');
          
          // Essayer de créer le profil avec plusieurs tentatives
          let profileCreated = false;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (!profileCreated && attempts < maxAttempts) {
            attempts++;
            console.log(`Tentative ${attempts}/${maxAttempts} de création du profil...`);
            
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                user_email: email.trim().toLowerCase(),
                user_nom: nom,
                user_prenom: prenom,
                user_role: 'user', // Rôle par défaut
              });

            if (!profileError) {
              profileCreated = true;
              console.log('Profil personnalisé créé avec succès');
            } else {
              console.log(`Tentative ${attempts} échouée:`, profileError.message);
              
              // Si c'est un problème de RLS, attendre un peu plus
              if (profileError.code === '42501') {
                await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                // Pour d'autres erreurs, arrêter les tentatives
                break;
              }
            }
          }
          
          if (!profileCreated) {
            console.warn('Impossible de créer le profil personnalisé. L\'utilisateur pourra le créer plus tard.');
          }
          
        } catch (profileError) {
          console.error('Erreur inattendue lors de la création du profil:', profileError);
          // Ne pas faire échouer l'inscription pour autant
        }
      }

      console.log('Inscription réussie:', data.user?.email);
      return { error: null };
      
    } catch (error: any) {
      console.error('Erreur inattendue lors de l\'inscription:', error);
      return { error: { message: 'Erreur d\'inscription' } };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
      
      setUser(null);
      setSession(null);
      setIsLoggedIn(false);
      
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthHybridContextType = {
    user,
    session,
    loading,
    isLoading: loading, // Alias
    login,
    logout,
    register,
    isLoggedIn,
    isAuthenticated: isLoggedIn, // Alias
  };

  return (
    <AuthHybridContext.Provider value={contextValue}>
      {children}
    </AuthHybridContext.Provider>
  );
};

export const useAuthHybrid = () => {
  const context = useContext(AuthHybridContext);
  if (context === undefined) {
    throw new Error('useAuthHybrid must be used within an AuthProviderHybrid');
  }
  return context;
};
