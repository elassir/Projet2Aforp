import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthHybrid } from '../src/provider/AuthProviderHybrid';

// Importez vos écrans ici - Ajustement des chemins
import HomeSQL from '../src/screens/HomeSQL';
import LoginSQL from '../screens/LoginSQL';

const Stack = createNativeStackNavigator();

function Navigation() {
  // Utilise useAuthHybrid à l'intérieur du provider
  const { isAuthenticated, loading } = useAuthHybrid();

  if (loading) {
    // Afficher un écran de chargement si nécessaire
    return <LoadingScreen />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          // Routes authentifiées
          <Stack.Screen name="HomeSQL" component={HomeSQL} />
        ) : (
          // Routes non authentifiées
          <Stack.Screen name="LoginSQL" component={LoginSQL} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Composant principal - plus besoin d'envelopper dans un provider
export default function NavigationSQL() {
  return <Navigation />;
}

// Composant simple de chargement
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chargement...</Text>
    </View>
  );
}
