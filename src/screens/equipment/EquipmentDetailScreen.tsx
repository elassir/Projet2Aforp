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
  TextInput,
} from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { EquipmentService } from '../../services/api/equipmentService';
import { Equipment } from '../../types/entities';
import { MainStackNavigationProp, MainStackParamList } from '../../types/navigation';

type EquipmentDetailRouteProp = RouteProp<MainStackParamList, 'EquipmentDetail'>;

export default function EquipmentDetailScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<EquipmentDetailRouteProp>();
  const { equipmentId } = route.params;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState('1');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadEquipmentDetails();
  }, [equipmentId]);

  const loadEquipmentDetails = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.getEquipmentById(equipmentId);
      setEquipment(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'équipement:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'équipement');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!equipment) return;

    const days = parseInt(rentalDays);
    if (isNaN(days) || days < 1) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre de jours valide');
      return;
    }

    try {
      setAdding(true);
      
      // Dans une vraie application, vous pourriez avoir un panier ou créer directement une réservation
      // Pour cet exemple, nous affichons juste une confirmation
      const totalPrice = equipment.rental_price * days;
      
      Alert.alert(
        'Ajouté au panier',
        `${equipment.name} pour ${days} jour${days > 1 ? 's' : ''}\nTotal: ${totalPrice}€`,
        [
          { text: 'Continuer', style: 'default' },
          { 
            text: 'Voir le panier', 
            style: 'default',
            onPress: () => {
              // Navigate to cart or reservation screen
              navigation.navigate('CreateReservation');
            }
          },
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter l\'équipement');
    } finally {
      setAdding(false);
    }
  };

  const getStatusColor = () => {
    if (!equipment?.is_available) return '#9CA3AF';
    return equipment.quantity > 0 ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    if (!equipment?.is_available) return 'Non disponible';
    return equipment.quantity > 0 ? 'Disponible' : 'Épuisé';
  };

  const canRent = () => {
    return equipment?.is_available && equipment.quantity > 0;
  };

  if (loading || !equipment) {
    return (
      <Layout>
        <TopNav
          middleContent="Détails équipement"
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

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const totalPrice = equipment.rental_price * parseInt(rentalDays || '1');

  return (
    <Layout>
      <TopNav
        middleContent="Détails équipement"
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
        {/* Image et statut */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <View style={styles.header}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: isDarkmode ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                  alignSelf: 'center',
                }}
              >
                <Ionicons
                  name="fitness-outline"
                  size={60}
                  color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text fontWeight="bold" size="xl" style={{ flex: 1, marginRight: 8, textAlign: 'center' }}>
                  {equipment.name}
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: statusColor,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {statusText}
                  </Text>
                </View>

                <Text
                  style={{
                    color: isDarkmode ? '#9CA3AF' : '#6B7280',
                    backgroundColor: isDarkmode ? '#374151' : '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  {equipment.type}
                </Text>
              </View>
            </View>
          </SectionContent>
        </Section>

        {/* Description */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
              Description
            </Text>
            <Text style={{ lineHeight: 24 }}>
              {equipment.description}
            </Text>
          </SectionContent>
        </Section>

        {/* Informations */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
              Informations
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={isDarkmode ? '#9CA3AF' : '#6B7280'}
              />
              <View style={{ marginLeft: 12 }}>
                <Text fontWeight="bold">Prix de location</Text>
                <Text style={{ color: themeColor.primary, fontWeight: 'bold', fontSize: 18 }}>
                  {equipment.rental_price}€ / jour
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={isDarkmode ? '#9CA3AF' : '#6B7280'}
              />
              <View style={{ marginLeft: 12 }}>
                <Text fontWeight="bold">Quantité disponible</Text>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  {equipment.quantity} unité{equipment.quantity > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {equipment.specifications && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text fontWeight="bold">Spécifications</Text>
                  <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                    {equipment.specifications}
                  </Text>
                </View>
              </View>
            )}
          </SectionContent>
        </Section>

        {/* Location */}
        {canRent() && (
          <Section style={{ marginBottom: 40 }}>
            <SectionContent>
              <Text fontWeight="bold" size="lg" style={{ marginBottom: 12 }}>
                Louer cet équipement
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ marginBottom: 8 }}>Nombre de jours</Text>
                <TextInput
                  placeholder="1"
                  value={rentalDays}
                  onChangeText={setRentalDays}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.priceCalculation}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Prix par jour:</Text>
                  <Text>{equipment.rental_price}€</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Nombre de jours:</Text>
                  <Text>{rentalDays || '1'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDarkmode ? '#374151' : '#E5E7EB', paddingTop: 8 }}>
                  <Text fontWeight="bold">Total:</Text>
                  <Text fontWeight="bold" style={{ color: themeColor.primary, fontSize: 18 }}>
                    {totalPrice}€
                  </Text>
                </View>
              </View>              <Button
                text={adding ? "Ajout en cours..." : "Ajouter au panier"}
                onPress={handleAddToCart}
                disabled={!canRent() || adding}
                style={{ marginTop: 16 }}
              />

              {!canRent() && (
                <Text
                  size="sm"
                  style={{
                    color: '#EF4444',
                    textAlign: 'center',
                    marginTop: 12,
                    fontStyle: 'italic',
                  }}
                >
                  Cet équipement n'est pas disponible à la location
                </Text>
              )}
            </SectionContent>
          </Section>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceCalculation: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});
