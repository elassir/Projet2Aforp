import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Utilisation de notre nouveau TabsNavigation en remplacement de MainTabs
import TabsNavigation from "./TabsNavigation";

// Utilisation de wrappeurs pour résoudre les problèmes de typage
const SecondScreenWrapper = (props: any) => {
  const SecondScreen = require("../screens/SecondScreen").default;
  return <SecondScreen {...props} />;
};

const CreateReservationScreenWrapper = (props: any) => {
  const CreateReservationScreen = require("../screens/reservations/CreateReservationScreen").default;
  return <CreateReservationScreen {...props} />;
};

const CourseDetailScreenWrapper = (props: any) => {
  const CourseDetailScreen = require("../screens/courses/CourseDetailScreen").default;
  return <CourseDetailScreen {...props} />;
};

const EquipmentDetailScreenWrapper = (props: any) => {
  const EquipmentDetailScreen = require("../screens/equipment/EquipmentDetailScreen").default;
  return <EquipmentDetailScreen {...props} />;
};
// Suppression du typage générique pour éviter les erreurs
const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: true, // Afficher les en-têtes pour déboguer
      }}
    >      
      <MainStack.Screen 
        name="MainTabs" 
        component={TabsNavigation}
        options={{ 
          title: "Navigation principale",
          headerLargeTitle: true
        }} 
      />
      <MainStack.Screen name="SecondScreen" component={SecondScreenWrapper} />
      
      {/* Écrans de détail et de création */}
      <MainStack.Screen name="CreateReservation" component={CreateReservationScreenWrapper} />
      <MainStack.Screen name="CourseDetail" component={CourseDetailScreenWrapper} />
      <MainStack.Screen name="EquipmentDetail" component={EquipmentDetailScreenWrapper} />
    </MainStack.Navigator>
  );
};

export default Main;
