import { useState, useEffect } from 'react';
import { UserServiceSQL, TerrainServiceSQL, EquipementServiceSQL, CoursServiceSQL, ReservationServiceSQL } from '../services/api/indexSQL';
import type { 
  User, 
  Terrain, 
  Equipement, 
  Cours,
  ReservationCours,
  ReservationTerrain,
  ReservationEquipement,
  ReservationTerrainWithDetails,
  ReservationEquipementWithDetails,
  ReservationCoursWithDetails
} from '../types/entitiesSQL';

// Données de cours basées sur le CSV
const coursData: Cours[] = [
  { cours_id: "C001", cours_description: "Cours de tennis pour débutants avec initiation aux règles de base", cours_tarif: 25.00, cours_duree: "2025-12-31", cours_nombre_max: 8, cours_date: "2025-06-15", cours_nom: "Tennis Débutant" },
  { cours_id: "C002", cours_description: "Perfectionnement technique au tennis pour joueurs intermédiaires", cours_tarif: 35.00, cours_duree: "2025-12-31", cours_nombre_max: 6, cours_date: "2025-06-16", cours_nom: "Tennis Intermédiaire" },
  { cours_id: "C003", cours_description: "Entraînement football pour enfants de 8 à 12 ans", cours_tarif: 20.00, cours_duree: "2025-12-31", cours_nombre_max: 16, cours_date: "2025-06-17", cours_nom: "Football Jeunes" },
  { cours_id: "C004", cours_description: "Cours de basketball - techniques de base et règles", cours_tarif: 30.00, cours_duree: "2025-12-31", cours_nombre_max: 12, cours_date: "2025-06-18", cours_nom: "Basketball Initiation" },
  { cours_id: "C005", cours_description: "Volleyball loisir pour adultes tous niveaux", cours_tarif: 22.00, cours_duree: "2025-12-31", cours_nombre_max: 10, cours_date: "2025-06-19", cours_nom: "Volleyball Loisir" },
  { cours_id: "C006", cours_description: "Badminton en double - tactiques et stratégies", cours_tarif: 28.00, cours_duree: "2025-12-31", cours_nombre_max: 8, cours_date: "2025-06-20", cours_nom: "Badminton Double" },
  { cours_id: "C007", cours_description: "Cours de tennis avancé avec analyse vidéo", cours_tarif: 45.00, cours_duree: "2025-12-31", cours_nombre_max: 4, cours_date: "2025-06-21", cours_nom: "Tennis Avancé" },
  { cours_id: "C008", cours_description: "Football féminin - technique et condition physique", cours_tarif: 25.00, cours_duree: "2025-12-31", cours_nombre_max: 14, cours_date: "2025-06-22", cours_nom: "Football Féminin" },
  { cours_id: "C009", cours_description: "Basketball 3x3 - tournoi et entraînement", cours_tarif: 18.00, cours_duree: "2025-12-31", cours_nombre_max: 6, cours_date: "2025-06-23", cours_nom: "Basketball 3x3" },
  { cours_id: "C010", cours_description: "Initiation multi-sports pour enfants 6-10 ans", cours_tarif: 15.00, cours_duree: "2025-12-31", cours_nombre_max: 12, cours_date: "2025-06-24", cours_nom: "Multi-Sports Enfants" },
];

// Données de terrain basées sur le CSV
const terrainData: Terrain[] = [
  { terrain_id: "T001", terrain_type: "tennis", terrain_localisation: "Niveau 1 - Zone A", terrain_capacite: 2, terrain_statut: "disponible", terrain_photo: "tennis_court_1.jpg" },
  { terrain_id: "T002", terrain_type: "tennis", terrain_localisation: "Niveau 1 - Zone B", terrain_capacite: 2, terrain_statut: "disponible", terrain_photo: "tennis_court_2.jpg" },
  { terrain_id: "T003", terrain_type: "football", terrain_localisation: "Niveau 2 - Zone A", terrain_capacite: 22, terrain_statut: "disponible", terrain_photo: "football_field_1.jpg" },
  { terrain_id: "T004", terrain_type: "basketball", terrain_localisation: "Niveau 2 - Zone B", terrain_capacite: 10, terrain_statut: "maintenance", terrain_photo: "basketball_court_1.jpg" },
  { terrain_id: "T005", terrain_type: "volleyball", terrain_localisation: "Niveau 3 - Zone A", terrain_capacite: 12, terrain_statut: "disponible", terrain_photo: "volleyball_court_1.jpg" },
];

