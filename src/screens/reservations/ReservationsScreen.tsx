import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MainTabsParamList, MainStackParamList } from "../../types/navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TopNav,
  Section,
  SectionContent,
  useTheme,
  themeColor,
  Button,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { TerrainService } from "../../services/api/terrainService";
import { ReservationService } from "../../services/api/reservationService";
import { Reservation } from "../../types/entities";

type ReservationsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Reservations">,
  NativeStackScreenProps<MainStackParamList>
>;

export default function ReservationsScreen({
  navigation,
}: ReservationsScreenProps) {
  const { isDarkmode, setTheme } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);
  const loadReservations = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'ID utilisateur réel depuis le contexte Auth
      const data = await ReservationService.getUserReservations('user-id-placeholder');
      setReservations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      Alert.alert('Erreur', 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (reservationId: string) => {
    Alert.alert(
      "Annuler la réservation",
      "Êtes-vous sûr de vouloir annuler cette réservation ?",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui", 
          style: "destructive",
          onPress: async () => {
            try {
              await TerrainService.cancelReservation(reservationId);
              loadReservations(); // Recharger la liste
              Alert.alert("Succès", "Réservation annulée avec succès");
            } catch (error) {
              Alert.alert("Erreur", "Impossible d'annuler la réservation");
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'completed': return '#9E9E9E';
      default: return themeColor.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'cancelled': return 'Annulée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <TopNav
        middleContent="Mes Réservations"
        rightContent={
          <TouchableOpacity onPress={() => navigation.navigate("CreateReservation")}>
            <Ionicons
              name="add"
              size={24}
              color={isDarkmode ? themeColor.white100 : themeColor.dark}
            />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text>Chargement...</Text>
          </View>
        ) : reservations.length === 0 ? (
          <Section style={{ marginTop: 20 }}>
            <SectionContent>
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons 
                  name="calendar-outline" 
                  size={64} 
                  color={isDarkmode ? themeColor.white100 : themeColor.dark100}
                  style={{ marginBottom: 20 }}
                />
                <Text size="lg" fontWeight="bold" style={{ marginBottom: 10 }}>
                  Aucune réservation
                </Text>
                <Text style={{ textAlign: 'center', opacity: 0.7, marginBottom: 20 }}>
                  Vous n'avez pas encore de réservation. Commencez par réserver un terrain !
                </Text>
                <Button
                  text="Réserver un terrain"
                  onPress={() => navigation.navigate("CreateReservation")}
                />
              </View>
            </SectionContent>
          </Section>
        ) : (
          reservations.map((reservation) => (
            <Section key={reservation.id} style={{ marginTop: 15 }}>
              <SectionContent>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 10
                }}>
                  <View style={{ flex: 1 }}>
                    <Text size="md" fontWeight="bold">
                      {(reservation as any).terrains?.name || 'Terrain'}
                    </Text>
                    <Text style={{ opacity: 0.7, marginTop: 2 }}>
                      {(reservation as any).terrains?.type || 'Sport'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: getStatusColor(reservation.status),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text size="sm" style={{ color: 'white', fontWeight: 'bold' }}>
                      {getStatusText(reservation.status)}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Ionicons name="calendar" size={16} color={themeColor.primary} />
                  <Text style={{ marginLeft: 8 }}>
                    {formatDate(reservation.date)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Ionicons name="time" size={16} color={themeColor.primary} />
                  <Text style={{ marginLeft: 8 }}>
                    {reservation.start_time} - {reservation.end_time}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <Ionicons name="card" size={16} color={themeColor.primary} />
                  <Text style={{ marginLeft: 8 }}>
                    {reservation.total_amount}€
                  </Text>
                </View>

                {/* Équipements réservés */}
                {(reservation as any).equipment_reservations && 
                 (reservation as any).equipment_reservations.length > 0 && (
                  <View style={{ marginBottom: 15 }}>
                    <Text size="sm" fontWeight="bold" style={{ marginBottom: 5 }}>
                      Équipements :
                    </Text>
                    {(reservation as any).equipment_reservations.map((eq: any, index: number) => (
                      <Text key={index} size="sm" style={{ opacity: 0.7, marginLeft: 10 }}>
                        • {eq.equipment?.name} x{eq.quantity}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: themeColor.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flex: 1,
                      marginRight: 10
                    }}
                    onPress={() => navigation.navigate("ReservationDetail", { 
                      reservationId: reservation.id 
                    })}
                  >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                      Détails
                    </Text>
                  </TouchableOpacity>

                  {reservation.status === 'confirmed' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F44336',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flex: 1,
                        marginLeft: 10
                      }}
                      onPress={() => handleCancelReservation(reservation.id)}
                    >
                      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                        Annuler
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </SectionContent>
            </Section>
          ))
        )}
      </ScrollView>
    </Layout>
  );
}
