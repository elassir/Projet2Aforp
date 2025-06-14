// Types pour les entités de l'application Centre Sportif - Adaptés au schéma SQL

export interface User {
  id?: string;
  user_email: string;
  email?: string;
  user_nom: string;
  user_prenom: string;
  user_mdp: string;
  user_role: 'admin' | 'client';
}

export interface Terrain {
  terrain_id: string;
  terrain_nom?: string; // Optionnel car pas dans CSV
  terrain_type: string;
  terrain_localisation: string;
  terrain_capacite: number;
  terrain_photo?: string;
  terrain_description?: string;
  terrain_tarif?: number; // Optionnel car pas dans CSV
  terrain_statut: 'disponible' | 'maintenance' | 'indisponible';
}

export interface Equipement {
  equipement_id: string;
  equipement_nom: string;
  equipement_type: string;
  equipement_description?: string;
  equipement_statut: 'disponible' | 'loue' | 'maintenance';
}

export interface Cours {
  cours_id: string;
  cours_description: string;
  cours_tarif: number;
  cours_duree: string;
  cours_nombre_max: number;
  cours_date: string;
  cours_nom: string;
  places_restantes?: number;
}

export interface Reservation {
  reservation_id: string;
  user_email: string;
  terrain_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
  terrain?: Terrain;
}

export interface ReservationEquipement {
  reservation_id: string;
  user_email: string;
  equipement_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
  equipement?: Equipement;
}

export interface ReservationCours {
  reservation_id?: string;
  user_email: string;
  cours_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

export interface ReservationTerrain {
  reservation_id?: string;
  user_email: string;
  terrain_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

// Types pour les formulaires
export interface CreateReservationTerrainData {
  user_email: string;
  terrain_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

export interface CreateReservationEquipementData {
  equipement_id: number;
  date_reservation: string;
  user_email?: string;
}

export interface CreateReservationCoursData {
  user_email: string;
  cours_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

// Types étendus avec relations
export interface ReservationTerrainWithDetails extends ReservationTerrain {
  terrain?: Terrain;
  user?: User;
}

export interface ReservationEquipementWithDetails extends ReservationEquipement {
  equipement?: Equipement;
  user?: User;
}

export interface ReservationCoursWithDetails extends ReservationCours {
  cours?: Cours;
  user?: User;
}