// Données d'équipements basées sur le CSV
const equipementsData: Equipement[] = [
  { equipement_id: "E001", equipement_nom: "Raquette de tennis Wilson Pro", equipement_type: "raquette", equipement_description: "Raquette professionnelle pour tennis", equipement_statut: "disponible" },
  { equipement_id: "E002", equipement_nom: "Ballon de football Adidas", equipement_type: "ballon", equipement_description: "Ballon officiel FIFA", equipement_statut: "disponible" },
  { equipement_id: "E003", equipement_nom: "Panier de basketball", equipement_type: "panier", equipement_description: "Panier mobile réglable", equipement_statut: "maintenance" },
  { equipement_id: "E004", equipement_nom: "Filet de volleyball", equipement_type: "filet", equipement_description: "Filet réglementaire", equipement_statut: "disponible" },
  { equipement_id: "E005", equipement_nom: "Raquette de badminton Yonex", equipement_type: "raquette", equipement_description: "Raquette légère pour badminton", equipement_statut: "disponible" },
];

// Données de réservations basées sur le CSV
const reservationsData: ReservationCours[] = [
  { user_email: "marie.dupont@email.com", cours_id: "C001", date_reservation: "2025-06-10", reservation_statut: "confirmee" },
  { user_email: "pierre.martin@email.com", cours_id: "C001", date_reservation: "2025-06-10", reservation_statut: "confirmee" },
  { user_email: "sophie.bernard@email.com", cours_id: "C002", date_reservation: "2025-06-11", reservation_statut: "confirmee" },
  { user_email: "julien.moreau@email.com", cours_id: "C003", date_reservation: "2025-06-11", reservation_statut: "confirmee" },
  { user_email: "alice.rousseau@email.com", cours_id: "C004", date_reservation: "2025-06-12", reservation_statut: "confirmee" },
  { user_email: "david.leroy@email.com", cours_id: "C005", date_reservation: "2025-06-12", reservation_statut: "confirmee" },
  { user_email: "camille.dubois@email.com", cours_id: "C006", date_reservation: "2025-06-13", reservation_statut: "confirmee" },
  { user_email: "thomas.lambert@email.com", cours_id: "C007", date_reservation: "2025-06-13", reservation_statut: "en_attente" },
  { user_email: "laura.garcia@email.com", cours_id: "C008", date_reservation: "2025-06-14", reservation_statut: "confirmee" },
  { user_email: "marie.dupont@email.com", cours_id: "C009", date_reservation: "2025-06-14", reservation_statut: "confirmee" },
];

// Données de réservations d'équipements basées sur le CSV
const reservationsEquipementsData: ReservationEquipement[] = [
  { reservation_id: "RE001", user_email: "marie.dupont@email.com", equipement_id: "E001", date_reservation: "2025-06-15", reservation_statut: "confirmee" },
  { reservation_id: "RE002", user_email: "pierre.martin@email.com", equipement_id: "E002", date_reservation: "2025-06-16", reservation_statut: "confirmee" },
  { reservation_id: "RE003", user_email: "sophie.bernard@email.com", equipement_id: "E005", date_reservation: "2025-06-17", reservation_statut: "en_attente" },
];

// Données de réservations de terrains basées sur le CSV
const reservationsTerrainsData: ReservationTerrain[] = [
  { reservation_id: "RT001", user_email: "marie.dupont@email.com", terrain_id: "T001", date_reservation: "2025-06-20", heure_debut: "09:00", heure_fin: "10:00", reservation_statut: "confirmee" },
  { reservation_id: "RT002", user_email: "pierre.martin@email.com", terrain_id: "T002", date_reservation: "2025-06-21", heure_debut: "14:00", heure_fin: "15:00", reservation_statut: "confirmee" },
  { reservation_id: "RT003", user_email: "julien.moreau@email.com", terrain_id: "T003", date_reservation: "2025-06-22", heure_debut: "16:00", heure_fin: "17:30", reservation_statut: "en_attente" },
];

// Hook pour gérer les utilisateurs
export const useUsersSQL = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserServiceSQL.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, error, refetch: loadUsers };
};

