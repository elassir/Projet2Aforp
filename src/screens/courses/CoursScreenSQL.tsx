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
import { useCoursSQL } from "../../hooks/useSQL";
import { useAuthHybrid } from "../../provider/AuthProviderHybrid";
import { CoursServiceSQL } from "../../services/api/coursServiceSQL";
import { Cours } from "../../types/entitiesSQL";

export default function CoursScreenSQL({ navigation }: any) {
  const { isDarkmode } = useTheme();
  const auth = useAuthHybrid();
  const { cours, loading, error, refetch, loadAvailable } = useCoursSQL();
  const [refreshing, setRefreshing] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (showAvailableOnly) {
      await loadAvailable();
    } else {
      await refetch();
    }
    setRefreshing(false);
  };

  const handleEnrollInCours = async (coursItem: Cours) => {
    if (!auth.user) {
      Alert.alert("Erreur", "Vous devez être connecté pour vous inscrire");
      return;
    }

    Alert.alert(
      "Inscription au cours",
      `Voulez-vous vous inscrire au cours "${coursItem.cours_nom}" ?\n\nTarif: ${coursItem.cours_tarif}€\nDate: ${coursItem.cours_date}`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "S'inscrire", 
          onPress: async () => {
            try {
              await CoursServiceSQL.enrollInCours(coursItem.cours_id, auth.user!.email);
              Alert.alert("Succès", "Inscription réussie !");
              refetch();
            } catch (error) {
              Alert.alert("Erreur", error instanceof Error ? error.message : "Erreur lors de l'inscription");
            }
          }
        }
      ]
    );
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

  const getDifficultyColor = (coursName: string) => {
    if (coursName.toLowerCase().includes('débutant') || coursName.toLowerCase().includes('initiation')) {
      return '#4CAF50';
    }
    if (coursName.toLowerCase().includes('intermédiaire')) {
      return '#FF9800';
    }
    if (coursName.toLowerCase().includes('avancé')) {
      return '#F44336';
    }
    return '#2196F3';
  };

  const getDifficultyLabel = (coursName: string) => {
    if (coursName.toLowerCase().includes('débutant') || coursName.toLowerCase().includes('initiation')) {
      return '🟢 Débutant';
    }
    if (coursName.toLowerCase().includes('intermédiaire')) {
      return '🟡 Intermédiaire';
    }
    if (coursName.toLowerCase().includes('avancé')) {
      return '🔴 Avancé';
    }
    return '🔵 Tous niveaux';
  };

  const getSportIcon = (coursName: string) => {
    if (coursName.toLowerCase().includes('tennis')) return '🎾';
    if (coursName.toLowerCase().includes('football')) return '⚽';
    if (coursName.toLowerCase().includes('basketball')) return '🏀';
    if (coursName.toLowerCase().includes('volleyball')) return '🏐';
    if (coursName.toLowerCase().includes('badminton')) return '🏸';
    if (coursName.toLowerCase().includes('multi-sports')) return '🏆';
    return '🎯';
  };

  return (
    <Layout>
      <TopNav
        middleContent="Cours sportifs"
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
        <View style={{ padding: 20 }}>
          {/* Filtres */}
          <Section>
            <SectionContent>
              <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                🎯 Options d'affichage
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAvailableOnly(false);
                    refetch();
                  }}
                  style={{
                    flex: 1,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: !showAvailableOnly 
                      ? (isDarkmode ? themeColor.primary200 : themeColor.primary600)
                      : (isDarkmode ? '#2A2A30' : '#F5F5F5'),
                    borderWidth: 1,
                    borderColor: !showAvailableOnly 
                      ? themeColor.primary600 
                      : 'transparent'
                  }}
                >
                  <Text
                    style={{
                      color: !showAvailableOnly 
                        ? 'white' 
                        : (isDarkmode ? themeColor.white100 : themeColor.dark),
                      textAlign: 'center',
                      fontWeight: !showAvailableOnly ? 'bold' : 'normal'
                    }}
                  >
                    📚 Tous les cours
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowAvailableOnly(true);
                    loadAvailable();
                  }}
                  style={{
                    flex: 1,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: showAvailableOnly 
                      ? (isDarkmode ? themeColor.success200 : themeColor.success600)
                      : (isDarkmode ? '#2A2A30' : '#F5F5F5'),
                    borderWidth: 1,
                    borderColor: showAvailableOnly 
                      ? themeColor.success600 
                      : 'transparent'
                  }}
                >
                  <Text
                    style={{
                      color: showAvailableOnly 
                        ? 'white' 
                        : (isDarkmode ? themeColor.white100 : themeColor.dark),
                      textAlign: 'center',
                      fontWeight: showAvailableOnly ? 'bold' : 'normal'
                    }}
                  >
                    ✅ Avec places
                  </Text>
                </TouchableOpacity>
              </View>
            </SectionContent>
          </Section>

          {/* Statistiques */}
          <Section>
            <SectionContent>
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E3F2FD', borderRadius: 8 }}>
                  <Text fontWeight="bold" style={{ color: '#1976D2' }}>📊 Total</Text>
                  <Text size="xl" fontWeight="bold">{cours.length}</Text>
                  <Text size="sm">cours</Text>
                </View>
                
                <View style={{ flex: 1, padding: 15, backgroundColor: isDarkmode ? '#2A2A30' : '#E8F5E8', borderRadius: 8 }}>
                  <Text fontWeight="bold" style={{ color: '#388E3C' }}>💰 Tarifs</Text>
                  <Text size="lg" fontWeight="bold">
                    {cours.length > 0 ? `${Math.min(...cours.map(c => c.cours_tarif))}€ - ${Math.max(...cours.map(c => c.cours_tarif))}€` : '0€'}
                  </Text>
                  <Text size="sm">fourchette</Text>
                </View>
              </View>
            </SectionContent>
          </Section>

          {/* Liste des cours */}
          <Section>
            <SectionContent>
              <Text fontWeight="bold" style={{ marginBottom: 15 }}>
                🎓 Cours disponibles ({cours.length})
              </Text>

              {loading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text>Chargement des cours...</Text>
                </View>
              )}

              {error && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#F44336', textAlign: 'center' }}>
                    Erreur: {error}
                  </Text>
                  <Button
                    text="Réessayer"
                    onPress={refetch}
                    style={{ marginTop: 10 }}
                    size="sm"
                  />
                </View>
              )}

              {!loading && !error && cours.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ textAlign: 'center', color: '#666' }}>
                    {showAvailableOnly 
                      ? "Aucun cours avec des places disponibles." 
                      : "Aucun cours trouvé."}
                  </Text>
                </View>
              )}

              {cours.map((coursItem) => (
                <View
                  key={coursItem.cours_id}
                  style={{
                    padding: 15,
                    marginBottom: 15,
                    backgroundColor: isDarkmode ? '#2A2A30' : '#FFFFFF',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDarkmode ? '#333' : '#E0E0E0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {/* En-tête */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text fontWeight="bold" size="lg" style={{ marginBottom: 4 }}>
                        {getSportIcon(coursItem.cours_nom)} {coursItem.cours_nom}
                      </Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: getDifficultyColor(coursItem.cours_nom),
                        alignSelf: 'flex-start',
                        marginBottom: 8
                      }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                          {getDifficultyLabel(coursItem.cours_nom)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 15,
                      backgroundColor: '#4CAF50',
                    }}>
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                        {coursItem.cours_tarif}€
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  {coursItem.cours_description && (
                    <Text style={{ color: '#666', marginBottom: 12, lineHeight: 20 }}>
                      {coursItem.cours_description}
                    </Text>
                  )}

                  {/* Informations pratiques */}
                  <View style={{ 
                    padding: 12, 
                    backgroundColor: isDarkmode ? '#1A1A20' : '#F8F9FA', 
                    borderRadius: 8,
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#666' }}>
                        📅 Date: {formatDate(coursItem.cours_date)}
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#666' }}>
                        👥 Places max: {coursItem.cours_nombre_max}
                      </Text>
                      <Text style={{ color: '#666' }}>
                        🏷️ ID: {coursItem.cours_id}
                      </Text>
                    </View>
                    
                    <Text style={{ color: '#666' }}>
                      ⏰ Fin d'inscription: {formatDate(coursItem.cours_duree)}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button
                      text="S'inscrire"
                      size="sm"
                      onPress={() => handleEnrollInCours(coursItem)}
                      disabled={!auth.user}
                      style={{ flex: 1 }}
                    />
                    
                    <Button
                      text="Détails"
                      size="sm"
                      status="info"
                      outline={true}
                      onPress={() => {
                        Alert.alert(
                          coursItem.cours_nom,
                          `📝 Description: ${coursItem.cours_description || 'Aucune description'}\n\n📅 Date du cours: ${formatDate(coursItem.cours_date)}\n⏰ Fin des inscriptions: ${formatDate(coursItem.cours_duree)}\n👥 Places maximum: ${coursItem.cours_nombre_max}\n💰 Tarif: ${coursItem.cours_tarif}€\n🏷️ ID: ${coursItem.cours_id}`
                        );
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ))}
            </SectionContent>
          </Section>
        </View>
      </ScrollView>
    </Layout>
  );
}
