import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Layout,
  Text,
  themeColor,
  useTheme,
  Button,
  TopNav,
  Section,
  SectionContent,
} from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CourseService } from '../../services/api/courseService';
import { Course, CourseEnrollment } from '../../types/entities';
import { MainStackNavigationProp, MainStackParamList } from '../../types/navigation';

type CourseDetailRouteProp = RouteProp<MainStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<CourseDetailRouteProp>();
  const { courseId } = route.params;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [userEnrollment, setUserEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseData, enrollmentData] = await Promise.all([
        CourseService.getCourseById(courseId),
        CourseService.getUserCourseEnrollment(courseId),
      ]);
      
      setCourse(courseData);
      setUserEnrollment(enrollmentData);
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du cours');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!course) return;

    try {
      setEnrolling(true);
      
      if (userEnrollment) {
        // Désinscrire
        await CourseService.cancelEnrollment(userEnrollment.id);
        setUserEnrollment(null);
        Alert.alert('Succès', 'Vous avez été désinscrit du cours');
      } else {
        // Inscrire
        const enrollment = await CourseService.enrollInCourse({
          course_id: course.id,
        });
        setUserEnrollment(enrollment);
        Alert.alert('Succès', 'Vous êtes maintenant inscrit au cours');
      }
      
      // Recharger les détails du cours pour mettre à jour le nombre de participants
      await loadCourseDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', error.message || 'Impossible de traiter votre demande');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCourseStatus = () => {
    if (!course) return { text: '', color: '' };
    
    const now = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    
    if (now > endDate) return { text: 'Terminé', color: '#9CA3AF' };
    if (now >= startDate && now <= endDate) return { text: 'En cours', color: '#10B981' };
    if (course.current_participants >= course.max_participants) return { text: 'Complet', color: '#EF4444' };
    return { text: 'Disponible', color: '#3B82F6' };
  };

  const canEnroll = () => {
    if (!course) return false;
    
    const now = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    
    // Ne peut pas s'inscrire si le cours est terminé ou en cours
    if (now >= startDate) return false;
    
    // Ne peut pas s'inscrire si le cours est complet (sauf si déjà inscrit)
    if (course.current_participants >= course.max_participants && !userEnrollment) return false;
    
    return true;
  };

  if (loading || !course) {
    return (
      <Layout>
        <TopNav
          middleContent="Détails du cours"
          leftContent={
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDarkmode ? themeColor.white100 : themeColor.dark}
            />
          }
          leftAction={() => navigation.goBack()}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Chargement...</Text>
        </View>
      </Layout>
    );
  }

  const status = getCourseStatus();

  return (
    <Layout>
      <TopNav
        middleContent="Détails du cours"
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => navigation.goBack()}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* En-tête du cours */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <View style={styles.header}>
              <Text fontWeight="bold" size="xl" style={{ flex: 1, marginBottom: 8 }}>
                {course.name}
              </Text>
              <View
                style={{
                  backgroundColor: status.color,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {status.text}
                </Text>
              </View>
            </View>

            {userEnrollment && (
              <View style={[styles.enrollmentBadge, { backgroundColor: '#10B981' }]}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>
                  Vous êtes inscrit
                </Text>
              </View>
            )}
          </SectionContent>
        </Section>

        {/* Description */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
              Description
            </Text>
            <Text style={{ lineHeight: 24 }}>
              {course.description}
            </Text>
          </SectionContent>
        </Section>

        {/* Informations du cours */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
              Informations
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={isDarkmode ? '#9CA3AF' : '#6B7280'}
              />
              <View style={{ marginLeft: 12 }}>
                <Text fontWeight="bold">Dates</Text>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Du {formatDate(course.start_date)} au {formatDate(course.end_date)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={isDarkmode ? '#9CA3AF' : '#6B7280'}
              />
              <View style={{ marginLeft: 12 }}>
                <Text fontWeight="bold">Horaires</Text>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  {formatTime(course.start_time)} - {formatTime(course.end_time)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="people-outline"
                size={20}
                color={isDarkmode ? '#9CA3AF' : '#6B7280'}
              />
              <View style={{ marginLeft: 12 }}>
                <Text fontWeight="bold">Participants</Text>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  {course.current_participants}/{course.max_participants} inscrits
                </Text>
              </View>
            </View>            {course.instructor && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text fontWeight="bold">Instructeur</Text>
                  <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                    {course.instructor}
                  </Text>
                </View>
              </View>            )}
          </SectionContent>
        </Section>

        {/* Prix et action */}
        <Section style={{ marginBottom: 40 }}>
          <SectionContent>
            <View style={styles.priceSection}>
              <View>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Prix du cours
                </Text>
                <Text fontWeight="bold" size="xl" style={{ color: themeColor.primary }}>
                  {course.price}€
                </Text>
              </View>
                <Button
                text={userEnrollment ? 'Se désinscrire' : 'S\'inscrire'}
                status={userEnrollment ? 'danger' : 'primary'}
                disabled={(!canEnroll() && !userEnrollment) || enrolling}
                onPress={handleEnrollment}
                style={{ minWidth: 120 }}
              />
            </View>

            {!canEnroll() && !userEnrollment && (
              <Text
                size="sm"
                style={{
                  color: '#EF4444',
                  textAlign: 'center',
                  marginTop: 12,
                  fontStyle: 'italic',
                }}
              >
                {course.current_participants >= course.max_participants
                  ? 'Ce cours est complet'
                  : 'Les inscriptions sont fermées'}
              </Text>
            )}
          </SectionContent>
        </Section>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  enrollmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
