import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
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
  TextInput,
} from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EquipmentService } from '../../services/api/equipmentService';
import { Equipment } from '../../types/entities';
import { MainStackNavigationProp } from '../../types/navigation';

export default function EquipmentScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchQuery, selectedType]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.getAllEquipment();
      setEquipment(data);
      
      // Extraire les types d'équipement uniques
      const types = [...new Set(data.map(item => item.type))];
      setEquipmentTypes(types);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
      Alert.alert('Erreur', 'Impossible de charger les équipements');
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    // Filtrer par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }    // Filtrer par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredEquipment(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEquipment();
    setRefreshing(false);
  };

  const handleEquipmentPress = (item: Equipment) => {
    navigation.navigate('EquipmentDetail', { equipmentId: item.id });
  };

  const getStatusColor = (item: Equipment) => {
    if (!item.is_available) return '#9CA3AF'; // Gris pour non disponible
    return item.quantity > 0 ? '#10B981' : '#EF4444'; // Vert si en stock, rouge si épuisé
  };

  const getStatusText = (item: Equipment) => {
    if (!item.is_available) return 'Non disponible';
    return item.quantity > 0 ? 'Disponible' : 'Épuisé';
  };

  const renderEquipmentCard = (item: Equipment) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleEquipmentPress(item)}
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
        <View style={{ flexDirection: 'row' }}>
          {/* Image placeholder */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: isDarkmode ? '#374151' : '#F3F4F6',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons
              name="fitness-outline"
              size={40}
              color={isDarkmode ? '#9CA3AF' : '#6B7280'}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <Text fontWeight="bold" size="lg" style={{ flex: 1, marginRight: 8 }}>
                {item.name}
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

            <Text
              size="sm"
              style={{
                color: isDarkmode ? '#9CA3AF' : '#6B7280',
                marginBottom: 8,
                backgroundColor: isDarkmode ? '#374151' : '#F3F4F6',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                alignSelf: 'flex-start',
              }}
            >
              {item.type}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                color: isDarkmode ? '#9CA3AF' : '#6B7280',
                marginBottom: 8,
                lineHeight: 20,
              }}
            >
              {item.description}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Quantité: {item.quantity}
                </Text>
                <Text fontWeight="bold" size="lg" style={{ color: themeColor.primary }}>
                  {item.rental_price}€/jour
                </Text>
              </View>
              
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Layout>
        <TopNav
          middleContent="Équipements"
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
          <Text>Chargement des équipements...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNav
        middleContent="Équipements"
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
        {/* Barre de recherche */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <TextInput
              placeholder="Rechercher un équipement..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftContent={
                <Ionicons
                  name="search"
                  size={20}
                  color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                />
              }
            />
          </SectionContent>
        </Section>

        {/* Filtres par type */}
        {equipmentTypes.length > 0 && (
          <Section style={{ marginBottom: 20 }}>
            <SectionContent>
              <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
                Filtrer par type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    text="Tous"                    status={selectedType === 'all' ? 'primary' : 'info'}
                    size="sm"
                    onPress={() => setSelectedType('all')}
                  />
                  {equipmentTypes.map((type) => (
                    <Button
                      key={type}
                      text={type}
                      status={selectedType === type ? 'primary' : 'info'}
                      size="sm"
                      onPress={() => setSelectedType(type)}
                    />
                  ))}
                </View>
              </ScrollView>
            </SectionContent>
          </Section>
        )}

        {/* Liste des équipements */}
        {filteredEquipment.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons
              name="fitness-outline"
              size={80}
              color={isDarkmode ? '#4B5563' : '#D1D5DB'}
              style={{ marginBottom: 16 }}
            />
            <Text size="lg" fontWeight="bold" style={{ marginBottom: 8, textAlign: 'center' }}>
              Aucun équipement trouvé
            </Text>
            <Text style={{ textAlign: 'center', color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
              {searchQuery || selectedType !== 'all'
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Aucun équipement n\'est disponible pour le moment.'}
            </Text>
          </View>
        ) : (
          <View>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 16 }}>
              {filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''} trouvé{filteredEquipment.length > 1 ? 's' : ''}
            </Text>
            {filteredEquipment.map(renderEquipmentCard)}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}
