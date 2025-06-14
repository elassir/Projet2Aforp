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
import { useUserReservationsSQL } from "../../hooks/useSQL";
import { useAuthHybrid } from "../../provider/AuthProviderHybrid";
import { ReservationServiceSQL } from "../../services/api/reservationServiceSQL";
import { CoursServiceSQL } from "../../services/api/coursServiceSQL";

export default function ReservationsScreenSQL({ navigation }: any) {
  const { isDarkmode } = useTheme();
  const auth = useAuthHybrid();
  const { reservations, loading, error, refetch } = useUserReservationsSQL(auth.user?.email || '');
  const reservationsData = reservations as {
    terrains: any[];
    equipements: any[];
    cours: any[];
  };
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'terrains' | 'equipements' | 'cours'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancelTerrainReservation = async (terrainId: string) => {
    if (!auth.user) return;

    Alert.alert(
      "Annuler la réservation",
      "Êtes-vous sûr de vouloir annuler cette réservation de terrain ?",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui, annuler", 
          style: "destructive",
          onPress: async () => {
            try {
              await ReservationServiceSQL.cancelTerrainReservation(terrainId, auth.user!.email);
              Alert.alert("Succès", "Réservation annulée");
              refetch();
            } catch (error) {
              Alert.alert("Erreur", error instanceof Error ? error.message : "Erreur lors de l'annulation");
            }
          }
        }
      ]
    );
  };

  const handleCancelEquipementReservation = async (equipementId: string) => {
    if (!auth.user) return;

    Alert.alert(
      "Annuler la réservation",
      "Êtes-vous sûr de vouloir annuler cette réservation d'équipement ?",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui, annuler", 
          style: "destructive",
          onPress: async () => {
            try {
              await ReservationServiceSQL.cancelEquipementReservation(equipementId, auth.user!.email);
              Alert.alert("Succès", "Réservation annulée");
              refetch();
            } catch (error) {
              Alert.alert("Erreur", error instanceof Error ? error.message : "Erreur lors de l'annulation");
            }
          }
        }
      ]
    );
  };

  const handleCancelCoursEnrollment = async (coursId: string) => {
    if (!auth.user) return;

    Alert.alert(
      "Se désinscrire",
      "Êtes-vous sûr de vouloir vous désinscrire de ce cours ?",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui, se désinscrire", 
          style: "destructive",
          onPress: async () => {
            try {
              await CoursServiceSQL.cancelEnrollment(coursId, auth.user!.email);
              Alert.alert("Succès", "Désinscription réussie");
              refetch();
            } catch (error) {
              Alert.alert("Erreur", error instanceof Error ? error.message : "Erreur lors de la désinscription");
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirmee': return '#4CAF50';
      case 'en_attente': return '#FF9800';
      case 'annulee': return '#F44336';
      case 'terminee': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'confirmee': return '✅';
      case 'en_attente': return '⏳';
      case 'annulee': return '❌';
      case 'terminee': return '✔️';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { key: 'all', label: 'Toutes', icon: '📋' },
    { key: 'terrains', label: 'Terrains', icon: '🏟️' },
    { key: 'equipements', label: 'Équipements', icon: '⚽' },
    { key: 'cours', label: 'Cours', icon: '🎓' }
  ];

  const totalReservations = reservations.terrains.length + reservations.equipements.length + reservations.cours.length;
  const reservationsActives = [
    ...reservations.terrains.filter(r => r.reservation_statut === 'confirmee'),
    ...reservations.equipements.filter(r => r.reservation_statut === 'confirmee'),
    ...reservations.cours.filter(r => r.reservation_statut === 'confirmee')
  ].length;

  if (!auth.user) {
    return (
      <Layout>
        <TopNav middleContent="Mes réservations" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Vous devez être connecté pour voir vos réservations
          </Text>
          <Button
            text="Se connecter"
            onPress={() => navigation.navigate("Auth")}
          />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNav
        middleContent="Mes réservations"
        rightContent={
          <TouchableOpacity onPress={refetch}>
            <Ionicons
              name="refresh"
              size={20}
              color={isDarkmode ? themeColor.white100 : themeColor.dark}
            />
          </TouchableOpacity>
        }
        rightAction={refetch}
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 20 }}>
          {/* Statistiques */}
          <Section>
            <SectionContent>
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E3F2FD', borderRadius: 8 }}>
                  <Text fontWeight="bold" style={{ color: '#1976D2' }}>📊 Total</Text>
                  <Text size="xl" fontWeight="bold">{totalReservations}</Text>
                  <Text size="sm">réservations</Text>
                </View>
                
                <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E8F5E8', borderRadius: 8 }}>
                  <Text fontWeight="bold" style={{ color: '#388E3C' }}>✅ Actives</Text>
                  <Text size="xl" fontWeight="bold">{reservationsActives}</Text>
                  <Text size="sm">confirmées</Text>
                </View>
              </View>

              {/* Répartition par type */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, padding: 10, backgroundColor: isDarkmode ? '#1A1A20' : '#F8F9FA', borderRadius: 6 }}>
                  <Text fontWeight="bold" style={{ color: '#666', textAlign: 'center' }}>🏟️ {reservations.terrains.length}</Text>
                </View>
                <View style={{ flex: 1, padding: 10, backgroundColor: isDarkmode ? '#1A1A20' : '#F8F9FA', borderRadius: 6 }}>
                  <Text fontWeight="bold" style={{ color: '#666', textAlign: 'center' }}>⚽ {reservations.equipements.length}</Text>
                </View>
                <View style={{ flex: 1, padding: 10, backgroundColor: isDarkmode ? '#1A1A20' : '#F8F9FA', borderRadius: 6 }}>
                  <Text fontWeight="bold" style={{ color: '#666', textAlign: 'center' }}>🎓 {reservations.cours.length}</Text>
                </View>
              </View>
            </SectionContent>
          </Section>

          {/* Onglets */}
          <Section>
            <SectionContent>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                  {tabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key as any)}
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: activeTab === tab.key 
                          ? (isDarkmode ? themeColor.primary200 : themeColor.primary600)
                          : (isDarkmode ? '#2A2A30' : '#F5F5F5'),
                        borderWidth: 1,
                        borderColor: activeTab === tab.key 
                          ? themeColor.primary600 
                          : 'transparent'
                      }}
                    >
                      <Text
                        style={{
                          color: activeTab === tab.key 
                            ? 'white' 
                            : (isDarkmode ? themeColor.white100 : themeColor.dark),
                          fontWeight: activeTab === tab.key ? 'bold' : 'normal'
                        }}
                      >
                        {tab.icon} {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </SectionContent>
          </Section>

          {loading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>Chargement des réservations...</Text>
            </View>
          )}

          {error && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#F44336', textAlign: 'center' }}>
                Erreur: {error}
              </Text>
            </View>
          )}

          {/* Réservations de terrains */}
          {(activeTab === 'all' || activeTab === 'terrains') && (
            <Section>
              <SectionContent>
                <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                  🏟️ Terrains ({reservations.terrains.length})
                </Text>

                {reservations.terrains.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                    Aucune réservation de terrain
                  </Text>
                ) : (
                  reservations.terrains.map((reservation, index) => (
                    <View
                      key={`terrain-${index}`}
                      style={{
                        padding: 15,
                        marginBottom: 10,
                        backgroundColor: isDarkmode ? '#2A2A30' : '#FFFFFF',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDarkmode ? '#333' : '#E0E0E0',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text fontWeight="bold" size="lg">
                            {reservation.terrain?.terrain_type?.toUpperCase() || 'Terrain'}
                          </Text>
                          <Text style={{ color: '#666', marginVertical: 4 }}>
                            📍 {reservation.terrain?.terrain_localisation}
                          </Text>
                          <Text style={{ color: '#666' }}>
                            📅 {formatDate(reservation.date_reservation)}
                          </Text>
                        </View>
                        
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: getStatusColor(reservation.reservation_statut),
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                            {getStatusIcon(reservation.reservation_statut)} {reservation.reservation_statut}
                          </Text>
                        </View>
                      </View>

                      {reservation.reservation_statut === 'confirmee' && (
                        <Button
                          text="Annuler"
                          size="sm"
                          status="danger"
                          outline={true}
                          onPress={() => handleCancelTerrainReservation(reservation.terrain_id)}
                          style={{ marginTop: 10 }}                        />
                      )}                    </View>
                  ))
                )}
              </SectionContent>
            </Section>
          )}

          {/* Réservations d'équipements */}
          {(activeTab === 'all' || activeTab === 'equipements') && (
            <Section>
              <SectionContent>
                <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                  ⚽ Équipements ({reservations.equipements.length})
                </Text>

                {reservations.equipements.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                    Aucune réservation d'équipement
                  </Text>
                ) : (
                  reservations.equipements.map((reservation, index) => (
                    <View
                      key={`equipement-${index}`}
                      style={{
                        padding: 15,
                        marginBottom: 10,
                        backgroundColor: isDarkmode ? '#2A2A30' : '#FFFFFF',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDarkmode ? '#333' : '#E0E0E0',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text fontWeight="bold" size="lg">
                            {reservation.equipement?.equipement_nom}
                          </Text>
                          <Text style={{ color: '#666', marginVertical: 4 }}>
                            📋 {reservation.equipement?.equipement_description}
                          </Text>
                          <Text style={{ color: '#666' }}>
                            📅 {formatDate(reservation.date_reservation)}
                          </Text>
                        </View>
                        
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: getStatusColor(reservation.reservation_statut),
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                            {getStatusIcon(reservation.reservation_statut)} {reservation.reservation_statut}
                          </Text>
                        </View>
                      </View>

                      {reservation.reservation_statut === 'confirmee' && (
                        <Button
                          text="Annuler"
                          size="sm"
                          status="danger"
                          outline={true}
                          onPress={() => handleCancelEquipementReservation(reservation.equipement_id)}
                          style={{ marginTop: 10 }}
                        />
                      )}
                    </View>
                  ))
                )}
              </SectionContent>
            </Section>
          )}

          {/* Inscriptions aux cours */}
          {(activeTab === 'all' || activeTab === 'cours') && (
            <Section>
              <SectionContent>
                <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                  🎓 Cours ({reservationsData.cours.length})
                </Text>

                {reservationsData.cours.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                    Aucune inscription à un cours
                  </Text>
                ) : (
                  reservationsData.cours.map((reservation: any, index: number) => (
                    <View
                      key={`cours-${index}`}
                      style={{
                        padding: 15,
                        marginBottom: 10,
                        backgroundColor: isDarkmode ? '#2A2A30' : '#FFFFFF',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDarkmode ? '#333' : '#E0E0E0',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text fontWeight="bold" size="lg">
                            {reservation.cours?.cours_nom}
                          </Text>
                          <Text style={{ color: '#666', marginVertical: 4 }}>
                            💰 {reservation.cours?.cours_tarif}€
                          </Text>
                          <Text style={{ color: '#666' }}>
                            📅 {reservation.cours?.cours_date ? formatDate(reservation.cours.cours_date) : 'Date non définie'}
                          </Text>
                        </View>
                        
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: getStatusColor(reservation.reservation_statut),
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                            {getStatusIcon(reservation.reservation_statut)} {reservation.reservation_statut}
                          </Text>
                        </View>
                      </View>

                      {reservation.reservation_statut === 'confirmee' && (
                        <Button
                          text="Se désinscrire"
                          size="sm"
                          status="danger"
                          outline={true}
                          onPress={() => handleCancelCoursEnrollment(reservation.cours_id)}
                          style={{ marginTop: 10 }}
                        />
                      )}
                    </View>
                  ))
                )}
              </SectionContent>
            </Section>
          )}

          {/* Actions rapides */}
          <Section>
            <SectionContent>
              <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                🚀 Actions rapides
              </Text>
              
              <View style={{ gap: 10 }}>
                <Button
                  leftContent={<Ionicons name="add-circle" size={20} color="white" />}
                  text="Nouvelle réservation"
                  onPress={() => navigation.navigate("CreateReservation")}
                />
                
                <Button
                  leftContent={<Ionicons name="home" size={20} color="white" />}
                  text="Retour à l'accueil"
                  status="info"
                  onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
                />
              </View>
            </SectionContent>
          </Section>
        </View>
      </ScrollView>
    </Layout>
  );
}
