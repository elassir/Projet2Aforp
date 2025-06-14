import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
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
import { useTerrainsSQL } from "../../hooks/useSQL";
import { useAuthHybrid } from "../../provider/AuthProviderHybrid";
import { TerrainServiceSQL } from "../../services/api/terrainServiceSQL";
import { Terrain } from "../../types/entitiesSQL";

export default function TerrainsScreen({ navigation }: any) {
  const { isDarkmode } = useTheme();
  const { user } = useAuthHybrid();
  const { terrains, loading, error, refetch } = useTerrainsSQL();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const sportTypes = [
    { key: 'all', label: 'Tous', icon: '🏟️' },
    { key: 'tennis', label: 'Tennis', icon: '🎾' },
    { key: 'football', label: 'Football', icon: '⚽' },
    { key: 'basketball', label: 'Basketball', icon: '🏀' },
    { key: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { key: 'badminton', label: 'Badminton', icon: '🏸' }
  ];

  const filteredTerrains = selectedType === 'all' 
    ? terrains 
    : terrains.filter(terrain => terrain.terrain_type === selectedType);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReserveTerrain = async (terrain: Terrain) => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour réserver");
      return;
    }

    if (terrain.terrain_statut !== 'disponible') {
      Alert.alert("Indisponible", "Ce terrain n'est pas disponible actuellement");
      return;
    }

    // Proposer une date de réservation - Interface simplifiée
    Alert.prompt(
      "Réserver ce terrain",
      `Terrain: ${terrain.terrain_type} - ${terrain.terrain_localisation}\nDate (YYYY-MM-DD):`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Réserver", 
          onPress: async (date) => {
            if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
              Alert.alert("Erreur", "Format de date invalide (YYYY-MM-DD)");
              return;
            }
            
            // Interface simplifiée pour choisir l'heure
            Alert.prompt(
              "Heure de début",
              "Heure de début (format HH:MM):",
              [
                { text: "Annuler", style: "cancel" },
                { 
                  text: "Continuer", 
                  onPress: async (startTime) => {
                    if (!startTime || !startTime.match(/^\d{2}:\d{2}$/)) {
                      Alert.alert("Erreur", "Format d'heure invalide (HH:MM)");
                      return;
                    }

                    Alert.prompt(
                      "Heure de fin",
                      "Heure de fin (format HH:MM):",
                      [
                        { text: "Annuler", style: "cancel" },
                        { 
                          text: "Confirmer",
                          onPress: async (endTime) => {
                            if (!endTime || !endTime.match(/^\d{2}:\d{2}$/)) {
                              Alert.alert("Erreur", "Format d'heure invalide (HH:MM)");
                              return;
                            }

                            try {
                              await TerrainServiceSQL.createReservation({
                                terrain_id: terrain.terrain_id,
                                date_reservation: date,
                                user_email: user.email,
                                heure_debut: startTime,
                                heure_fin: endTime,
                                reservation_statut: 'confirmee'
                              });
                              
                              Alert.alert("Succès", "Terrain réservé avec succès !");
                              refetch();
                            } catch (error) {
                              Alert.alert("Erreur", error instanceof Error ? error.message : "Erreur lors de la réservation");
                            }
                          }
                        }
                      ],
                      "plain-text",
                      "18:00"
                    );
                  }
                }
              ],
              "plain-text",
              "17:00"
            );
          }
        }
      ],
      "plain-text",
      new Date().toISOString().split('T')[0]
    );
  };

  // Utilise des emoji plutôt que des images
  const getSportEmoji = (type: string) => {
    switch (type) {
      case 'tennis': return '🎾';
      case 'football': return '⚽';
      case 'basketball': return '🏀';
      case 'volleyball': return '🏐';
      case 'badminton': return '🏸';
      default: return '🏟️';
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'disponible': return '#4CAF50';
      case 'maintenance': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <Layout>
      <TopNav
        middleContent="Terrains disponibles"
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 15 }}>
          {/* Interface simplifiée - Filtres */}
          <View style={{ flexDirection: 'row', marginBottom: 15, flexWrap: 'wrap', justifyContent: 'center' }}>
            {sportTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => setSelectedType(type.key)}
                style={{
                  marginHorizontal: 5,
                  marginVertical: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedType === type.key 
                    ? (isDarkmode ? themeColor.primary600 : themeColor.primary600)
                    : (isDarkmode ? '#2A2A30' : '#F5F5F5'),
                }}
              >
                <Text
                  style={{
                    color: selectedType === type.key ? 'white' : (isDarkmode ? themeColor.white100 : '#333'),
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {type.icon} {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading et erreurs */}
          {loading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>Chargement des terrains...</Text>
            </View>
          )}

          {error && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#F44336' }}>Erreur: {error}</Text>
              <Button
                text="Réessayer"
                onPress={refetch}
                style={{ marginTop: 10 }}
                size="sm"
              />
            </View>
          )}

          {/* Liste des terrains - Interface simplifiée */}
          {!loading && !error && filteredTerrains.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
              Aucun terrain trouvé pour ce sport.
            </Text>
          )}

          {filteredTerrains.map((terrain) => (
            <TouchableOpacity
              key={terrain.terrain_id}
              onPress={() => handleReserveTerrain(terrain)}
              disabled={terrain.terrain_statut !== 'disponible' || !user}
              style={{
                padding: 12,
                marginBottom: 10,
                backgroundColor: isDarkmode ? '#2A2A30' : '#FFF',
                borderRadius: 10,
                borderLeftWidth: 5,
                borderLeftColor: getStatusColor(terrain.terrain_statut),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 }}>
                    {getSportEmoji(terrain.terrain_type)}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text fontWeight="bold" size="lg">
                    {terrain.terrain_type.toUpperCase()}
                  </Text>
                  <Text size="sm" style={{ color: isDarkmode ? '#BBB' : '#666' }}>
                    📍 {terrain.terrain_localisation}
                  </Text>
                  <Text size="sm" style={{ color: isDarkmode ? '#BBB' : '#666' }}>
                    👥 Capacité: {terrain.terrain_capacite} personnes
                  </Text>
                </View>

                <View style={{ 
                  backgroundColor: getStatusColor(terrain.terrain_statut),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {terrain.terrain_statut === 'disponible' ? '✓ LIBRE' : '⚠ OCCUPÉ'}
                  </Text>
                </View>
              </View>

              {terrain.terrain_statut === 'disponible' && user && (
                <Button
                  text="Réserver ce terrain"
                  size="sm"
                  style={{ marginTop: 10 }}
                  rightContent={<Ionicons name="calendar" size={16} color="#FFF" />}
                  onPress={() => handleReserveTerrain(terrain)}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
}
