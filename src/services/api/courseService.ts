import { supabase } from '../../initSupabase';
import { Course, CourseEnrollment, CreateCourseEnrollmentData } from '../../types/entities';

export class CourseService {
  
  // Récupérer tous les cours actifs
  static async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('start_date');
    
    if (error) throw error;
    return data || [];
  }

  // Récupérer un cours par ID
  static async getCourseById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Récupérer les cours disponibles (avec places libres)
  static async getAvailableCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .lt('current_participants', supabase.rpc('max_participants'))
      .order('start_date');
    
    if (error) throw error;
    return data || [];
  }
  // S'inscrire à un cours
  static async enrollInCourse(data: CreateCourseEnrollmentData): Promise<CourseEnrollment> {
    const user = supabase.auth.user();
    if (!user) throw new Error('Utilisateur non authentifié');

    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', data.course_id)
      .eq('status', 'active')
      .single();

    if (existingEnrollment) {
      throw new Error('Vous êtes déjà inscrit à ce cours');
    }

    // Vérifier s'il y a encore de la place
    const course = await this.getCourseById(data.course_id);
    if (!course) throw new Error('Cours non trouvé');
    
    if (course.current_participants >= course.max_participants) {
      throw new Error('Ce cours est complet');
    }

    // Créer l'inscription
    const enrollmentData = {
      user_id: user.id,
      course_id: data.course_id,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    // Incrémenter le nombre de participants
    const { error: updateError } = await supabase
      .from('courses')
      .update({ current_participants: course.current_participants + 1 })
      .eq('id', data.course_id);

    if (updateError) throw updateError;

    return enrollment;
  }
  // Récupérer les inscriptions d'un utilisateur
  static async getUserEnrollments(): Promise<CourseEnrollment[]> {
    const user = supabase.auth.user();
    if (!user) throw new Error('Utilisateur non authentifié');

    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses (
          name,
          instructor,
          sport_type,
          start_date,
          end_date,
          day_of_week,
          start_time,
          end_time,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Annuler une inscription
  static async cancelEnrollment(enrollmentId: string): Promise<void> {
    const { data: enrollment, error: fetchError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('id', enrollmentId)
      .single();

    if (fetchError) throw fetchError;

    // Marquer l'inscription comme annulée
    const { error: updateError } = await supabase
      .from('course_enrollments')
      .update({ status: 'cancelled' })
      .eq('id', enrollmentId);

    if (updateError) throw updateError;

    // Décrémenter le nombre de participants
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('current_participants')
      .eq('id', enrollment.course_id)
      .single();

    if (courseError) throw courseError;

    const { error: decrementError } = await supabase
      .from('courses')
      .update({ current_participants: Math.max(0, course.current_participants - 1) })
      .eq('id', enrollment.course_id);

    if (decrementError) throw decrementError;
  }
  // Récupérer l'inscription d'un utilisateur pour un cours spécifique
  static async getUserCourseEnrollment(courseId: string): Promise<CourseEnrollment | null> {
    const user = supabase.auth.user();
    if (!user) return null;

    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  // Rechercher des cours par sport
  static async getCoursesBySport(sportType: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('sport_type', sportType)
      .eq('is_active', true)
      .order('start_date');
    
    if (error) throw error;
    return data || [];
  }
}
