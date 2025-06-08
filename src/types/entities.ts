// Types pour les entités de l'application Centre Sportif

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Terrain {
  id: string;
  name: string;
  type: 'tennis' | 'football' | 'basketball' | 'volleyball' | 'badminton';
  capacity: number;
  hourly_rate: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'racket' | 'ball' | 'net' | 'shoes' | 'other';
  rental_price: number;
  quantity: number;
  description?: string;
  specifications?: string;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  sport_type: string;
  max_participants: number;
  current_participants: number;
  price: number;
  start_date: string;
  end_date: string;
  day_of_week: number; // 1-7 (lundi-dimanche)
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  terrain_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  equipment_reservations?: EquipmentReservation[];
  created_at: string;
  updated_at: string;
}

export interface EquipmentReservation {
  id: string;
  reservation_id: string;
  equipment_id: string;
  quantity: number;
  daily_rate: number;
  total_amount: number;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_date: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reservation_reminder' | 'course_reminder' | 'cancellation' | 'general';
  read: boolean;
  scheduled_for?: string;
  created_at: string;
}

// Types pour les formulaires
export interface CreateReservationData {
  terrain_id: string;
  date: string;
  start_time: string;
  end_time: string;
  equipment_ids?: { equipment_id: string; quantity: number }[];
}

export interface CreateCourseEnrollmentData {
  course_id: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityData {
  date: string;
  terrain_id: string;
  slots: TimeSlot[];
}
