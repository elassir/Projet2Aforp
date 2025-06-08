import { supabase } from '../../initSupabase';
import { Reservation, CreateReservationData } from '../../types/entities';

export class ReservationService {
  
  // Récupérer toutes les réservations d'un utilisateur
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        terrain:terrains(*),
        user:users(*)
      `)      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer une réservation par ID
  static async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        terrain:terrains(*),
        user:users(*),
        equipment_reservations:equipment_reservations(
          quantity,
          equipment:equipment(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Créer une nouvelle réservation
  static async createReservation(reservationData: CreateReservationData): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Créer des réservations d'équipement associées
  static async createEquipmentReservations(
    reservationId: string, 
    equipmentItems: { equipment_id: string; quantity: number }[]
  ): Promise<void> {
    if (equipmentItems.length === 0) return;

    const equipmentReservations = equipmentItems.map(item => ({
      reservation_id: reservationId,
      equipment_id: item.equipment_id,
      quantity: item.quantity
    }));

    const { error } = await supabase
      .from('equipment_reservations')
      .insert(equipmentReservations);
    
    if (error) throw error;
  }

  // Annuler une réservation
  static async cancelReservation(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId);
    
    if (error) throw error;
  }

  // Vérifier la disponibilité d'un terrain
  static async checkTerrainAvailability(
    terrainId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> {    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('terrain_id', terrainId)
      .eq('date', date)
      .neq('status', 'cancelled')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);
    
    if (error) throw error;
    return (data || []).length === 0;
  }

  // Récupérer les créneaux disponibles pour un terrain à une date donnée
  static async getAvailableTimeSlots(terrainId: string, date: string): Promise<string[]> {    const { data, error } = await supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('terrain_id', terrainId)
      .eq('date', date)
      .neq('status', 'cancelled');
    
    if (error) throw error;

    // Créer tous les créneaux possibles (par exemple de 8h à 22h)
    const allSlots: string[] = [];
    for (let hour = 8; hour < 22; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Filtrer les créneaux occupés
    const reservedTimes = data || [];
    const availableSlots = allSlots.filter(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      return !reservedTimes.some(reservation => {
        const startHour = parseInt(reservation.start_time.split(':')[0]);
        const endHour = parseInt(reservation.end_time.split(':')[0]);
        return slotHour >= startHour && slotHour < endHour;
      });
    });

    return availableSlots;
  }

  // Calculer le prix total d'une réservation
  static async calculateReservationPrice(
    terrainId: string,
    duration: number, // en heures
    equipmentItems: { equipment_id: string; quantity: number }[]
  ): Promise<number> {
    // Prix du terrain
    const { data: terrain, error: terrainError } = await supabase
      .from('terrains')
      .select('hourly_rate')
      .eq('id', terrainId)
      .single();
    
    if (terrainError) throw terrainError;
    
    let totalPrice = terrain.hourly_rate * duration;

    // Prix des équipements
    if (equipmentItems.length > 0) {
      const equipmentIds = equipmentItems.map(item => item.equipment_id);
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, rental_price')
        .in('id', equipmentIds);
      
      if (equipmentError) throw equipmentError;

      equipment?.forEach(eq => {
        const item = equipmentItems.find(item => item.equipment_id === eq.id);
        if (item) {
          totalPrice += eq.rental_price * item.quantity;
        }
      });
    }

    return totalPrice;
  }
}
