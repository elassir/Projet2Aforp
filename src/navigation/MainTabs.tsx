// Ce fichier est maintenant remplacé par TabsNavigation.tsx
// Il est conservé uniquement pour éviter les erreurs d'import dans d'autres fichiers

import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Créer un composant dummy pour chaque écran
const DummyScreen = (props: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Ce module est désactivé</Text>
  </View>
);

// Créer un navigateur sans typage pour éviter les erreurs
const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Dummy" component={DummyScreen} />
    </Tabs.Navigator>
  );
};

export default MainTabs;
