import { supabase } from '../../initSupabase';
import { Terrain, Reservation, AvailabilityData, CreateReservationData } from '../../types/entities';

export class TerrainService {
  
  // Récupérer tous les terrains actifs
  static async getAllTerrains(): Promise<Terrain[]> {
    const { data, error } = await supabase
      .from('terrains')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un terrain par ID
  static async getTerrainById(id: string): Promise<Terrain | null> {
    const { data, error } = await supabase
      .from('terrains')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Vérifier la disponibilité d'un terrain pour une date donnée
  static async getTerrainAvailability(terrainId: string, date: string): Promise<AvailabilityData> {
    // Récupérer les réservations existantes pour ce terrain et cette date
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('terrain_id', terrainId)
      .eq('date', date)
      .eq('status', 'confirmed');

    if (error) throw error;

    // Générer les créneaux de 8h à 22h par tranches d'1h
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Vérifier si ce créneau est déjà réservé
      const isReserved = reservations?.some(reservation => {
        const reservationStart = reservation.start_time;
        const reservationEnd = reservation.end_time;
        return (startTime >= reservationStart && startTime < reservationEnd) ||
               (endTime > reservationStart && endTime <= reservationEnd);
      });

      slots.push({
        start_time: startTime,
        end_time: endTime,
        is_available: !isReserved
      });
    }

    return {
      date,
      terrain_id: terrainId,
      slots
    };
  }  // Créer une nouvelle réservation
  static async createReservation(data: CreateReservationData): Promise<Reservation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');

    // Calculer le montant total
    const terrain = await this.getTerrainById(data.terrain_id);
    if (!terrain) throw new Error('Terrain non trouvé');

    const startHour = parseInt(data.start_time.split(':')[0]);
    const endHour = parseInt(data.end_time.split(':')[0]);
    const duration = endHour - startHour;
    const totalAmount = terrain.hourly_rate * duration;

    const reservationData = {
      user_id: user.id,
      terrain_id: data.terrain_id,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      total_amount: totalAmount,
      status: 'confirmed'
    };

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) throw error;

    // Si des équipements sont demandés, les ajouter
    if (data.equipment_ids && data.equipment_ids.length > 0) {
      await this.addEquipmentToReservation(reservation.id, data.equipment_ids);
    }

    return reservation;
  }

  // Ajouter des équipements à une réservation
  static async addEquipmentToReservation(
    reservationId: string, 
    equipments: { equipment_id: string; quantity: number }[]
  ) {
    const equipmentReservations = [];
    
    for (const equipment of equipments) {
      // Récupérer les infos de l'équipement pour le prix
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('daily_rate')
        .eq('id', equipment.equipment_id)
        .single();

      if (equipmentError) throw equipmentError;

      equipmentReservations.push({
        reservation_id: reservationId,
        equipment_id: equipment.equipment_id,
        quantity: equipment.quantity,
        daily_rate: equipmentData.daily_rate,
        total_amount: equipmentData.daily_rate * equipment.quantity
      });
    }

    const { error } = await supabase
      .from('equipment_reservations')
      .insert(equipmentReservations);

    if (error) throw error;
  }  // Récupérer les réservations d'un utilisateur
  static async getUserReservations(): Promise<Reservation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        terrains (name, type),
        equipment_reservations (
          *,
          equipment (name, type)
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Annuler une réservation
  static async cancelReservation(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);

    if (error) throw error;
  }
}
