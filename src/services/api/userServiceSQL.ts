import { supabase } from '../../initSupabase';
import { User } from '../../types/entitiesSQL';

export class UserServiceSQL {
  
  // Récupérer tous les utilisateurs
  static async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('user_nom');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un utilisateur par email
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Pas trouvé
      throw error;
    }
    return data;
  }

  // Authentifier un utilisateur
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      console.log('Tentative d\'authentification pour:', email);
      
      // Rechercher l'utilisateur dans votre table personnalisée
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_email', email)
        .single();

      if (userError) {
        console.error('Erreur lors de la recherche de l\'utilisateur:', userError);
        return null;
      }

      if (!userData) {
        console.log('Utilisateur non trouvé');
        return null;
      }

      // Vérifier le mot de passe (vous devrez adapter cette logique selon votre stockage)
      // Pour cet exemple, je suppose que vous stockez le mot de passe en clair
      // EN PRODUCTION, utilisez TOUJOURS des mots de passe hachés !
      if (userData.user_password !== password) {
        console.log('Mot de passe incorrect');
        return null;
      }

      console.log('Authentification réussie pour:', userData.user_email);
      
      // Retourner l'utilisateur sans le mot de passe
      const { user_password, ...userWithoutPassword } = userData;
      return userWithoutPassword as User;
      
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      return null;
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: Omit<User, 'user_email'> & { user_email: string }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Mettre à jour un utilisateur
  static async updateUser(email: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_email', email)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Supprimer un utilisateur
  static async deleteUser(email: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_email', email);
    
    if (error) throw error;
  }

  // Obtenir les statistiques utilisateur
  static async getUserStats(): Promise<{
    totalUsers: number;
    totalClients: number;
    totalAdmins: number;
  }> {
    const { data, error } = await supabase
      .from('users')
      .select('user_role');
    
    if (error) throw error;
    
    const totalUsers = data.length;
    const totalClients = data.filter(u => u.user_role === 'client').length;
    const totalAdmins = data.filter(u => u.user_role === 'admin').length;
    
    return {
      totalUsers,
      totalClients,
      totalAdmins
    };
  }

  static async getUserById(userId: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
}
