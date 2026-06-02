import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {Picker} from "@react-native-picker/picker";

import { db } from "../database/database";

export default function AddAreaScreen({ navigation, route }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ROUTE PARAMS
  const { projectId, projectName } = route.params;

  const [areaId, setAreaId] = useState("");

  const [areaName, setAreaName] = useState("");

  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState("");

  const [longitude, setLongitude] = useState("");

  const [status, setStatus] = useState("Active");

  const [addedBy, setAddedBy] = useState("");

  // SCREEN ANIMATION
  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  //Fetch Location
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }

      setLoading(true);

      const startTime = Date.now();

      let bestLocation = null;

      while (true) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const accuracy = location.coords.accuracy;

        console.log("Current Accuracy:", accuracy);

        if (!bestLocation || accuracy < bestLocation.coords.accuracy) {
          bestLocation = location;
        }

        // SUCCESS
        if (accuracy <= 20) {
          setLatitude(location.coords.latitude.toString());

          setLongitude(location.coords.longitude.toString());

          Alert.alert(
            "Location Fetched",
            `Accuracy: ${Math.round(accuracy)} meters`,
          );

          break;
        }

        // 30 SECOND TIMEOUT
        if (Date.now() - startTime > 30000) {
          setLatitude(bestLocation.coords.latitude.toString());

          setLongitude(bestLocation.coords.longitude.toString());

          Alert.alert(
            "Best Available Location",
            `Could only achieve ${Math.round(
              bestLocation.coords.accuracy,
            )} meters accuracy`,
          );

          break;
        }

        // WAIT 2 SECONDS
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to fetch location");
    } finally {
      setLoading(false);
    }
  }; // SAVE AREA
  const continueHandler = async () => {
    try {
      if (
        !areaId.trim() ||
        !areaName.trim() ||
        !latitude.trim() ||
        !longitude.trim()
      ) {
        return Alert.alert("Missing Fields", "Please fill all required fields");
      }

      setLoading(true);
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return Alert.alert(
          "Invalid Latitude",
          "Latitude must be between -90 and 90",
        );
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return Alert.alert(
          "Invalid Longitude",
          "Longitude must be between -180 and 180",
        );
      }

      // INSERT AREA
      await db.runAsync(
        `
        INSERT INTO areas (
  project_id,
  areaId,
  area_name,
  latitude,
  longitude,
  status,
  addedBy
)
VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          projectId,
          areaId.trim(),
          areaName.trim(),
          lat,
          lng,
          status,
          addedBy.trim(),
        ],
      );

      // GET AREA
      const result = await db.getFirstAsync(
        `
          SELECT *
          FROM areas
          WHERE project_id = ?
          AND area_name = ?
          `,
        [projectId, areaName.trim()],
      );

      // NAVIGATE
      navigation.replace("SensorScreen", {
        projectId,
        projectName,

        areaId: result.id,
        areaName: result.area_name,
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Area Exists", "Area may already exist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      style={{
        backgroundColor: "#EEF3F4",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            flex: 1,
          }}
          className="px-5 pt-16"
        >
          {/* HEADER */}
          <Text
            className="text-4xl font-bold"
            style={{
              color: "#111827",
            }}
          >
            New Area
          </Text>

          <Text
            className="mt-2 text-sm"
            style={{
              color: "#6B7280",
            }}
          >
            {projectName}
          </Text>

          {/* MAIN CARD */}
          <View
            className="mt-10 rounded-[32px] p-5"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              elevation: 2,
            }}
          >
            {/* AREA ID */}
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: "#6B7280",
              }}
            >
              Area ID
            </Text>

            <TextInput
              placeholder="AREA-001"
              value={areaId}
              onChangeText={setAreaId}
              className="mb-4 rounded-full px-5 py-4"
              style={{
                backgroundColor: "#F3F7F8",
              }}
            />

            {/* AREA NAME */}
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: "#6B7280",
              }}
            >
              Area Name
            </Text>

            <TextInput
              placeholder="North Sector"
              value={areaName}
              onChangeText={setAreaName}
              className="mb-4 rounded-full px-5 py-4"
              style={{
                backgroundColor: "#F3F7F8",
              }}
            />
            <Pressable
              onPress={fetchLocation}
              className="mb-4 rounded-full py-4 active:scale-95"
              style={{
                backgroundColor: "#DDF4F5",
              }}
            >
              <Text className="text-center font-semibold">
                {loading ? "Fetching GPS..." : "📍 Fetch Current Location"}
              </Text>
            </Pressable>
            {/* LATITUDE */}
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: "#6B7280",
              }}
            >
              Latitude
            </Text>

            <TextInput
              placeholder="28.6139"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
              className="mb-4 rounded-full px-5 py-4"
              style={{
                backgroundColor: "#F3F7F8",
              }}
            />

            {/* LONGITUDE */}
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: "#6B7280",
              }}
            >
              Longitude
            </Text>

            <TextInput
              placeholder="77.2090"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
              className="mb-4 rounded-full px-5 py-4"
              style={{
                backgroundColor: "#F3F7F8",
              }}
            /> 

            {/* ADDED BY */}
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: "#6B7280",
              }}
            >
              Added By
            </Text>

            <TextInput
              placeholder="Admin"
              value={addedBy}
              onChangeText={setAddedBy}
              className="rounded-full px-5 py-4"
              style={{
                backgroundColor: "#F3F7F8",
              }}
            />
          </View>
          {/* PRIMARY BUTTON */}
          <Pressable
            onPress={continueHandler}
            disabled={loading}
            className="mt-8 rounded-full py-4 active:scale-95"
            style={{
              backgroundColor: "#0F9BA8",

              shadowColor: "#0F9BA8",

              shadowOpacity: 0.18,

              shadowRadius: 8,

              shadowOffset: {
                width: 0,
                height: 4,
              },

              elevation: 4,
            }}
          >
            <Text className="text-center text-base font-semibold text-white">
              {loading ? "Creating..." : "Continue"}
            </Text>
          </Pressable>

          {/* SECONDARY BUTTON */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-4 rounded-full py-4 active:scale-95"
            style={{
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              className="text-center text-sm font-semibold"
              style={{
                color: "#111827",
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
