import React from "react";
import { ThemeProvider } from "react-native-rapi-ui";
import { AuthProviderHybrid } from "./src/provider/AuthProviderHybrid";
import NavigationSQL from "./src/navigation/NavigationSQL";

export default function AppSQL() {
  return (
    <ThemeProvider>
      <AuthProviderHybrid>
        <NavigationSQL />
      </AuthProviderHybrid>
    </ThemeProvider>
  );
}
