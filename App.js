import "./global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NavigationContainer,
  DefaultTheme,
} from "@react-navigation/native";

import { db } from "./database/database";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  StatusBar,
} from "expo-status-bar";

import {
  useEffect,
} from "react";

// DATABASE
import {
  initDatabase,
  clearDatabase
} from "./database/initDatabase";

import {
  getDataFromDatabase,
} from "./database/database";



// SCREENS
import ProjectScreen from "./screens/ProjectScreen";

import AddProjectScreen from "./screens/AddProjectScreen";

import AreaScreen from "./screens/AreaScreen";

import AddAreaScreen from "./screens/AddAreaScreen";

import SensorScreen from "./screens/SensorScreen";

import QRScanner from "./screens/QRScanner";

import ScannedData from "./screens/ScannedData";

import DataSeed from "./screens/DataSeed";


import SyncLocally from "./screens/SyncLocally";


const Stack =
  createNativeStackNavigator();


// CUSTOM LIGHT THEME
const MyTheme = {

  ...DefaultTheme,

  colors: {

    ...DefaultTheme.colors,

    primary: "#0F9BA8",

    background: "#EEF3F4",

    card: "#FFFFFF",

    text: "#111827",

    border: "#E5E7EB",

    notification: "#0F9BA8",
  },
};

export default function App() {

  
useEffect(() => {
  const setupDatabase = async () => {
    // console.log("Clearing DB...");
    // await clearDatabase();

    console.log("Initializing DB...");
    await initDatabase();

    // console.log("Fetching Data...");
    // await getDataFromDatabase();

    console.log("Database Ready");
  };

  setupDatabase();
}, []);

return (
  <GestureHandlerRootView style={{ flex: 1 }}>

    <NavigationContainer
      theme={MyTheme}
    >

      {/* STATUS BAR */}
      <StatusBar
        style="dark"
      />

      <Stack.Navigator

        screenOptions={{

          // HEADER STYLE
          headerStyle: {
            backgroundColor: "#EEF3F4",
          },

          // TITLE COLOR
          headerTintColor: "#111827",

          // TITLE STYLE
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },

          // HEADER SHADOW REMOVE
          headerShadowVisible: false,

          // SCREEN BACKGROUND
          contentStyle: {
            backgroundColor: "#EEF3F4",
          },

          // SMOOTH TRANSITION
          animation: "slide_from_right",

          // HEADER ALIGN
          headerTitleAlign: "center",
        }}
      >
 

        {/* <Stack.Screen
        name="DataSeed"
        component={DataSeed}
        options={{
            title: "DataSeed",
          }}
        /> */}

        {/* PROJECTS */}
        <Stack.Screen
          name="ProjectScreen"
          component={ProjectScreen}

          options={{
            title: "Projects",
          }}
        />

        {/* ADD PROJECT */}

        
        <Stack.Screen
          name="AddProjectScreen"
          component={AddProjectScreen}

          options={{
            title: "New Project",
          }}
        />

        {/* AREAS */}
        <Stack.Screen
          name="AreaScreen"
          component={AreaScreen}

          options={{
            title: "Areas",
          }}
        />

        {/* ADD AREA */}
        <Stack.Screen
          name="AddAreaScreen"
          component={AddAreaScreen}

          options={{
            title: "New Area",
          }}
        />

        {/* SENSORS */}
        <Stack.Screen
          name="SensorScreen"
          component={SensorScreen}

          options={{
            title: "Sensors",
          }}
        />

        {/* QR SCANNER */}
        <Stack.Screen
          name="QRScanner"
          component={QRScanner}

          options={{
            title: "QR Scanner",
          }}
        />

        {/* SCANNED DATA */}
        <Stack.Screen
          name="ScannedData"
          component={ScannedData}

          options={{
            title: "Sensor Data",
          }}
        />

        {/* CLOUD SYNC */}
        

        {/* LOCAL SYNC */}
        <Stack.Screen
          name="SyncLocally"
          component={SyncLocally}

          options={{
            title: "Local Sync",
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>
    </GestureHandlerRootView>

  );
}