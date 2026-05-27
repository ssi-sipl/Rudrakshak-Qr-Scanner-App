import "./global.css";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DarkTheme,
} from "@react-navigation/native";
import { useEffect } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import QRScanner from "./screens/QRScanner";
import ScannedData from "./screens/ScannedData";
import SyncData from "./screens/SyncData"
import SynLocally from "./screens/SyncLocally"
import SyncLocally from "./screens/SyncLocally";
import { initDatabase } from "./database/initDatabase";
import { getDataFromDatabase } from "./database/database";

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DarkTheme,

  colors: {
    ...DarkTheme.colors,

    primary: "#38bdf8",
    background: "#020617",
    card: "#0f172a",
    text: "#e2e8f0",
    border: "#1e293b",
    notification: "#0ea5e9",
  },
};

export default function App() {

  useEffect(()=>
    {
      initDatabase();
      getDataFromDatabase();
    },[])
  
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="light" />

      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0f172a",
          },

          headerTintColor: "#38bdf8",

          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },

          contentStyle: {
            backgroundColor: "#020617",
          },

          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        
        />

        <Stack.Screen
          name="SyncLocally"
          component = {SyncLocally}
        />

        <Stack.Screen
          name="QRScanner"
          component={QRScanner}
          options={{
            title: "Scanner Core",
          }}
        />

        <Stack.Screen
          name="ScannedData"
          component={ScannedData}
          options={{
            title: "Scanned Data",
          }}
        />

        <Stack.Screen 
        name="SyncData"
        component={SyncData}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}