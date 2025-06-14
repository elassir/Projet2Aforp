import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from 'react-native-rapi-ui';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import du nouveau provider hybride
import { AuthProviderHybrid, useAuthHybrid } from './src/provider/AuthProviderHybrid';

// Écrans d'authentification
import LoginHybridScreen from './src/screens/auth/LoginHybrid';
import RegisterHybridScreen from './src/screens/auth/RegisterHybrid';
import ForgetPasswordScreen from './src/screens/auth/ForgetPassword';

// Écrans principaux
import HomeScreen from './src/screens/HomeSQL';
import ProfileScreen from './src/screens/Profile';
import CoursesScreen from './src/screens/courses/CoursScreenSQL';
import ReservationsScreen from './src/screens/reservations/ReservationsScreenSQL';
import CreateReservationScreen from './src/screens/reservations/CreateReservationScreen';

// Types de navigation
import { AuthStackParamList, MainStackParamList } from './src/types/navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginHybridScreen} />
      <AuthStack.Screen name="Register" component={RegisterHybridScreen} />
      <AuthStack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="HomeSQL" component={HomeScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="CoursScreenSQL" component={CoursesScreen} />
      <MainStack.Screen name="ReservationsScreenSQL" component={ReservationsScreen} />
      <MainStack.Screen name="CreateReservation" component={CreateReservationScreen} />
    </MainStack.Navigator>
  );
}

function AppContent() {
  const { isDarkmode, setTheme } = useTheme();
  const { isAuthenticated, loading } = useAuthHybrid();

  if (loading) {
    // Vous pouvez afficher un écran de chargement ici
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkmode ? 'light' : 'dark'} />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  const images = [
    require('./assets/images/login.png'),
    require('./assets/images/register.png'),
    require('./assets/images/forget.png'),
  ];

  return (
    <ThemeProvider images={images}>
      <AuthProviderHybrid>
        <AppContent />
      </AuthProviderHybrid>
    </ThemeProvider>
  );
}

/*
INSTRUCTIONS D'UTILISATION :

1. Remplacez votre App.tsx actuel par ce fichier (ou adaptez selon vos besoins)

2. Assurez-vous que votre table 'users' dans Supabase a la structure suivante :
   ```sql
   CREATE TABLE users (
     user_id SERIAL PRIMARY KEY,
     user_email TEXT UNIQUE NOT NULL,
     user_nom TEXT,
     user_prenom TEXT,
     user_role TEXT DEFAULT 'user',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. Configurez les policies RLS (Row Level Security) dans Supabase :
   ```sql
   -- Permettre la lecture des profils authentifiés
   CREATE POLICY "Utilisateurs peuvent voir leur profil"
   ON users FOR SELECT
   USING (auth.email() = user_email);

   -- Permettre la création de profils lors de l'inscription
   CREATE POLICY "Permettre l'insertion lors de l'inscription"
   ON users FOR INSERT
   WITH CHECK (auth.email() = user_email);

   -- Permettre la mise à jour de son propre profil
   CREATE POLICY "Utilisateurs peuvent modifier leur profil"
   ON users FOR UPDATE
   USING (auth.email() = user_email);
   ```

4. Activez RLS sur la table :
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ```

5. Dans votre interface Supabase :
   - Allez dans Authentication > Settings
   - Vérifiez que l'authentification par email est activée
   - Configurez les redirections si nécessaire

6. Testez l'inscription et la connexion avec les nouveaux écrans
*/
