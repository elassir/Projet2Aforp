import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgetPassword: undefined;
};

export type MainStackParamList = {
  HomeSQL: undefined;
  CoursScreenSQL: undefined;
  ReservationsScreenSQL: undefined;
  CreateReservation: undefined;
  Profile: undefined;
  // Ajouts pour compatibilité avec NavigationTabsSQL
  MainTabs: undefined;
  TerrainsScreenSQL: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Reservations: undefined;
  Courses: undefined;
  Equipment: undefined;
  Profile: undefined;
  Admin: undefined;
  MainTabs: undefined;
  SecondScreen: undefined;
  CreateReservation: undefined;
  AdminPanel: undefined;
  ManageTerrains: undefined;
  ManageEquipment: undefined;
};

// Types de navigation manquants
export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type MainTabsNavigationProp = BottomTabNavigationProp<MainTabsParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
