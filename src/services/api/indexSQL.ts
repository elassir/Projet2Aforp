// Index des services SQL pour l'application Centre Sportif
// Ces services utilisent le schéma SQL avec les noms de colonnes français

export { UserServiceSQL } from './userServiceSQL';
export { TerrainServiceSQL } from './terrainServiceSQL';
export { EquipementServiceSQL } from './equipementServiceSQL';
export { CoursServiceSQL } from './coursServiceSQL';
export { ReservationServiceSQL } from './reservationServiceSQL';

// Types SQL réutilisés localement
interface User {
  id?: string;
  user_email: string;
  email?: string;
  user_nom: string;
  user_prenom: string;
  user_mdp: string;
  user_role: 'admin' | 'client';
}

interface Terrain {
  terrain_id: string;
  terrain_nom?: string;
  terrain_type: string;
  terrain_localisation: string;
  terrain_capacite: number;
  terrain_photo?: string;
  terrain_description?: string;
  terrain_tarif?: number;
  terrain_statut: 'disponible' | 'maintenance' | 'indisponible';
}

interface Equipement {
  equipement_id: string;
  equipement_nom: string;
  equipement_type: string;
  equipement_statut: 'disponible' | 'loue' | 'maintenance';
}

interface Cours {
  cours_id: string;
  cours_description: string;
  cours_tarif: number;
  cours_duree: string;
  cours_nombre_max: number;
  cours_date: string;
  cours_nom: string;
  places_restantes?: number;
}

interface ReservationTerrain {
  reservation_id?: string;
  user_email: string;
  terrain_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

interface ReservationEquipement {
  reservation_id: string;
  user_email: string;
  equipement_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
  equipement?: Equipement;
}

interface ReservationCours {
  reservation_id?: string;
  user_email: string;
  cours_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

interface ReservationTerrainWithDetails extends ReservationTerrain {
  terrain?: Terrain;
  user?: User;
}

interface ReservationEquipementWithDetails extends ReservationEquipement {
  equipement?: Equipement;
  user?: User;
}

interface ReservationCoursWithDetails extends ReservationCours {
  cours?: Cours;
  user?: User;
}

interface CreateReservationTerrainData {
  user_email: string;
  terrain_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

interface CreateReservationEquipementData {
  equipement_id: number;
  date_reservation: string;
  user_email?: string;
}

interface CreateReservationCoursData {
  user_email: string;
  cours_id: string;
  date_reservation: string;
  reservation_statut: 'confirmee' | 'annulee' | 'en_attente';
}

// Export des types
export type {
  User,
  Terrain,
  Equipement,
  Cours,
  ReservationTerrain,
  ReservationEquipement,
  ReservationCours,
  ReservationTerrainWithDetails,
  ReservationEquipementWithDetails,
  ReservationCoursWithDetails,
  CreateReservationTerrainData,
  CreateReservationEquipementData,
  CreateReservationCoursData
};

