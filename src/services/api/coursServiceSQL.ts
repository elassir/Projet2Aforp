import { supabase } from '../../initSupabase';
import { Cours, ReservationCours, ReservationCoursWithDetails, CreateReservationCoursData } from '../../types/entitiesSQL';

export class CoursServiceSQL {
  
  // Récupérer tous les cours
  static async getAllCours(): Promise<Cours[]> {
    const { data, error } = await supabase
      .from('cours')
      .select('*')
      .order('cours_date');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un cours par ID
  static async getCoursById(id: string): Promise<Cours | null> {
    const { data, error } = await supabase
      .from('cours')
      .select('*')
      .eq('cours_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Récupérer les cours disponibles (avec places libres)
  static async getAvailableCours(): Promise<Cours[]> {
    const { data: cours, error } = await supabase
      .from('cours')
      .select('*')
      .order('cours_date');
    
    if (error) throw error;
    
    // Pour chaque cours, vérifier le nombre d'inscrits
    const coursWithAvailability = [];
    
    for (const c of cours || []) {
      const { data: inscriptions, error: inscriptionError } = await supabase
        .from('reservation_cours')
        .select('*')
        .eq('cours_id', c.cours_id)
        .eq('reservation_statut', 'confirmee');
      
      if (inscriptionError) throw inscriptionError;
      
      const nombreInscrits = inscriptions?.length || 0;
      if (nombreInscrits < c.cours_nombre_max) {
        coursWithAvailability.push({
          ...c,
          places_restantes: c.cours_nombre_max - nombreInscrits
        });
      }
    }
    
    return coursWithAvailability;
  }

  // S'inscrire à un cours
  static async enrollInCours(coursId: string, userEmail: string): Promise<ReservationCours> {
    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const { data: existingEnrollment } = await supabase
      .from('reservation_cours')
      .select('*')
      .eq('user_email', userEmail)
      .eq('cours_id', coursId)
      .eq('reservation_statut', 'confirmee')
      .single();

    if (existingEnrollment) {
      throw new Error('Vous êtes déjà inscrit à ce cours');
    }

    // Vérifier s'il y a encore de la place
    const cours = await this.getCoursById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé');
    }
    
    const { data: inscriptions, error: countError } = await supabase
      .from('reservation_cours')
      .select('*')
      .eq('cours_id', coursId)
      .eq('reservation_statut', 'confirmee');
    
    if (countError) throw countError;
    
    const nombreInscrits = inscriptions?.length || 0;
    if (nombreInscrits >= cours.cours_nombre_max) {
      throw new Error('Ce cours est complet');
    }

    // Créer l'inscription
    const enrollmentData: ReservationCours = {
      user_email: userEmail,
      cours_id: coursId,
      date_reservation: new Date().toISOString().split('T')[0],
      reservation_statut: 'confirmee'
    };

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('reservation_cours')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    return enrollment;
  }

  // Récupérer les inscriptions d'un utilisateur
  static async getUserEnrollments(userEmail: string): Promise<ReservationCoursWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_cours')
      .select(`
        *,
        cours:cours_id(*),
        user:user_email(*)
      `)
      .eq('user_email', userEmail)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Annuler une inscription
  static async cancelEnrollment(coursId: string, userEmail: string): Promise<void> {
    const { error } = await supabase
      .from('reservation_cours')
      .update({ reservation_statut: 'annulee' })
      .eq('cours_id', coursId)
      .eq('user_email', userEmail);
    
    if (error) throw error;
  }

  // Vérifier si un utilisateur est inscrit à un cours
  static async getUserCoursEnrollment(coursId: string, userEmail: string): Promise<ReservationCours | null> {
    const { data, error } = await supabase
      .from('reservation_cours')
      .select('*')
      .eq('cours_id', coursId)
      .eq('user_email', userEmail)
      .eq('reservation_statut', 'confirmee')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Obtenir les statistiques des cours
  static async getCoursStats(): Promise<{
    totalCours: number;
    coursDisponibles: number;
    totalInscriptions: number;
    tauxOccupation: number;
  }> {
    // Stats des cours
    const { data: cours, error: coursError } = await supabase
      .from('cours')
      .select('cours_id, cours_nombre_max');
    
    if (coursError) throw coursError;
    
    // Stats des inscriptions
    const { data: inscriptions, error: inscriptionError } = await supabase
      .from('reservation_cours')
      .select('cours_id')
      .eq('reservation_statut', 'confirmee');
    
    if (inscriptionError) throw inscriptionError;
    
    const totalCours = cours.length;
    const totalPlaces = cours.reduce((sum, c) => sum + c.cours_nombre_max, 0);
    const totalInscriptions = inscriptions.length;
    const tauxOccupation = totalPlaces > 0 ? (totalInscriptions / totalPlaces) * 100 : 0;
    
    // Calculer les cours disponibles
    let coursDisponibles = 0;
    for (const c of cours) {
      const inscriptionsForCours = inscriptions.filter(i => i.cours_id === c.cours_id).length;
      if (inscriptionsForCours < c.cours_nombre_max) {
        coursDisponibles++;
      }
    }
    
    return {
      totalCours,
      coursDisponibles,
      totalInscriptions,
      tauxOccupation: Math.round(tauxOccupation)
    };
  }
}
