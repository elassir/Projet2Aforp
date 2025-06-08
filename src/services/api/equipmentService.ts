import { supabase } from '../../initSupabase';
import { Equipment } from '../../types/entities';

export class EquipmentService {
  
  // Récupérer tous les équipements actifs
  static async getAllEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un équipement par ID
  static async getEquipmentById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
  // Récupérer les équipements disponibles
  static async getAvailableEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true)
      .gt('quantity', 0)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer les équipements par type
  static async getEquipmentByType(type: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
  // Vérifier la disponibilité d'un équipement pour une quantité donnée
  static async checkEquipmentAvailability(equipmentId: string, quantity: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('equipment')
      .select('quantity')
      .eq('id', equipmentId)
      .single();
    
    if (error) throw error;
    return data?.quantity >= quantity;
  }
}
