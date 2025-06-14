import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { themeColor, useTheme } from "react-native-rapi-ui";
import TabBarIcon from "../components/utils/TabBarIcon";
import TabBarText from "../components/utils/TabBarText";
import { ParamListBase } from "@react-navigation/native";

// Importation des écrans avec des wrappeurs pour résoudre les problèmes de typage
// Ajout d'un composant de test pour débogage
import { View, Text } from "react-native";

const TestScreen = (props: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Écran de test
      </Text>
      <Text>
        Si vous voyez ce texte, la navigation fonctionne correctement.
      </Text>
    </View>
  );
};

const HomeScreen = (props: any) => {
  try {
    const Home = require("../screens/Home").default;
    return <Home {...props} />;
  } catch (error) {
    console.error("Erreur lors du chargement de Home:", error);
    return <TestScreen {...props} />;
  }
};

const ProfileScreen = (props: any) => {
  const Profile = require("../screens/Profile").default;
  return <Profile {...props} />;
};

const ReservationsScreenWrapper = (props: any) => {
  const ReservationsScreen = require("../screens/reservations/ReservationsScreen").default;
  return <ReservationsScreen {...props} />;
};

const CoursesScreenWrapper = (props: any) => {
  const CoursesScreen = require("../screens/courses/CoursesScreen").default;
  return <CoursesScreen {...props} />;
};

const EquipmentScreenWrapper = (props: any) => {
  const EquipmentScreen = require("../screens/equipment/EquipmentScreen").default;
  return <EquipmentScreen {...props} />;
};

const TerrainsScreenWrapper = (props: any) => {
  const TerrainsScreen = require("../screens/terrains/TerrainsScreen").default;
  return <TerrainsScreen {...props} />;
};

// Création du navigateur sans générique pour éviter les erreurs de types
const Tab = createBottomTabNavigator();

export default function TabsNavigation() {
  const { isDarkmode } = useTheme();
  return (    <Tab.Navigator
      initialRouteName="Home" // Utiliser Home comme écran initial après débogage
      screenOptions={{
        headerShown: true, // Afficher les en-têtes pour voir les titres des écrans
        tabBarStyle: {
          borderTopColor: isDarkmode ? themeColor.dark100 : "#c0c0c0",
          backgroundColor: isDarkmode ? themeColor.dark200 : "#ffffff",
        },
      }}
    >      {/* Accueil */}      
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Accueil" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"home"} />
          ),
        }}
      />
      
      {/* Écran de Test - Placé après Home */}
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          title: "Test", // Définir un titre explicite
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Test" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"bug"} />
          ),
        }}
      />
      
      {/* Réservations */}
      <Tab.Screen
        name="Reservations"
        component={ReservationsScreenWrapper}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Réservations" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"calendar"} />
          ),
        }}
      />
      
      {/* Cours */}
      <Tab.Screen
        name="Courses"
        component={CoursesScreenWrapper}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Cours" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"school"} />
          ),
        }}
      />
      
      {/* Équipement */}
      <Tab.Screen
        name="Equipment"
        component={EquipmentScreenWrapper}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Équipement" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"fitness"} />
          ),
        }}
      />
      
      {/* Terrains */}
      <Tab.Screen
        name="Terrains"
        component={TerrainsScreenWrapper}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Terrains" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"basketball"} />
          ),
        }}
      />
      
      {/* Profil */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Profil" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"person"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
