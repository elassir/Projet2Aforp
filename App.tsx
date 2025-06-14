import { StatusBar } from "expo-status-bar";
import React from "react";
import { ThemeProvider } from "react-native-rapi-ui";
import Navigation from "./src/navigation";
import { AuthProviderHybrid } from "./src/provider/AuthProviderHybrid";

export default function App() {
  const images = [
    require("./assets/images/login.png"),
    require("./assets/images/register.png"),
    require("./assets/images/forget.png"),
  ];
  return (
    <ThemeProvider images={images}>
      <AuthProviderHybrid>
        <Navigation />
      </AuthProviderHybrid>
      <StatusBar />
    </ThemeProvider>
  );
}