// Hook pour gérer les terrains
export const useTerrainsSQL = () => {
  const [terrains, setTerrains] = useState<Terrain[]>(terrainData); // Initialiser avec les données statiques
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadTerrains = async () => {
    try {
      setLoading(true);
      // Assurons-nous que nous avons toujours des données à afficher
      console.log("Données statiques chargées:", terrainData.length);
      
      // Pour garantir que l'interface sera toujours réactive, on affiche d'abord les données statiques
      setTerrains(terrainData);
      
      // Tentative de récupération des données depuis l'API
      try {
        const data = await TerrainServiceSQL.getAllTerrains();
        console.log("Données API chargées:", data?.length);
        if (data && data.length > 0) {
          setTerrains(data);
        } else {
          // Si l'API renvoie un tableau vide, on utilise les données statiques
          console.log("Aucune donnée API, utilisation des données statiques");
          setTerrains(terrainData);
        }
      } catch (apiErr) {
        console.log("API fallback error:", apiErr);
        // On utilise les données statiques en cas d'erreur
        setTerrains(terrainData);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erreur générale:", err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des terrains');
      // Assurons-nous d'avoir des données même en cas d'erreur
      setTerrains(terrainData);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTerrains = async () => {
    try {
      setLoading(true);
      // Filtrer les données statiques pour n'afficher que les disponibles
      const availableTerrains = terrainData.filter(t => t.terrain_statut === 'disponible');
      setTerrains(availableTerrains);
      console.log("Terrains disponibles:", availableTerrains.length);
      setError(null);
    } catch (err) {
      console.error("Erreur de filtrage:", err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des terrains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerrains();
  }, []);

  return { 
    terrains, 
    loading, 
    error, 
    refetch: loadTerrains,
    loadAvailable: loadAvailableTerrains 
  };
};

// Hook pour gérer les équipements
export const useEquipementsSQL = () => {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEquipements = async () => {
    try {
      setLoading(true);
      const data = await EquipementServiceSQL.getAllEquipements();
      setEquipements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableEquipements = async () => {
    try {
      setLoading(true);
      const data = await EquipementServiceSQL.getAvailableEquipements();
      setEquipements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipements();
  }, []);

  return { 
    equipements, 
    loading, 
    error, 
    refetch: loadEquipements,
    loadAvailable: loadAvailableEquipements 
  };
};

// Hook pour gérer les cours
export const useCoursSQL = () => {
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCours = async () => {
    try {
      setLoading(true);
      const data = await CoursServiceSQL.getAllCours();
      setCours(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCours = async () => {
    try {
      setLoading(true);
      const data = await CoursServiceSQL.getAvailableCours();
      setCours(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCours();
  }, []);

  return { 
    cours, 
    loading, 
    error, 
    refetch: loadCours,
    loadAvailable: loadAvailableCours 
  };
};

// Hook pour gérer les réservations d'un utilisateur
export const useUserReservationsSQL = (userEmail: string) => {
  const [reservations, setReservations] = useState<{
    terrains: ReservationTerrainWithDetails[];
    equipements: ReservationEquipementWithDetails[];
    cours: ReservationCoursWithDetails[];
  }>({
    terrains: [],
    equipements: [],
    cours: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadReservations = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      
      // Utilisation des données de test
      const userCoursReservations = reservationsData
        .filter(r => r.user_email === userEmail)
        .map(r => ({
          ...r,
          cours: coursData.find(c => c.cours_id === r.cours_id)
        }));
      
      const userEquipementReservations = reservationsEquipementsData
        .filter(r => r.user_email === userEmail)
        .map(r => ({
          ...r,
          equipement: equipementsData.find(e => e.equipement_id === r.equipement_id)
        }));
        
      const userTerrainReservations = reservationsTerrainsData
        .filter(r => r.user_email === userEmail)
        .map(r => ({
          ...r,
          terrain: terrainData.find(t => t.terrain_id === r.terrain_id)
        }));
      
      setReservations({
        cours: userCoursReservations,
        equipements: userEquipementReservations,
        terrains: userTerrainReservations
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [userEmail]);

  return { reservations, loading, error, refetch: loadReservations };
};

// Hook pour les statistiques (admin)
export const useStatsSQL = () => {
  const [stats, setStats] = useState({
    users: { totalUsers: 0, totalClients: 0, totalAdmins: 0 },
    terrains: { totalTerrains: 0, terrainsDisponibles: 0, terrainsMaintenance: 0, reservationsActives: 0 },
    equipements: { totalEquipements: 0, equipementsDisponibles: 0, equipementsMaintenance: 0, reservationsActives: 0 },
    cours: { totalCours: 0, coursDisponibles: 0, totalInscriptions: 0, tauxOccupation: 0 },
    reservations: { totalReservationsTerrains: 0, totalReservationsEquipements: 0, totalInscriptionsCours: 0, reservationsEnAttente: 0, reservationsConfirmees: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [userStats, terrainStats, equipementStats, coursStats, reservationStats] = await Promise.all([
        UserServiceSQL.getUserStats(),
        TerrainServiceSQL.getTerrainStats(),
        EquipementServiceSQL.getEquipementStats(),
        CoursServiceSQL.getCoursStats(),
        ReservationServiceSQL.getReservationStats()
      ]);

      setStats({
        users: userStats,
        terrains: terrainStats,
        equipements: equipementStats,
        cours: coursStats,
        reservations: reservationStats
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, error, refetch: loadStats };
};
