import React, {
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";

import {
  useRef,
  useEffect,
} from "react";

import axios from "axios";

import db from "../database/database";

export default function SyncData() {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const [loading, setLoading] =
    useState(false);

  const [syncedCount, setSyncedCount] =
    useState(0);

  // SCREEN ANIMATION
  useEffect(() => {

    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

  }, []);

  // SYNC FUNCTION
  const syncToBackend = async () => {

    try {

      setLoading(true);

      // FETCH UNSYNCED DATA
      const result = db.getAllSync(
        `
        SELECT *
        FROM scanned_data
        WHERE syncedCloud = 0
        `
      );

      console.log(result);

      // NO DATA
      if (result.length === 0) {

        Alert.alert(
          "Already Synced",
          "No new data available"
        );

        return;
      }

      // SEND TO BACKEND
      const response =
        await axios.post(
          "http://192.168.88.11:3000/sync",
          {
            data: result,
          }
        );

      console.log(response.data);

      // UPDATE STATUS
      result.forEach((item) => {

        db.runSync(
          `
          UPDATE scanned_data
          SET syncedCloud = 1
          WHERE id = ?
          `,
          [item.id]
        );

      });

      setSyncedCount(result.length);

      Alert.alert(
        "Sync Complete",
        `${result.length} records synced successfully`
      );

    } catch (error) {

      console.log(
        error?.response?.data || error
      );

      Alert.alert(
        "Sync Failed",
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <View
      className="flex-1 px-5 pt-16"

      style={{
        backgroundColor: "#EEF3F4",
      }}
    >

      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
        }}
      >

        {/* HEADER */}
        <Text
          className="text-4xl font-bold"

          style={{
            color: "#111827",
          }}
        >
          Cloud Sync
        </Text>

        <Text
          className="mt-2 text-sm"

          style={{
            color: "#6B7280",
          }}
        >
          Upload local sensor data to cloud
        </Text>

        {/* STATUS CARD */}
        <View
          className="mt-10 rounded-[32px] p-6"

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

          {/* ICON */}
          <View
            className="h-16 w-16 items-center justify-center rounded-full self-center"

            style={{
              backgroundColor: "#DDF4F5",
            }}
          >

            <Text
              className="text-2xl"
            >
              ☁️
            </Text>

          </View>

          {/* TITLE */}
          <Text
            className="mt-5 text-center text-xl font-semibold"

            style={{
              color: "#111827",
            }}
          >
            Sync Sensor Data
          </Text>

          {/* DESCRIPTION */}
          <Text
            className="mt-3 text-center text-sm leading-6"

            style={{
              color: "#6B7280",
            }}
          >
            Securely transfer locally stored
            sensor information to your backend server.
          </Text>

          {/* STATS */}
          <View
            className="mt-6 rounded-[24px] p-4"

            style={{
              backgroundColor: "#F3F7F8",
            }}
          >

            <Text
              className="text-center text-xs"

              style={{
                color: "#94A3B8",
              }}
            >
              LAST SESSION
            </Text>

            <Text
              className="mt-2 text-center text-3xl font-bold"

              style={{
                color: "#0F9BA8",
              }}
            >
              {syncedCount}
            </Text>

            <Text
              className="mt-1 text-center text-sm"

              style={{
                color: "#6B7280",
              }}
            >
              Records Synced
            </Text>

          </View>

        </View>

        {/* BUTTONS */}
        <View className="mt-8">

          {/* MAIN BUTTON */}
          <Pressable
            onPress={syncToBackend}

            disabled={loading}

            className="rounded-full py-4 active:scale-95"

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

            {
              loading ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <Text className="text-center text-base font-semibold text-white">
                  Sync Now
                </Text>

              )
            }

          </Pressable>

          {/* SECONDARY BUTTON */}
          <Pressable
            onPress={() =>
              Alert.alert(
                "Server",
                "Backend connection ready"
              )
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
              Check Connection
            </Text>

          </Pressable>

        </View>

      </Animated.View>

    </View>
  );
}