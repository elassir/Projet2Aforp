import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type MainStackParamList = {
	MainTabs: undefined;
	SecondScreen: undefined;
	// Réservations
	ReservationDetail: { reservationId: string };
	CreateReservation: undefined;
	// Cours
	CourseDetail: { courseId: string };
	// Équipements
	EquipmentDetail: { equipmentId: string };
	// Admin
	AdminPanel: undefined;
	ManageTerrains: undefined;
	ManageCourses: undefined;
	ManageEquipment: undefined;
};

export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgetPassword: undefined;
};

export type MainTabsParamList = {
	Home: undefined;
	Reservations: undefined;
	Courses: undefined;
	Equipment: undefined;
	Terrains: undefined;
	Profile: undefined;
	Admin?: undefined; // Visible seulement pour les admins
};

export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type MainTabsNavigationProp = BottomTabNavigationProp<MainTabsParamList>;
