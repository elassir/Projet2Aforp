import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'votre-url-supabase';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'votre-clé-anonyme';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false, // Désactivé car on gère notre propre auth
      persistSession: false,   // Désactivé car on gère notre propre session
      detectSessionInUrl: false,
    },
  }
);

// Fonction utilitaire pour tester la connexion
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }
    
    console.log('Connexion Supabase OK, nombre d\'utilisateurs:', data);
    return true;
  } catch (error) {
    console.error('Erreur de test Supabase:', error);
    return false;
  }
};
