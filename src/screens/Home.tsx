import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
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

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

export default function Home({ navigation }: HomeScreenProps) {
  const { isDarkmode, setTheme } = useTheme();
  const auth = useAuthHybrid();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Récupérer les infos du profil utilisateur
    if (auth.user) {
      setUserProfile(auth.user);
    }
  }, [auth.user]);

  const quickActions = [
    {
      title: "Réserver un terrain",
      subtitle: "Tennis, Football, Basketball...",
      icon: "golf",
      color: "#4CAF50",
      action: () => navigation.navigate("CreateReservation")
    },    {
      title: "Mes réservations",
      subtitle: "Voir mes réservations",
      icon: "calendar",
      color: "#2196F3",
      action: () => navigation.navigate("Reservations")
    },
    {
      title: "Cours disponibles",
      subtitle: "S'inscrire aux cours",
      icon: "people",
      color: "#FF9800",
      action: () => navigation.navigate("Courses")
    },
    {
      title: "Équipements",
      subtitle: "Louer du matériel",
      icon: "fitness",
      color: "#9C27B0",
      action: () => navigation.navigate("Equipment")
    }
  ];

  return (
    <Layout>
      <TopNav
        middleContent="Centre Sportif"
        rightContent={
          <Ionicons
            name={isDarkmode ? "sunny" : "moon"}
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
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
      
      <ScrollView style={{ flex: 1 }}>
        {/* Section de bienvenue */}
        <Section style={{ marginTop: 20 }}>
          <SectionContent>
            <Text size="xl" fontWeight="bold" style={{ marginBottom: 10 }}>
              Bonjour {userProfile?.user_metadata?.first_name || "Utilisateur"} ! 👋
            </Text>
            <Text style={{ opacity: 0.7 }}>
              Bienvenue au Centre Sportif. Que souhaitez-vous faire aujourd'hui ?
            </Text>
          </SectionContent>
        </Section>

        {/* Actions rapides */}
        <Section style={{ marginTop: 20 }}>          <SectionContent>
            <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
              Actions rapides
            </Text>
            
            <View style={{ 
              flexDirection: "row", 
              flexWrap: "wrap", 
              justifyContent: "space-between" 
            }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: "48%",
                    backgroundColor: isDarkmode ? themeColor.dark200 : themeColor.white,
                    borderRadius: 12,
                    padding: 15,
                    marginBottom: 15,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={action.action}
                >
                  <View style={{ 
                    alignItems: "center",
                    marginBottom: 10
                  }}>
                    <View style={{
                      backgroundColor: action.color,
                      borderRadius: 25,
                      width: 50,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8
                    }}>
                      <Ionicons 
                        name={action.icon as any} 
                        size={24} 
                        color="white" 
                      />
                    </View>
                    <Text fontWeight="bold" size="md" style={{ textAlign: "center" }}>
                      {action.title}
                    </Text>
                    <Text size="sm" style={{ 
                      textAlign: "center", 
                      opacity: 0.7,
                      marginTop: 4
                    }}>
                      {action.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </SectionContent>
        </Section>

        {/* Statistiques rapides */}        <Section style={{ marginTop: 10 }}>
          <SectionContent>
            <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
              Mes activités
            </Text>
            
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-around",
              backgroundColor: isDarkmode ? themeColor.dark200 : themeColor.white100,
              borderRadius: 12,
              padding: 20
            }}>              <View style={{ alignItems: "center" }}>
                <Text size="xl" fontWeight="bold" style={{ color: themeColor.primary }}>
                  3
                </Text>
                <Text size="sm" style={{ opacity: 0.7 }}>
                  Réservations
                </Text>
              </View>              <View style={{ alignItems: "center" }}>
                <Text size="xl" fontWeight="bold" style={{ color: themeColor.primary }}>
                  2
                </Text>
                <Text size="sm" style={{ opacity: 0.7 }}>
                  Cours actifs
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text size="xl" fontWeight="bold" style={{ color: themeColor.primary }}>
                  150€
                </Text>
                <Text size="sm" style={{ opacity: 0.7 }}>
                  Ce mois
                </Text>
              </View>
            </View>
          </SectionContent>
        </Section>

        {/* Section déconnexion */}
        <Section style={{ marginTop: 20, marginBottom: 40 }}>
          <SectionContent>
            <Button
              status="danger"
              text="Se déconnecter"
              onPress={() => {
                Alert.alert(
                  "Déconnexion",
                  "Voulez-vous vraiment vous déconnecter ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {                      text: "Déconnexion", 
                      style: "destructive",
                      onPress: auth.logout
                    }
                  ]
                );
              }}
            />
          </SectionContent>
        </Section>
      </ScrollView>
    </Layout>
  );
}
