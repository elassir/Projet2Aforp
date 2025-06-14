import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { MainTabsParamList } from "../types/navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useAuthHybrid } from "../provider/AuthProviderHybrid";
import {
  Layout,
  Button,
  Text,
  TopNav,
  Section,
  SectionContent,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../types/navigation";
import { useStatsSQL, useUserReservationsSQL } from "../hooks/useSQL";

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

export default function HomeSQL({ navigation }: any) {
  const { isDarkmode, setTheme } = useTheme();
  const auth = useAuthHybrid();

  const handleLogout = () => {
    auth?.logout();
  };

  const { stats, loading: statsLoading, refetch: refetchStats } = useStatsSQL();
  const { reservations, loading: reservationsLoading, refetch: refetchReservations } = useUserReservationsSQL(auth?.user?.email || '');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchReservations()]);
    setRefreshing(false);
  };

  const isAdmin = auth?.user?.user_role === 'admin';

  // Statistiques pour les admins
  const AdminDashboard = () => (
    <View>
      <Section>
        <SectionContent>
          <Text fontWeight="bold" size="lg" style={{ marginBottom: 15 }}>
            🔧 Tableau de bord administrateur
          </Text>
          
          {/* Statistiques générales */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 150, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E3F2FD', borderRadius: 8 }}>
              <Text fontWeight="bold" style={{ color: '#1976D2' }}>👥 Utilisateurs</Text>
              <Text size="xl" fontWeight="bold">{stats.users.totalUsers}</Text>
              <Text size="sm">Clients: {stats.users.totalClients}</Text>
            </View>
            
            <View style={{ flex: 1, minWidth: 150, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E8F5E8', borderRadius: 8 }}>
              <Text fontWeight="bold" style={{ color: '#388E3C' }}>🏟️ Terrains</Text>
              <Text size="xl" fontWeight="bold">{stats.terrains.totalTerrains}</Text>
              <Text size="sm">Disponibles: {stats.terrains.terrainsDisponibles}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1, minWidth: 150, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#FFF3E0', borderRadius: 8 }}>
              <Text fontWeight="bold" style={{ color: '#F57C00' }}>⚽ Équipements</Text>
              <Text size="xl" fontWeight="bold">{stats.equipements.totalEquipements}</Text>
              <Text size="sm">Disponibles: {stats.equipements.equipementsDisponibles}</Text>
            </View>
            
            <View style={{ flex: 1, minWidth: 150, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#F3E5F5', borderRadius: 8 }}>
              <Text fontWeight="bold" style={{ color: '#7B1FA2' }}>🎓 Cours</Text>
              <Text size="xl" fontWeight="bold">{stats.cours.totalCours}</Text>
              <Text size="sm">Taux: {stats.cours.tauxOccupation}%</Text>
            </View>
          </View>

          <View style={{ marginTop: 15, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#FAFAFA', borderRadius: 8 }}>
            <Text fontWeight="bold" style={{ marginBottom: 10 }}>📊 Réservations actives</Text>
            <Text>Terrains: {stats.reservations.totalReservationsTerrains}</Text>
            <Text>Équipements: {stats.reservations.totalReservationsEquipements}</Text>
            <Text>Cours: {stats.reservations.totalInscriptionsCours}</Text>
            <Text style={{ color: '#FF9800' }}>En attente: {stats.reservations.reservationsEnAttente}</Text>
          </View>
        </SectionContent>
      </Section>
    </View>
  );

  // Tableau de bord client
  const ClientDashboard = () => {
    const totalReservations = reservations.terrains.length + reservations.equipements.length + reservations.cours.length;
    const reservationsActives = [
      ...reservations.terrains.filter(r => r.reservation_statut === 'confirmee'),
      ...reservations.equipements.filter(r => r.reservation_statut === 'confirmee'),
      ...reservations.cours.filter(r => r.reservation_statut === 'confirmee')
    ];

    const reservationsData = reservations as {
      terrains: any[];
      equipements: any[];
      cours: any[];
    };

    return (
      <View>
        <Section>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 15 }}>
              🏠 Mes réservations
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E3F2FD', borderRadius: 8 }}>
                <Text fontWeight="bold" style={{ color: '#1976D2' }}>📊 Total</Text>
                <Text size="xl" fontWeight="bold">{totalReservations}</Text>
                <Text size="sm">réservations</Text>
              </View>
              
              <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E8F5E8', borderRadius: 8 }}>
                <Text fontWeight="bold" style={{ color: '#388E3C' }}>✅ Actives</Text>
                <Text size="xl" fontWeight="bold">{reservationsActives.length}</Text>
                <Text size="sm">confirmées</Text>
              </View>
            </View>

            {/* Réservations récentes */}
            <Text fontWeight="bold" style={{ marginBottom: 10 }}>🕒 Récentes</Text>
            
            {/* Cours */}
            {reservationsData.cours.slice(0, 3).map((res: any, index: number) => (
              <View key={`cours-${index}`} style={{ padding: 10, backgroundColor: isDarkmode ? '#2A2A30' : '#F8F9FA', borderRadius: 8, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text fontWeight="bold">🎓 {res.cours?.cours_nom}</Text>
                    <Text size="sm">{res.cours?.cours_date}</Text>
                    <Text size="sm" style={{ color: '#666' }}>{res.cours?.cours_tarif}€</Text>
                  </View>
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 12, 
                    backgroundColor: res.reservation_statut === 'confirmee' ? '#4CAF50' : '#FF9800'
                  }}>
                    <Text size="sm" style={{ color: 'white' }}>{res.reservation_statut}</Text>
                  </View>
                </View>
              </View>
            ))}

            {totalReservations === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: '#666' }}>
                  Aucune réservation pour le moment.{'\n'}
                  Commencez par réserver un terrain ou vous inscrire à un cours !
                </Text>
              </View>            )}
          </SectionContent>
        </Section>
      </View>
    );
  };

  return (
    <Layout>
      <TopNav
        middleContent={`Bonjour ${auth?.user?.user_prenom || 'Utilisateur'} !`}
        rightContent={
          <Ionicons
            name={isDarkmode ? "sunny" : "moon"}
            size={20}
            color={isDarkmode ? themeColor.warning300 : themeColor.dark}
          />
        }
        rightAction={() => {
          if (isDarkmode) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
        }}
      />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text fontWeight="bold" size="xl" style={{ marginBottom: 5 }}>
              Centre Sportif
            </Text>
            <Text style={{ color: isDarkmode ? themeColor.gray200 : themeColor.gray500 }}>
              {isAdmin ? 'Interface administrateur' : 'Gérez vos activités sportives'}
            </Text>
          </View>

          {/* Affichage selon le rôle */}
          {isAdmin ? <AdminDashboard /> : <ClientDashboard />}

          {/* Actions rapides */}
          <Section style={{ marginTop: 20 }}>
            <SectionContent>
              <Text fontWeight="bold" size="lg" style={{ marginBottom: 15 }}>
                🚀 Actions rapides
              </Text>
              
              <View style={{ gap: 10 }}>
                <Button
                  leftContent={<Ionicons name="calendar" size={20} color="white" />}
                  text="Voir toutes mes réservations"
                  onPress={() => navigation.navigate("ReservationsScreenSQL")}
                />
                
                {!isAdmin && (
                  <Button
                    leftContent={<Ionicons name="school" size={20} color="white" />}
                    text="Parcourir les cours"
                    status="success"
                    onPress={() => navigation.navigate("CoursScreenSQL")}
                  />
                )}
              </View>
            </SectionContent>
          </Section>

          {/* Déconnexion */}
          <Section style={{ marginTop: 20 }}>
            <SectionContent>
              <Button
                text="Se déconnecter"
                status="danger"
                onPress={handleLogout}
              />
            </SectionContent>
          </Section>
        </View>
      </ScrollView>
    </Layout>
  );
}
