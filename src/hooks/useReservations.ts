import { useState, useEffect } from 'react';
import { ReservationService } from '../services/api/reservationService';
import { Reservation } from '../types/entities';
import { useUser } from './useUser';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await ReservationService.getUserReservations(user.id);
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      await ReservationService.cancelReservation(reservationId);
      // Mettre à jour l'état local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: 'cancelled' as const }
            : res
        )
      );
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  };

  const createReservation = async (reservationData: {
    terrain_id: string;
    date: string;
    start_time: string;
    end_time: string;
    equipment_ids?: { equipment_id: string; quantity: number }[];
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {      const newReservation = await ReservationService.createReservation(reservationData);

      // Ajouter les équipements si nécessaire
      if (reservationData.equipment_ids && reservationData.equipment_ids.length > 0) {
        await ReservationService.createEquipmentReservations(
          newReservation.id,
          reservationData.equipment_ids
        );
      }

      // Actualiser la liste
      await fetchReservations();
      
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  };

  return {
    reservations,
    loading,
    refetch: fetchReservations,
    cancelReservation,
    createReservation,
  };
};
