import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SecondScreen from "../screens/SecondScreen";
import MainTabs from "./MainTabs";

// Écrans de détails et de création (pas dans les onglets)
import CreateReservationScreen from "../screens/reservations/CreateReservationScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen";
import EquipmentDetailScreen from "../screens/equipment/EquipmentDetailScreen";
import { MainStackParamList } from "../types/navigation";

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="SecondScreen" component={SecondScreen} />
      
      {/* Écrans de détail et de création */}
      <MainStack.Screen name="CreateReservation" component={CreateReservationScreen} />
      <MainStack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <MainStack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
    </MainStack.Navigator>
  );
};

export default Main;
