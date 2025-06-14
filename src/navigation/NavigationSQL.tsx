import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthHybrid } from "../provider/AuthProviderHybrid";
import { useTheme } from "react-native-rapi-ui";
import { AuthStackParamList, MainStackParamList } from "../types/navigation";

// Screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ForgetPassword from "../screens/auth/ForgetPassword";
import HomeSQL from "../screens/HomeSQL";
import CoursScreenSQL from "../screens/courses/CoursScreenSQL";
import ReservationsScreenSQL from "../screens/reservations/ReservationsScreenSQL";
import CreateReservationScreen from "../screens/reservations/CreateReservationScreen";
import Profile from "../screens/Profile";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Composant de chargement
function LoadingScreen() {
  const { isDarkmode } = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center",
      backgroundColor: isDarkmode ? "#1a1a1a" : "#ffffff"
    }}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={{ 
        marginTop: 10,
        color: isDarkmode ? "#ffffff" : "#000000"
      }}>
        Chargement...
      </Text>
    </View>
  );
}

const Auth = () => {
  const { isDarkmode } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: isDarkmode ? "light" : "dark",
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
    </AuthStack.Navigator>
  );
};

const Main = () => {
  const { isDarkmode } = useTheme();
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: isDarkmode ? "light" : "dark",
      }}
    >
      <MainStack.Screen name="HomeSQL" component={HomeSQL} />
      <MainStack.Screen name="CoursScreenSQL" component={CoursScreenSQL} />
      <MainStack.Screen name="ReservationsScreenSQL" component={ReservationsScreenSQL} />
      <MainStack.Screen name="CreateReservation" component={CreateReservationScreen} />
      <MainStack.Screen name="Profile" component={Profile} />
    </MainStack.Navigator>
  );
};

export default function NavigationSQL() {
  const { isAuthenticated, loading } = useAuthHybrid();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <Main /> : <Auth />}
    </NavigationContainer>
  );
}
