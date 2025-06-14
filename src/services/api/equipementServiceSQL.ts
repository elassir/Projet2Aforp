import { supabase } from '../../initSupabase';
import { Equipement, ReservationEquipement, ReservationEquipementWithDetails, CreateReservationEquipementData } from '../../types/entitiesSQL';

export class EquipementServiceSQL {
  
  // Récupérer tous les équipements
  static async getAllEquipements(): Promise<Equipement[]> {
    const { data, error } = await supabase
      .from('equipement')
      .select('*')
      .order('equipement_nom');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un équipement par ID
  static async getEquipementById(id: number): Promise<Equipement | null> {
    const { data, error } = await supabase
      .from('equipement')
      .select('*')
      .eq('equipement_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Récupérer les équipements disponibles
  static async getAvailableEquipements(): Promise<Equipement[]> {
    const { data, error } = await supabase
      .from('equipement')
      .select('*')
      .eq('equipement_statut', 'disponible')
      .order('equipement_nom');
    
    if (error) throw error;
    return data || [];
  }

  // Vérifier la disponibilité d'un équipement pour une date
  static async checkEquipementAvailability(equipementId: number, date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reservation_equipement')
      .select('*')
      .eq('equipement_id', equipementId)
      .eq('date_reservation', date)
      .in('reservation_statut', ['confirmee', 'en_attente']);

    if (error) throw error;
    return data.length === 0;
  }

  // Créer une réservation d'équipement
  static async createReservation(reservationData: CreateReservationEquipementData): Promise<ReservationEquipement> {
    // Vérifier la disponibilité
    const isAvailable = await this.checkEquipementAvailability(
      reservationData.equipement_id, 
      reservationData.date_reservation
    );
    
    if (!isAvailable) {
      throw new Error('Cet équipement n\'est pas disponible pour cette date');
    }

    const { data, error } = await supabase
      .from('reservation_equipement')
      .insert({
        ...reservationData,
        reservation_statut: 'confirmee'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Récupérer les réservations d'un utilisateur
  static async getUserReservations(userEmail: string): Promise<ReservationEquipementWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_equipement')
      .select(`
        *,
        equipement:equipement_id(*),
        user:user_email(*)
      `)
      .eq('user_email', userEmail)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer toutes les réservations d'un équipement
  static async getEquipementReservations(equipementId: number): Promise<ReservationEquipementWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_equipement')
      .select(`
        *,
        equipement:equipement_id(*),
        user:user_email(*)
      `)
      .eq('equipement_id', equipementId)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Annuler une réservation
  static async cancelReservation(equipementId: number, userEmail: string): Promise<void> {
    const { error } = await supabase
      .from('reservation_equipement')
      .update({ reservation_statut: 'annulee' })
      .eq('equipement_id', equipementId)
      .eq('user_email', userEmail);
    
    if (error) throw error;
  }

  // Obtenir les statistiques des équipements
  static async getEquipementStats(): Promise<{
    totalEquipements: number;
    equipementsDisponibles: number;
    equipementsMaintenance: number;
    reservationsActives: number;
  }> {
    // Stats des équipements
    const { data: equipements, error: equipementError } = await supabase
      .from('equipement')
      .select('equipement_statut');
    
    if (equipementError) throw equipementError;
    
    // Stats des réservations
    const { data: reservations, error: reservationError } = await supabase
      .from('reservation_equipement')
      .select('reservation_statut')
      .in('reservation_statut', ['confirmee', 'en_attente']);
    
    if (reservationError) throw reservationError;
    
    const totalEquipements = equipements.length;
    const equipementsDisponibles = equipements.filter(e => e.equipement_statut === 'disponible').length;
    const equipementsMaintenance = equipements.filter(e => e.equipement_statut === 'maintenance').length;
    const reservationsActives = reservations.length;
    
    return {
      totalEquipements,
      equipementsDisponibles,
      equipementsMaintenance,
      reservationsActives
    };
  }

  // Rechercher des équipements par nom
  static async searchEquipements(searchTerm: string): Promise<Equipement[]> {
    const { data, error } = await supabase
      .from('equipement')
      .select('*')
      .ilike('equipement_nom', `%${searchTerm}%`)
      .eq('equipement_statut', 'disponible')
      .order('equipement_nom');
    
    if (error) throw error;
    return data || [];
  }
}
