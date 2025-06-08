import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
import { useNavigation } from '@react-navigation/native';
import { CourseService } from '../../services/api/courseService';
import { Course } from '../../types/entities';
import { MainStackNavigationProp } from '../../types/navigation';

export default function CoursesScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'available'>('all');

  useEffect(() => {
    loadCourses();
  }, [filterType]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = filterType === 'available' 
        ? await CourseService.getAvailableCourses()
        : await CourseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      Alert.alert('Erreur', 'Impossible de charger les cours');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
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

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const getCourseStatusColor = (course: Course) => {
    const now = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    
    if (now > endDate) return '#9CA3AF'; // Gris pour terminé
    if (now >= startDate && now <= endDate) return '#10B981'; // Vert pour en cours
    if (course.current_participants >= course.max_participants) return '#EF4444'; // Rouge pour complet
    return '#3B82F6'; // Bleu pour disponible
  };

  const getCourseStatusText = (course: Course) => {
    const now = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    
    if (now > endDate) return 'Terminé';
    if (now >= startDate && now <= endDate) return 'En cours';
    if (course.current_participants >= course.max_participants) return 'Complet';
    return 'Disponible';
  };

  const renderCourseCard = (course: Course) => {
    const statusColor = getCourseStatusColor(course);
    const statusText = getCourseStatusText(course);

    return (
      <TouchableOpacity
        key={course.id}
        onPress={() => handleCoursePress(course)}
        style={{
          backgroundColor: isDarkmode ? '#1F2937' : '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text fontWeight="bold" size="lg" style={{ flex: 1, marginRight: 8 }}>
            {course.name}
          </Text>
          <View
            style={{
              backgroundColor: statusColor,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text size="sm" style={{ color: 'white' }}>
              {statusText}
            </Text>
          </View>
        </View>

        <Text style={{ marginBottom: 8, color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
          {course.description}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={isDarkmode ? '#9CA3AF' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
            Du {formatDate(course.start_date)} au {formatDate(course.end_date)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons
            name="time-outline"
            size={16}
            color={isDarkmode ? '#9CA3AF' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
            {formatTime(course.start_time)} - {formatTime(course.end_time)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons
            name="people-outline"
            size={16}
            color={isDarkmode ? '#9CA3AF' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
            {course.current_participants}/{course.max_participants} participants
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text fontWeight="bold" size="lg" style={{ color: themeColor.primary }}>
            {course.price}€
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280', marginRight: 4 }}>
              Voir détails
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDarkmode ? '#9CA3AF' : '#6B7280'}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Layout>
        <TopNav
          middleContent="Cours"
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
          <Text>Chargement des cours...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNav
        middleContent="Cours"
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => navigation.goBack()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filtres */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
              Filtrer les cours
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                text="Tous les cours"
                status={filterType === 'all' ? 'primary' : 'info'}
                size="sm"
                onPress={() => setFilterType('all')}
                style={{ flex: 1 }}
              />
              <Button
                text="Disponibles"
                status={filterType === 'available' ? 'primary' : 'info'}
                size="sm"
                onPress={() => setFilterType('available')}
                style={{ flex: 1 }}
              />
            </View>
          </SectionContent>
        </Section>

        {/* Liste des cours */}
        {courses.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons
              name="school-outline"
              size={80}
              color={isDarkmode ? '#4B5563' : '#D1D5DB'}
              style={{ marginBottom: 16 }}
            />
            <Text size="lg" fontWeight="bold" style={{ marginBottom: 8, textAlign: 'center' }}>
              Aucun cours trouvé
            </Text>
            <Text style={{ textAlign: 'center', color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
              {filterType === 'available' 
                ? 'Aucun cours disponible pour le moment.'
                : 'Aucun cours n\'est encore programmé.'}
            </Text>
          </View>
        ) : (
          <View>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 16 }}>
              {courses.length} cours {filterType === 'available' ? 'disponibles' : 'au total'}
            </Text>
            {courses.map(renderCourseCard)}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}
