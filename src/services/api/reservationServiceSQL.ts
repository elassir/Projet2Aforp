import { supabase } from '../../initSupabase';
import { 
  ReservationTerrain, 
  ReservationEquipement, 
  ReservationCours,
  ReservationTerrainWithDetails,
  ReservationEquipementWithDetails,
  ReservationCoursWithDetails,
  CreateReservationTerrainData,
  CreateReservationEquipementData
} from '../../types/entitiesSQL';

export class ReservationServiceSQL {
  
  // RÉSERVATIONS DE TERRAINS
  
  // Récupérer toutes les réservations de terrains d'un utilisateur
  static async getUserTerrainReservations(userEmail: string): Promise<ReservationTerrainWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_terrain')
      .select(`
        *,
        terrain:terrain_id(*)
      `)
      .eq('user_email', userEmail)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Créer une réservation de terrain
  static async createTerrainReservation(data: CreateReservationTerrainData): Promise<ReservationTerrain> {
    // Vérifier la disponibilité
    const { data: existing, error: checkError } = await supabase
      .from('reservation_terrain')
      .select('*')
      .eq('terrain_id', data.terrain_id)
      .eq('date_reservation', data.date_reservation)
      .in('reservation_statut', ['confirmee', 'en_attente']);

    if (checkError) throw checkError;
    
    if (existing && existing.length > 0) {
      throw new Error('Ce terrain est déjà réservé pour cette date');
    }

    const { data: reservation, error } = await supabase
      .from('reservation_terrain')
      .insert({
        ...data,
        reservation_statut: 'confirmee'
      })
      .select()
      .single();
    
    if (error) throw error;
    return reservation;
  }

  // Annuler une réservation de terrain
  static async cancelTerrainReservation(terrainId: string, userEmail: string): Promise<void> {
    const { error } = await supabase
      .from('reservation_terrain')
      .update({ reservation_statut: 'annulee' })
      .eq('terrain_id', terrainId)
      .eq('user_email', userEmail)
      .eq('reservation_statut', 'confirmee');
    
    if (error) throw error;
  }

  // RÉSERVATIONS D'ÉQUIPEMENTS
  
  // Récupérer toutes les réservations d'équipements d'un utilisateur
  static async getUserEquipementReservations(userEmail: string): Promise<ReservationEquipementWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_equipement')
      .select(`
        *,
        equipement:equipement_id(*)
      `)
      .eq('user_email', userEmail)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Créer une réservation d'équipement
  static async createEquipementReservation(data: CreateReservationEquipementData): Promise<ReservationEquipement> {
    // Vérifier la disponibilité
    const { data: existing, error: checkError } = await supabase
      .from('reservation_equipement')
      .select('*')
      .eq('equipement_id', data.equipement_id)
      .eq('date_reservation', data.date_reservation)
      .in('reservation_statut', ['confirmee', 'en_attente']);

    if (checkError) throw checkError;
    
    if (existing && existing.length > 0) {
      throw new Error('Cet équipement est déjà réservé pour cette date');
    }

    const { data: reservation, error } = await supabase
      .from('reservation_equipement')
      .insert({
        ...data,
        reservation_statut: 'confirmee'
      })
      .select()
      .single();
    
    if (error) throw error;
    return reservation;
  }
  // Annuler une réservation d'équipement
  static async cancelEquipementReservation(equipementId: string, userEmail: string): Promise<void> {
    const { error } = await supabase
      .from('reservation_equipement')
      .update({ reservation_statut: 'annulee' })
      .eq('equipement_id', equipementId)
      .eq('user_email', userEmail)
      .eq('reservation_statut', 'confirmee');
    
    if (error) throw error;
  }

  // RÉSERVATIONS DE COURS
  
  // Récupérer toutes les inscriptions aux cours d'un utilisateur
  static async getUserCoursReservations(userEmail: string): Promise<ReservationCoursWithDetails[]> {
    const { data, error } = await supabase
      .from('reservation_cours')
      .select(`
        *,
        cours:cours_id(*)
      `)
      .eq('user_email', userEmail)
      .order('date_reservation', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // DASHBOARD - Toutes les réservations d'un utilisateur
  static async getAllUserReservations(userEmail: string): Promise<{
    terrains: ReservationTerrainWithDetails[];
    equipements: ReservationEquipementWithDetails[];
    cours: ReservationCoursWithDetails[];
  }> {
    const [terrains, equipements, cours] = await Promise.all([
      this.getUserTerrainReservations(userEmail),
      this.getUserEquipementReservations(userEmail),
      this.getUserCoursReservations(userEmail)
    ]);

    return { terrains, equipements, cours };
  }

  // Statistiques des réservations pour l'admin
  static async getReservationStats(): Promise<{
    totalReservationsTerrains: number;
    totalReservationsEquipements: number;
    totalInscriptionsCours: number;
    reservationsEnAttente: number;
    reservationsConfirmees: number;
  }> {
    const [terrainsData, equipementsData, coursData] = await Promise.all([
      supabase.from('reservation_terrain').select('reservation_statut'),
      supabase.from('reservation_equipement').select('reservation_statut'),
      supabase.from('reservation_cours').select('reservation_statut')
    ]);

    if (terrainsData.error) throw terrainsData.error;
    if (equipementsData.error) throw equipementsData.error;
    if (coursData.error) throw coursData.error;

    const allReservations = [
      ...(terrainsData.data || []),
      ...(equipementsData.data || []),
      ...(coursData.data || [])
    ];

    return {
      totalReservationsTerrains: terrainsData.data?.length || 0,
      totalReservationsEquipements: equipementsData.data?.length || 0,
      totalInscriptionsCours: coursData.data?.length || 0,
      reservationsEnAttente: allReservations.filter(r => r.reservation_statut === 'en_attente').length,
      reservationsConfirmees: allReservations.filter(r => r.reservation_statut === 'confirmee').length
    };
  }

  // Récupérer les réservations récentes (pour le dashboard admin)
  static async getRecentReservations(limit: number = 10): Promise<{
    terrains: ReservationTerrainWithDetails[];
    equipements: ReservationEquipementWithDetails[];
    cours: ReservationCoursWithDetails[];
  }> {
    const [terrainsData, equipementsData, coursData] = await Promise.all([
      supabase
        .from('reservation_terrain')
        .select(`
          *,
          terrain:terrain_id(*),
          user:user_email(user_nom, user_prenom)
        `)
        .order('date_reservation', { ascending: false })
        .limit(limit),
      
      supabase
        .from('reservation_equipement')
        .select(`
          *,
          equipement:equipement_id(*),
          user:user_email(user_nom, user_prenom)
        `)
        .order('date_reservation', { ascending: false })
        .limit(limit),
      
      supabase
        .from('reservation_cours')
        .select(`
          *,
          cours:cours_id(*),
          user:user_email(user_nom, user_prenom)
        `)
        .order('date_reservation', { ascending: false })
        .limit(limit)
    ]);

    if (terrainsData.error) throw terrainsData.error;
    if (equipementsData.error) throw equipementsData.error;
    if (coursData.error) throw coursData.error;

    return {
      terrains: terrainsData.data || [],
      equipements: equipementsData.data || [],
      cours: coursData.data || []
    };
  }
}
