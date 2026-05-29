import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { db } from "../database/database";

export default function AddAreaScreen({
  navigation,
  route,
}) {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  // ROUTE PARAMS
  const {
    projectId,
    projectName,
  } = route.params;

  const [areaName, setAreaName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // SCREEN ANIMATION
  useEffect(() => {

    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

  }, []);

  // SAVE AREA
  const continueHandler = async () => {

    try {

      if (!areaName.trim()) {

        return Alert.alert(
          "Missing Area Name",
          "Please enter area name"
        );
      }

      setLoading(true);

      // INSERT AREA
      await db.runAsync(
        `
        INSERT INTO areas (
          project_id,
          area_name
        )
        VALUES (?, ?)
        `,
        [projectId, areaName.trim()]
      );

      // GET AREA
      const result =
        await db.getFirstAsync(
          `
          SELECT *
          FROM areas
          WHERE project_id = ?
          AND area_name = ?
          `,
          [projectId, areaName.trim()]
        );

      // NAVIGATE
      navigation.replace(
        "SensorScreen",
        {
          projectId,
          projectName,

          areaId: result.id,
          areaName:
            result.area_name,
        }
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Area Exists",
        "Area may already exist"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }

      className="flex-1"

      style={{
        backgroundColor: "#EEF3F4",
      }}
    >

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

          {/* LABEL */}
          <Text
            className="mb-3 text-sm font-medium"
            style={{
              color: "#6B7280",
            }}
          >
            Area Name
          </Text>

          {/* INPUT */}
          <TextInput
            placeholder="Enter area name"

            placeholderTextColor="#9CA3AF"

            value={areaName}

            onChangeText={setAreaName}

            className="rounded-full px-5 py-4 text-base"

            style={{
              backgroundColor: "#F3F7F8",
              color: "#111827",
            }}
          />

          {/* DESCRIPTION */}
          <Text
            className="mt-4 text-xs leading-5"

            style={{
              color: "#94A3B8",
            }}
          >
            Create a monitoring area to
            organize sensors and tracking.
          </Text>

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
            {
              loading
                ? "Creating..."
                : "Continue"
            }
          </Text>

        </Pressable>

        {/* SECONDARY BUTTON */}
        <Pressable
          onPress={() =>
            navigation.goBack()
          }

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

    </KeyboardAvoidingView>
  );
}